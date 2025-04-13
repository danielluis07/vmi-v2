import { categoriesRouter } from "@/trpc/procedures/categories/procedures";
import { createTRPCRouter } from "@/trpc/init";
import { ticketSectorsRouter } from "@/trpc/procedures/ticket-sectors/procedures";
import { eventsRouter } from "@/trpc/procedures/events/procedures";
import { usersRouter } from "@/trpc/procedures/users/procedures";
import { mercadoPagoRouter } from "@/trpc/procedures/mercado-pago/procedures";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  ticketSectors: ticketSectorsRouter,
  events: eventsRouter,
  users: usersRouter,
  mercadoPago: mercadoPagoRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
