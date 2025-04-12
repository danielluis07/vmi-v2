import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  events,
  eventDays,
  batches,
  tickets,
  categories,
  ticketSectors,
} from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const publicEventsRouter = createTRPCRouter({
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
