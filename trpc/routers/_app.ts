import { categoriesRouter } from "@/trpc/procedures/categories/procedures";
import { createTRPCRouter } from "@/trpc/init";
import { ticketSectorsRouter } from "@/trpc/procedures/ticket-sectors/procedures";
import { producerEventsRouter } from "@/trpc/procedures/producer-events/procedures";
import { userEventsRouter } from "@/trpc/procedures/user-events/procedures";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  ticketSectors: ticketSectorsRouter,
  userEvents: userEventsRouter,
  producerEvents: producerEventsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
