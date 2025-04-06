import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  events,
  producerEvents,
  eventDays,
  batches,
  tickets,
} from "@/db/schema";
import {
  createProducerEventSchema,
  updateProducerEventSchema,
} from "@/schemas";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { deleteFromS3 } from "@/lib/s3-upload";
import { and, desc, eq } from "drizzle-orm";

export const producerEventsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createProducerEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

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
  update: protectedProcedure
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
        .select({ file: tickets.file })
        .from(tickets)
        .where(eq(tickets.eventId, input.id));

      // Adicionar URLs antigas dos ingressos à lista de exclusão
      existingTickets.forEach((ticket) => {
        const oldFileName = ticket.file.split("/").pop();
        if (oldFileName) deletedFiles.push(oldFileName);
      });

      try {
        return await db.transaction(async (tx) => {
          // Atualizar o evento
          await tx
            .update(events)
            .set({
              title: input.title,
              description: input.description || null,
              image: image,
              status: "ACTIVE",
              mode: input.mode as "ONLINE" | "IN_PERSON",
              city: input.city || null,
              province: input.province || null,
              address: input.address || null,
              categoryId: input.categoryId,
              map: map || null,
              uf: input.uf || null,
            })
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
          // Deletar lotes antigos (necessário para consistência)
          await tx.delete(batches).where(eq(batches.eventId, input.id));
          // Deletar ingressos antigos (opcional, dependendo da lógica)
          await tx.delete(tickets).where(eq(tickets.eventId, input.id));

          // Criar novos dias, lotes e ingressos
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

              const ticketValues = batch.tickets.map((ticket) => {
                const ticketUrl = ticket.file as string;
                const newFileName = ticketUrl.split("/").pop();
                if (newFileName) uploadedFiles.push(newFileName); // Rastrear novos arquivos de ingressos
                return {
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
                };
              });

              await tx.insert(tickets).values(ticketValues);
            }
          }

          // Deletar arquivos antigos no S3
          for (const fileName of deletedFiles) {
            const { success, message } = await deleteFromS3(fileName);
            if (!success) {
              console.error(`Falha ao deletar ${fileName}: ${message}`);
            } else {
              console.log(`Deletado ${fileName} com sucesso`);
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
  getOne: protectedProcedure
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
});
