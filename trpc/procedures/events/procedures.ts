import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  events,
  producerEvents,
  eventDays,
  batches,
  tickets,
  categories,
  ticketSectors,
} from "@/db/schema";
import {
  createProducerEventSchema,
  createUserEventSchema,
  updateProducerEventSchema,
  updateUserEventSchema,
} from "@/schemas";
import {
  protectedProcedure,
  createTRPCRouter,
  baseProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { deleteFromS3 } from "@/lib/s3-upload";
import { and, desc, eq, ne } from "drizzle-orm";
import { generateSlug } from "@/lib/utils";

type UpdatedProducerEventData = {
  title: string;
  description: string | null;
  image: string;
  status: "ACTIVE" | "INACTIVE" | "ENDED";
  mode: "ONLINE" | "IN_PERSON";
  city: string | null;
  province: string | null;
  address: string | null;
  categoryId: string;
  map: string | null;
  uf: string | null;
  slug?: string;
};

type UpdatedUserEventData = {
  title: string;
  description: string | null;
  image: string;
  status: "ACTIVE" | "INACTIVE" | "ENDED";
  mode: "ONLINE" | "IN_PERSON";
  city: string | null;
  province: string | null;
  address: string | null;
  categoryId: string;
  uf: string | null;
  date: Date;
  slug?: string;
};

const generateUniqueSlug = async (title: string): Promise<string> => {
  let baseSlug = generateSlug(title); // Sua função existente
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const [existingEvent] = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, slug));

    if (!existingEvent) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

