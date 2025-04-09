import { z } from "zod";
import { db } from "@/db/drizzle";
import { events, tickets } from "@/db/schema";
import { createUserEventSchema, updateUserEventSchema } from "@/schemas";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { deleteFromS3 } from "@/lib/s3-upload";
import { and, desc, eq } from "drizzle-orm";
import { generateSlug } from "@/lib/utils";

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

export const userEventsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createUserEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      const slug = generateSlug(input.title);

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
  update: protectedProcedure
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
        status: "ACTIVE",
        mode: input.mode,
        city: input.city || null,
        province: input.province || null,
        address: input.address || null,
        categoryId: input.categoryId,
        uf: input.uf || null,
        date: input.date,
      };

      // Add slug if title changed
      if (input.title !== existingEvent.title) {
        updatedData.slug = generateSlug(input.title);
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
  delete: protectedProcedure
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
});
