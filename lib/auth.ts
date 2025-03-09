import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";
import { account, session, user, verification } from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      user: user,
      account: account,
      session: session,
      verification: verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    storeSessionInDatabase: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
      },
      cpfCnpj: {
        type: "string",
        returned: false,
      },
    },
  },
});
