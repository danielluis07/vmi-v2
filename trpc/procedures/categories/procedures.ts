import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const data = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories);

    return data;
  }),
});
