import {
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["ADMIN", "USER", "PRODUCER"]);

export const ticketStatus = pgEnum("ticket_status", [
  "AVAILABLE",
  "SOLD",
  "CANCELLED",
]);

export const ticketGender = pgEnum("ticket_gender", [
  "MALE",
  "FEMALE",
  "UNISEX",
]);

export const paymentStatus = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "CANCELLED",
]);

export const eventStatus = pgEnum("event_status", [
  "ACTIVE",
  "INACTIVE",
  "ENDED",
]);

export const eventMode = pgEnum("event_mode", ["ONLINE", "IN_PERSON"]);

export const eventCreatorRole = pgEnum("event_creator_role", [
  "USER",
  "PRODUCER",
]);

// tables

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: varchar("password", { length: 255 }),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  cpfCnpj: varchar("cpf_cnpj", { length: 255 }),
  phone: varchar("phone", { length: 255 }),
  role: userRole("role"),
  mpAccessToken: text("mp_access_token"),
  mpUserId: text("mp_user_id"),
  mpPublicKey: text("mp_public_key"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const ticketSectors = pgTable("ticket_sectors", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const events = pgTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  categoryId: text("category_id")
    .references(() => categories.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image").notNull(),
  status: eventStatus("status").notNull(),
  mode: eventMode("mode").notNull(),
  city: text("city"),
  province: text("province"),
  address: text("address"),
  uf: text("uf"),
  date: timestamp("date", { withTimezone: true }),
  map: text("map"),
  slug: text("slug").unique(),
  creatorRole: eventCreatorRole("creator_role"),
  organizerId: text("organizer_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const producerEvents = pgTable("producer_events", {
  eventId: text("event_id")
    .primaryKey()
    .references(() => events.id, { onDelete: "cascade" }),
  producerName: text("producer_name").notNull(),
  showProducer: boolean("show_producer").default(false),
  producerDescription: text("producer_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const eventDays = pgTable("event_days", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text("event_id").references(() => producerEvents.eventId, {
    onDelete: "cascade",
  }),
  date: timestamp("date", { withTimezone: true }).notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const batches = pgTable("batches", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text("event_id").references(() => events.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text("event_id").references(() => events.id, {
    onDelete: "cascade",
  }),
  batchId: text("batch_id").references(() => batches.id, {
    onDelete: "cascade",
  }),
  buyerId: text("buyer_id").references(() => users.id, {
    onDelete: "set null",
  }),
  price: integer("price").notNull(),
  isNominal: boolean("is_nominal").default(false).notNull(),
  gender: ticketGender("gender").notNull(),
  status: ticketStatus("status"),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }),
  quantity: integer("quantity").notNull(),
  sectorId: text("sector_id")
    .references(() => ticketSectors.id)
    .notNull(),
  obs: text("obs"),
  qrCode: text("qr_code").unique(),
  file: text("file").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const ticketPurchases = pgTable("ticket_purchases", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }).defaultNow(),
  paymentStatus: paymentStatus("payment_status"),
  paymentMethod: text("payment_method"),
  totalPrice: integer("total_price").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
