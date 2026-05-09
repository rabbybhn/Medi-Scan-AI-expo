import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scanHistoryTable = pgTable("scan_history", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  primaryUse: text("primary_use").notNull(),
  approximatePrice: text("approximate_price").notNull(),
  generalInfo: text("general_info").notNull(),
  warnings: text("warnings").notNull(),
  identified: boolean("identified").default(false).notNull(),
  imageUrl: text("image_url"),
});

export const insertScanHistorySchema = createInsertSchema(scanHistoryTable).omit({
  id: true,
  createdAt: true,
});

export type InsertScanHistory = z.infer<typeof insertScanHistorySchema>;
export type ScanHistory = typeof scanHistoryTable.$inferSelect;
