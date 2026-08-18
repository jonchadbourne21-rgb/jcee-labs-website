import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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

// Lead capture table for priority queue signups
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 64 }).default("homepage").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// Business inquiry form submissions
export const businessInquiries = mysqlTable("business_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  projectDescription: text("projectDescription").notNull(),
  budget: varchar("budget", { length: 64 }),
  timeline: varchar("timeline", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BusinessInquiry = typeof businessInquiries.$inferSelect;
export type InsertBusinessInquiry = typeof businessInquiries.$inferInsert;

// BidIndustrial — Materials pricing database
export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  trade: varchar("trade", { length: 64 }).notNull(), // hvac, electrical, plumbing, mechanical, general, commercial
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  unit: varchar("unit", { length: 64 }).notNull(), // linear ft, each, sq ft, lb, etc.
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  partNumber: varchar("partNumber", { length: 128 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

// BidIndustrial — Labor rates database
export const laborRates = mysqlTable("labor_rates", {
  id: int("id").autoincrement().primaryKey(),
  trade: varchar("trade", { length: 64 }).notNull(),
  role: varchar("role", { length: 128 }).notNull(), // Journeyman, Apprentice, Foreman, etc.
  hourlyRate: decimal("hourlyRate", { precision: 8, scale: 2 }).notNull(),
  overtimeRate: decimal("overtimeRate", { precision: 8, scale: 2 }).notNull(),
  region: varchar("region", { length: 128 }).default("National Avg").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LaborRate = typeof laborRates.$inferSelect;
export type InsertLaborRate = typeof laborRates.$inferInsert;
