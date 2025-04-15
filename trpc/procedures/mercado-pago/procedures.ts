import { z } from "zod";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { db } from "@/db/drizzle";
import { TRPCError } from "@trpc/server";
import { events, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MercadoPagoConfig } from "mercadopago";
import { Preference } from "mercadopago";

export const mercadoPagoRouter = createTRPCRouter({
  createPayment: baseProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        email: z.string(),
        name: z.string(),
        tickets: z.array(
          z.object({
            ticketId: z.string(),
            eventId: z.string(),
            day: z.string().optional(),
            batchId: z.string().optional(),
            sectorName: z.string().optional(),
            sectorId: z.string(),
            gender: z.string().optional(),
            price: z.number(),
            quantity: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const { email, name } = input;

      const eventId = input.tickets[0].eventId;

      const [event] = await db
        .select({
          organizerId: events.organizerId,
        })
        .from(events)
        .where(eq(events.id, eventId));

      if (!event.organizerId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      const [user] = await db
        .select({
          mpAccessToken: users.mpAccessToken,
        })
        .from(users)
        .where(eq(users.id, event.organizerId));

      if (!user.mpAccessToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found or not connected",
        });
      }

      const client = new MercadoPagoConfig({
        accessToken: user.mpAccessToken,
      });

      const items = input.tickets.map((ticket) => ({
        id: ticket.ticketId,
        title: ticket.sectorName || "Ticket",
        description: ticket.eventId,
        quantity: ticket.quantity,
        unit_price: ticket.price / 100,
      }));

      const preference = new Preference(client);

      const body = {
        items,
        payer: {
          name,
          email,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment-failure`,
        },
        auto_return: "approved",
      };

      const res = await preference.create({ body });

      return { url: res.init_point };
    }),
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
