import { updateUserSchema } from "@/schemas";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { users } from "@/db/schema";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";

export const usersRouter = createTRPCRouter({
  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      const [updateUser] = await db
        .update(users)
        .set({
          name: input.name,
          email: input.email,
          cpfCnpj: input.cpfCnpj,
          phone: input.phone,
        })
        .where(eq(users.id, userId))
        .returning({ id: users.id });

      if (!updateUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      return updateUser;
    }),
  getOne: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Usuário não autenticado",
      });
    }

    const [user] = await db
      .select({
        name: users.name,
        email: users.email,
        cpfCnpj: users.cpfCnpj,
        phone: users.phone,
        mpUserId: users.mpUserId,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Evento não encontrado",
      });
    }

    return user;
  }),
});
