import { db } from "@/db/drizzle";
import {
  events,
  producerEvents,
  eventDays,
  batches,
  tickets,
} from "@/db/schema";
import { createProducerEventSchema } from "@/schemas";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { deleteFromS3 } from "@/lib/s3-upload";

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
              categoryId: input.categoryId || null,
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
});
