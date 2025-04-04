import { db } from "@/db/drizzle";
import { ticketSectors } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const ticketSectorsRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const data = await db.select().from(ticketSectors);

    return data;
  }),
});