const generateUpdatedSlug = async (
  title: string,
  currentEventId: string
): Promise<string> => {
  let baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const [existingSlug] = await db
      .select({ id: events.id })
      .from(events)
      .where(and(eq(events.slug, slug), ne(events.id, currentEventId)));

    if (!existingSlug) {
      return slug; // Slug está livre
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

export const eventsRouter = createTRPCRouter({
  createProducerEvent: protectedProcedure
    .input(createProducerEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const slug = await generateUniqueSlug(input.title);

      const uploadedFiles: string[] = [];

      const image = input.image as string;

      const imageFileName = image.split("/").pop();
      if (imageFileName) uploadedFiles.push(imageFileName);

      if (input.map) {
        const map = input.map as string | null;
        const mapFileName = map?.split("/").pop();
        if (mapFileName) uploadedFiles.push(mapFileName);
      }

      for (const day of input.days) {
        for (const batch of day.batches) {
          for (const ticket of batch.tickets) {
            if (ticket.file) {
              const ticketFile = ticket.file as string;
              const ticketFileName = ticketFile.split("/").pop();
              if (ticketFileName) uploadedFiles.push(ticketFileName);
            }
          }
        }
      }

      try {
        return await db.transaction(async (tx) => {
          const [event] = await tx
            .insert(events)
            .values({
              title: input.title,
              description: input.description || null,
              image: input.image as string,
              status: "ACTIVE",
              mode: input.mode as "ONLINE" | "IN_PERSON",
              city: input.city || null,
              province: input.province || null,
              address: input.address || null,
              categoryId: input.categoryId,
              map: (input.map as string) || null,
              uf: input.uf || null,
              date: null,
              organizerId: userId,
              slug: slug,
              creatorRole: "PRODUCER",
            })
            .returning({ id: events.id });

          if (!event?.id) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create event",
            });
          }

          await tx.insert(producerEvents).values({
            eventId: event.id,
            producerName: "Default Producer",
            showProducer: false,
            producerDescription: null,
          });

          for (const day of input.days) {
            const [eventDay] = await tx
              .insert(eventDays)
              .values({
                eventId: event.id,
                date: day.date,
                startTime: day.startTime,
                endTime: day.endTime,
              })
              .returning({ id: eventDays.id });

            if (!eventDay?.id) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create event day",
              });
            }

            for (const batch of day.batches) {
              const [batchResult] = await tx
                .insert(batches)
                .values({
                  eventId: event.id,
                  name: batch.name,
                  startTime: batch.startTime || null,
                  endTime: batch.endTime || null,
                })
                .returning({ id: batches.id });

              if (!batchResult?.id) {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to create batch",
                });
              }

              const ticketValues = batch.tickets.map((ticket) => ({
                eventId: event.id,
                batchId: batchResult.id,
                sectorId: ticket.sectorId,
                price: ticket.price || 0,
                quantity: ticket.quantity || 1,
                gender: ticket.gender as "MALE" | "FEMALE" | "UNISEX",
                file: ticket.file as string,
                obs: ticket.obs || null,
                status: "AVAILABLE" as "AVAILABLE" | "SOLD" | "CANCELLED",
                isNominal: false,
                buyerId: null,
              }));

              await tx.insert(tickets).values(ticketValues);
            }
          }

          return {
            eventId: event.id,
            success: true,
          };
        });
      } catch (error) {
        console.error("Erro ao criar evento:", error);

        // Delete all uploaded files from S3
        for (const fileName of uploadedFiles) {
          const { success, message } = await deleteFromS3(fileName);
          if (!success) {
            console.error(`Falha ao deletar ${fileName}: ${message}`);
          }
          console.log(`Deletado ${fileName} com sucesso`);
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar evento",
        });
      }
    }),
  updateProducerEvent: protectedProcedure
    .input(updateProducerEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID do evento não fornecido",
        });
      }

      const uploadedFiles: string[] = [];
      const deletedFiles: string[] = [];

      const image = input.image as string;
      const map = input.map as string | null;

      const [existingEvent] = await db
        .select()
        .from(events)
        .where(eq(events.id, input.id));

      if (!existingEvent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Evento não encontrado",
        });
      }

      // Buscar todos os ingressos antigos associados ao evento
      const existingTickets = await db
        .select()
        .from(tickets)
        .where(eq(tickets.eventId, input.id));

      const updatedData: UpdatedProducerEventData = {
        title: input.title,
        description: input.description || null,
        image: image,
        status: input.status,
        mode: input.mode,
        city: input.city || null,
        province: input.province || null,
        address: input.address || null,
        categoryId: input.categoryId,
        map: map || null,
        uf: input.uf || null,
      };

      if (input.title !== existingEvent.title) {
        updatedData.slug = await generateUpdatedSlug(input.title, input.id);
      }

      try {
        return await db.transaction(async (tx) => {
          // Atualizar o evento
          await tx
            .update(events)
            .set(updatedData)
            .where(
              and(eq(events.id, input.id), eq(events.organizerId, userId))
            );

          // Comparar image e map para rastrear arquivos novos e antigos
          if (image !== existingEvent.image) {
            const oldImageFileName = existingEvent.image.split("/").pop();
            if (oldImageFileName) deletedFiles.push(oldImageFileName);
            const newImageFileName = image.split("/").pop();
            if (newImageFileName) uploadedFiles.push(newImageFileName);
          }
          if (map !== existingEvent.map) {
            if (existingEvent.map) {
              const oldMapFileName = existingEvent.map.split("/").pop();
              if (oldMapFileName) deletedFiles.push(oldMapFileName);
            }
            if (map) {
              const newMapFileName = map.split("/").pop();
              if (newMapFileName) uploadedFiles.push(newMapFileName);
            }
          }

          // Deletar dias antigos
          await tx.delete(eventDays).where(eq(eventDays.eventId, input.id));
          // Deletar lotes antigos
          await tx.delete(batches).where(eq(batches.eventId, input.id));

          // Mapear tickets existentes por batchId e outros identificadores únicos
          const existingTicketsMap = new Map(
            existingTickets.map((ticket) => [ticket.id, ticket])
          );

          // Criar novos dias e lotes
          for (const day of input.days) {
            const [eventDay] = await tx
              .insert(eventDays)
              .values({
                eventId: input.id,
                date: day.date,
                startTime: day.startTime,
                endTime: day.endTime,
              })
              .returning({ id: eventDays.id });

            if (!eventDay?.id) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create event day",
              });
            }

            for (const batch of day.batches) {
              const [batchResult] = await tx
                .insert(batches)
                .values({
                  eventId: input.id,
                  name: batch.name,
                  startTime: batch.startTime || null,
                  endTime: batch.endTime || null,
                })
                .returning({ id: batches.id });

              if (!batchResult?.id) {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to create batch",
                });
              }

              const ticketValues = [];
              for (const ticket of batch.tickets) {
                const ticketUrl = ticket.file as string;
                const newFileName = ticketUrl.split("/").pop();

                // Verificar se o ticket já existe (por exemplo, por um ID ou outro critério único)
                const existingTicket = ticket.id
                  ? existingTicketsMap.get(ticket.id)
                  : null;

                if (existingTicket) {
                  // Atualizar ticket existente apenas se necessário
                  if (existingTicket.file !== ticketUrl) {
                    const oldFileName = existingTicket.file.split("/").pop();
                    if (oldFileName) deletedFiles.push(oldFileName);
                    if (newFileName) uploadedFiles.push(newFileName);
                  }
                  await tx
                    .update(tickets)
                    .set({
                      sectorId: ticket.sectorId,
                      price: ticket.price || 0,
                      quantity: ticket.quantity || 1,
                      gender: ticket.gender as "MALE" | "FEMALE" | "UNISEX",
                      file: ticketUrl,
                      obs: ticket.obs || null,
                    })
                    .where(eq(tickets.id, existingTicket.id));
                } else {
                  // Novo ticket
                  if (newFileName) uploadedFiles.push(newFileName);
                  ticketValues.push({
                    eventId: input.id,
                    batchId: batchResult.id,
                    sectorId: ticket.sectorId,
                    price: ticket.price || 0,
                    quantity: ticket.quantity || 1,
                    gender: ticket.gender as "MALE" | "FEMALE" | "UNISEX",
                    file: ticketUrl,
                    obs: ticket.obs || null,
                    status: "AVAILABLE" as "AVAILABLE" | "SOLD" | "CANCELLED",
                    isNominal: false,
                    buyerId: null,
                  });
                }
              }

              if (ticketValues.length > 0) {
                await tx.insert(tickets).values(ticketValues);
              }
            }
          }

          // Deletar arquivos antigos no S3
          for (const fileName of deletedFiles) {
            const { success, message } = await deleteFromS3(fileName);
            if (!success) {
              console.error(`Falha ao deletar ${fileName}: ${message}`);
            }
          }

          return {
            eventId: input.id,
            success: true,
          };
        });
      } catch (error) {
        console.error("Erro ao atualizar evento:", error);

        // Rollback: deletar arquivos novos no S3 em caso de erro
        for (const fileName of uploadedFiles) {
          const { success, message } = await deleteFromS3(fileName);
          if (!success) {
            console.error(`Falha ao deletar ${fileName}: ${message}`);
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar evento",
        });
      }
    }),
  deleteProducerEvent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      // Buscar o evento e os arquivos associados antes de deletar
      const [existingEvent] = await db
        .select({
          image: events.image,
          map: events.map,
        })
        .from(events)
        .where(and(eq(events.id, input.id), eq(events.organizerId, userId)));

      if (!existingEvent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Evento não encontrado",
        });
      }

      // Buscar todos os arquivos dos ingressos associados ao evento
      const ticketFiles = await db
        .select({ file: tickets.file })
        .from(tickets)
        .where(eq(tickets.eventId, input.id));

      // Preparar lista de arquivos para exclusão no S3
      const filesToDelete: string[] = [];

      // Adicionar image e map, se existirem
      if (existingEvent.image) {
        const imageFileName = existingEvent.image.split("/").pop();
        if (imageFileName) filesToDelete.push(imageFileName);
      }
      if (existingEvent.map) {
        const mapFileName = existingEvent.map.split("/").pop();
        if (mapFileName) filesToDelete.push(mapFileName);
      }

      // Adicionar arquivos dos ingressos
      ticketFiles.forEach((ticket) => {
        const fileName = ticket.file.split("/").pop();
        if (fileName) filesToDelete.push(fileName);
      });

      try {
        // Deletar o evento (o cascade nas tabelas cuidará de eventDays, batches e tickets)
        const [removedEvent] = await db
          .delete(events)
          .where(and(eq(events.id, input.id), eq(events.organizerId, userId)))
          .returning();

        if (!removedEvent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao deletar o evento",
          });
        }

        // Deletar arquivos no S3 em paralelo
        if (filesToDelete.length > 0) {
          const deletePromises = filesToDelete.map((fileName) =>
            deleteFromS3(fileName).then(({ success, message }) => {
              if (!success) {
                console.error(`Falha ao deletar ${fileName}: ${message}`);
              } else {
                console.log(`Deletado ${fileName} com sucesso`);
              }
            })
          );
          await Promise.all(deletePromises);
        }

        return { success: true };
      } catch (error) {
        console.error("Erro ao deletar evento e arquivos:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao deletar evento e arquivos associados",
        });
      }
    }),
  getProducerEvent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      const [event] = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          image: events.image,
          status: events.status,
          mode: events.mode,
          city: events.city,
          province: events.province,
          address: events.address,
          categoryId: events.categoryId,
          map: events.map,
          uf: events.uf,
        })
        .from(events)
        .where(and(eq(events.id, input.id), eq(events.organizerId, userId)));

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Evento não encontrado",
        });
      }

      const days = await db
        .select({
          date: eventDays.date,
          startTime: eventDays.startTime,
          endTime: eventDays.endTime,
        })
        .from(eventDays)
        .where(eq(eventDays.eventId, input.id));

      const daysWithBatches = await Promise.all(
        days.map(async (day) => {
          const batchesData = await db
            .select({
              id: batches.id,
              name: batches.name,
              startTime: batches.startTime,
              endTime: batches.endTime,
            })
            .from(batches)
            .where(eq(batches.eventId, input.id));

          const batchesWithTickets = await Promise.all(
            batchesData.map(async (batch) => {
              const ticketsData = await db
                .select({
                  sectorId: tickets.sectorId,
                  price: tickets.price,
                  quantity: tickets.quantity,
                  gender: tickets.gender,
                  file: tickets.file,
                  obs: tickets.obs,
                })
                .from(tickets)
                .where(eq(tickets.batchId, batch.id));

              return { ...batch, tickets: ticketsData };
            })
          );

          return { ...day, batches: batchesWithTickets };
        })
      );

      return {
        ...event,
        days: daysWithBatches,
      };
    }),
  createUserEvent: protectedProcedure
    .input(createUserEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      const slug = await generateUniqueSlug(input.title);

      const uploadedFiles: string[] = [];

      const image = input.image as string;

      const imageFileName = image.split("/").pop();
      if (imageFileName) uploadedFiles.push(imageFileName);

      const ticketFile = input.ticket.file as string;
      const ticketFileName = ticketFile.split("/").pop();
      if (ticketFileName) uploadedFiles.push(ticketFileName);

      try {
        return await db.transaction(async (tx) => {
          const [event] = await tx
            .insert(events)
            .values({
              title: input.title,
              description: input.description || null,
              image: input.image as string,
              status: "ACTIVE",
              mode: input.mode as "ONLINE" | "IN_PERSON",
              city: input.city || null,
              province: input.province || null,
              address: input.address || null,
              categoryId: input.categoryId,
              uf: input.uf || null,
              date: input.date,
              slug: slug,
              organizerId: userId,
              creatorRole: "USER",
            })
            .returning({ id: events.id });

          if (!event?.id) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create event",
            });
          }

          await tx.insert(tickets).values({
            eventId: event.id,
            gender: input.ticket.gender as "MALE" | "FEMALE" | "UNISEX",
            price: input.ticket.price,
            sectorId: input.ticket.sectorId,
            quantity: input.ticket.quantity,
            obs: input.ticket.obs || null,
            file: input.ticket.file as string,
            status: "AVAILABLE" as "AVAILABLE" | "SOLD" | "CANCELLED",
          });

          return {
            eventId: event.id,
            success: true,
          };
        });
      } catch (error) {
        console.error("Erro ao criar evento:", error);

        for (const fileName of uploadedFiles) {
          const { success, message } = await deleteFromS3(fileName);
          if (!success) {
            console.error(`Falha ao deletar ${fileName}: ${message}`);
          }
          console.log(`Deletado ${fileName} com sucesso`);
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar evento",
        });
      }
    }),
  updateUserEvent: protectedProcedure
    .input(updateUserEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID do evento não fornecido",
        });
      }

      const uploadedFiles: string[] = [];
      const deletedFiles: string[] = [];

      const [existingEvent] = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          image: events.image,
          status: events.status,
          mode: events.mode,
          city: events.city,
          province: events.province,
          address: events.address,
          categoryId: events.categoryId,
          uf: events.uf,
          date: events.date,
          isNominal: tickets.isNominal,
          ticket: tickets,
        })
        .from(events)
        .innerJoin(tickets, eq(tickets.eventId, events.id))
        .where(and(eq(events.id, input.id), eq(events.organizerId, userId)));

      if (!existingEvent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Evento não encontrado",
        });
      }

      const image = input.image as string;
      const ticketFile = input.ticket.file as string;

      if (image !== existingEvent.image) {
        const oldImageFileName = existingEvent.image.split("/").pop();
        if (oldImageFileName) deletedFiles.push(oldImageFileName);
        const newImageFileName = image.split("/").pop();
        if (newImageFileName) uploadedFiles.push(newImageFileName);
      }

      if (ticketFile !== existingEvent.ticket.file) {
        const oldTicketFileName = existingEvent.ticket.file.split("/").pop();
        if (oldTicketFileName) deletedFiles.push(oldTicketFileName);
        const newTicketFileName = ticketFile.split("/").pop();
        if (newTicketFileName) uploadedFiles.push(newTicketFileName);
      }

      const updatedData: UpdatedUserEventData = {
        title: input.title,
        description: input.description || null,
        image: input.image as string,
        status: input.status,
        mode: input.mode,
        city: input.city || null,
        province: input.province || null,
        address: input.address || null,
        categoryId: input.categoryId,
        uf: input.uf || null,
        date: input.date,
      };

      // Adicionar slug se o título mudou
      if (input.title !== existingEvent.title) {
        updatedData.slug = await generateUpdatedSlug(input.title, input.id);
      }

      try {
        // Usando transação
        await db.transaction(async (tx) => {
          // Atualizar evento
          await tx
            .update(events)
            .set(updatedData)
            .where(eq(events.id, input.id));

          // Atualizar ticket (exemplo, ajuste conforme seus campos)
          await tx
            .update(tickets)
            .set({
              file: ticketFile,
              gender: input.ticket.gender as
                | "MALE"
                | "FEMALE"
                | "UNISEX"
                | undefined,
              price: input.ticket.price,
              sectorId: input.ticket.sectorId,
              quantity: input.ticket.quantity,
              obs: input.ticket.obs,
              isNominal: input.ticket.isNominal || existingEvent.isNominal,
            })
            .where(eq(tickets.eventId, input.id));
        });

        // Deletar arquivos antigos no S3
        for (const fileName of deletedFiles) {
          const { success, message } = await deleteFromS3(fileName);
          if (!success) {
            console.error(`Falha ao deletar ${fileName}: ${message}`);
          }
        }

        return {
          eventId: input.id,
          success: true,
        };
      } catch (error) {
        console.error("Erro ao atualizar evento:", error);

        // Rollback: deletar arquivos novos no S3 em caso de erro
        for (const fileName of uploadedFiles) {
          const { success, message } = await deleteFromS3(fileName);
          if (!success) {
            console.error(`Falha ao deletar ${fileName}: ${message}`);
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar evento",
        });
      }
    }),
  deleteUserEvent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      // Buscar o evento e os arquivos associados antes de deletar
      const [existingEvent] = await db
        .select({
          image: events.image,
          map: events.map,
        })
        .from(events)
        .where(and(eq(events.id, input.id), eq(events.organizerId, userId)));

      if (!existingEvent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Evento não encontrado",
        });
      }

      // Buscar todos os arquivos dos ingressos associados ao evento
      const ticketFiles = await db
        .select({ file: tickets.file })
        .from(tickets)
        .where(eq(tickets.eventId, input.id));

      // Preparar lista de arquivos para exclusão no S3
      const filesToDelete: string[] = [];

      // Adicionar image, se existir
      if (existingEvent.image) {
        const imageFileName = existingEvent.image.split("/").pop();
        if (imageFileName) filesToDelete.push(imageFileName);
      }

      // Adicionar arquivos dos ingressos
      ticketFiles.forEach((ticket) => {
        const fileName = ticket.file.split("/").pop();
        if (fileName) filesToDelete.push(fileName);
      });

      try {
        const [removedEvent] = await db
          .delete(events)
          .where(and(eq(events.id, input.id), eq(events.organizerId, userId)))
          .returning();

        if (!removedEvent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao deletar o evento",
          });
        }

        // Deletar arquivos no S3 em paralelo
        if (filesToDelete.length > 0) {
          const deletePromises = filesToDelete.map((fileName) =>
            deleteFromS3(fileName).then(({ success, message }) => {
              if (!success) {
                console.error(`Falha ao deletar ${fileName}: ${message}`);
              } else {
                console.log(`Deletado ${fileName} com sucesso`);
              }
            })
          );
          await Promise.all(deletePromises);
        }

        return { success: true };
      } catch (error) {
        console.error("Erro ao deletar evento e arquivos:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao deletar evento e arquivos associados",
        });
      }
    }),
  getUserEvent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      const [event] = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          image: events.image,
          status: events.status,
          mode: events.mode,
          city: events.city,
          province: events.province,
          address: events.address,
          categoryId: events.categoryId,
          uf: events.uf,
          date: events.date,
          isNominal: tickets.isNominal,
          ticket: tickets,
        })
        .from(events)
        .innerJoin(tickets, eq(tickets.eventId, events.id))
        .where(and(eq(events.id, input.id), eq(events.organizerId, userId)));

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Evento não encontrado",
        });
      }

      return event;
    }),
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Usuário não autenticado",
      });
    }

    const data = await db
      .select()
      .from(events)
      .where(eq(events.organizerId, userId))
      .orderBy(desc(events.createdAt));

    return data;
  }),
  getBySlug: baseProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      if (!input.slug) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Slug is required",
        });
      }

      const [event] = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          image: events.image,
          mode: events.mode,
          city: events.city,
          province: events.province,
          address: events.address,
          map: events.map,
          uf: events.uf,
          date: events.date,
          ticket: tickets,
        })
        .from(events)
        .innerJoin(categories, eq(events.categoryId, categories.id))
        .leftJoin(tickets, eq(events.id, tickets.eventId))
        .where(eq(events.slug, input.slug));

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Evento não encontrado",
        });
      }

      const days = await db
        .select({
          date: eventDays.date,
          startTime: eventDays.startTime,
          endTime: eventDays.endTime,
        })
        .from(eventDays)
        .where(eq(eventDays.eventId, event.id));

      const daysWithBatches = await Promise.all(
        days.map(async (day) => {
          const batchesData = await db
            .select({
              id: batches.id,
              name: batches.name,
              startTime: batches.startTime,
              endTime: batches.endTime,
            })
            .from(batches)
            .where(eq(batches.eventId, event.id));

          const batchesWithTickets = await Promise.all(
            batchesData.map(async (batch) => {
              const ticketsData = await db
                .select({
                  sector: ticketSectors.name,
                  price: tickets.price,
                  quantity: tickets.quantity,
                  gender: tickets.gender,
                  obs: tickets.obs,
                })
                .from(tickets)
                .innerJoin(
                  ticketSectors,
                  eq(tickets.sectorId, ticketSectors.id)
                )
                .where(eq(tickets.batchId, batch.id));

              return { ...batch, tickets: ticketsData };
            })
          );

          return { ...day, batches: batchesWithTickets };
        })
      );

      return {
        ...event,
        days: daysWithBatches,
      };
    }),
});
