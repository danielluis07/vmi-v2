import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db/drizzle";
import { TRPCError } from "@trpc/server";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const mercadoPagoRouter = createTRPCRouter({
  processCallback: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      const { code } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const res = await fetch("https://api.mercadopago.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
          client_secret: process.env.MP_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: process.env.NEXT_PUBLIC_MP_REDIRECT_URI,
        }),
      });

      console.log("Response from Mercado Pago:", res.status, res.statusText);

      const data = await res.json();

      if (!data.access_token) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No access token returned",
        });
      }

      await db
        .update(users)
        .set({
          mpAccessToken: data.access_token,
          mpRefreshToken: data.refresh_token,
          mpTokenExpiresIn: new Date(Date.now() + data.expires_in * 1000),
          mpLiveMode: data.live_mode,
          mpUserId: data.user_id,
          mpPublicKey: data.public_key,
        })
        .where(eq(users.id, userId));

      return { status: "ok" };
    }),
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    const updatedUser = await db
      .update(users)
      .set({
        mpAccessToken: null,
        mpRefreshToken: null,
        mpTokenExpiresIn: null,
        mpLiveMode: false,
        mpUserId: null,
        mpPublicKey: null,
      })
      .where(eq(users.id, userId));

    if (!updatedUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
  }),
});
