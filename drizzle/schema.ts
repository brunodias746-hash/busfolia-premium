import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, time } from "drizzle-orm/mysql-core";

// ─── Users (Admin) ───
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Events ───
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: varchar("eventDate", { length: 100 }).notNull(),
  bannerUrl: varchar("bannerUrl", { length: 512 }),
  priceCents: int("priceCents").notNull(),
  feeCents: int("feeCents").notNull().default(0),
  packagePriceCents: int("packagePriceCents"),
  packageLabel: varchar("packageLabel", { length: 255 }),
  capacity: int("capacity").notNull().default(200),
  soldCount: int("soldCount").notNull().default(0),
  groupLink: varchar("groupLink", { length: 512 }),
  status: mysqlEnum("status", ["draft", "active", "sold_out", "finished"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Boarding Points ───
export const boardingPoints = mysqlTable("boarding_points", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  locationName: varchar("locationName", { length: 255 }).notNull(),
  meetingTime: varchar("meetingTime", { length: 10 }),
  departureTime: varchar("departureTime", { length: 10 }),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BoardingPoint = typeof boardingPoints.$inferSelect;
export type InsertBoardingPoint = typeof boardingPoints.$inferInsert;

// ─── Orders ───
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  shortId: varchar("shortId", { length: 12 }).notNull().unique(),
  eventId: int("eventId").notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerCpf: varchar("customerCpf", { length: 14 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  boardingPointId: int("boardingPointId").notNull(),
  transportDates: text("transportDates").notNull(), // JSON array of dates
  purchaseType: mysqlEnum("purchaseType", ["single", "multiple", "all_days"]).default("single").notNull(),
  quantity: int("quantity").notNull().default(1),
  unitPriceCents: int("unitPriceCents").notNull(),
  feeCents: int("feeCents").notNull().default(0),
  totalAmountCents: int("totalAmountCents").notNull(),
  status: mysqlEnum("status", ["pending", "pending_checkout", "paid", "failed", "canceled"]).default("pending_checkout").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["card", "pix_manual"]).default("card").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── Passengers ───
export const passengers = mysqlTable("passengers", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull(),
  boardingPointId: int("boardingPointId").notNull(),
  checkInStatus: mysqlEnum("checkInStatus", ["pending", "checked_in"]).default("pending").notNull(),
  checkInAt: timestamp("checkInAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Passenger = typeof passengers.$inferSelect;
export type InsertPassenger = typeof passengers.$inferInsert;

// ─── Payments ───
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  method: varchar("method", { length: 50 }),
  amountReceivedCents: int("amountReceivedCents"),
  feeStripeCents: int("feeStripeCents"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
