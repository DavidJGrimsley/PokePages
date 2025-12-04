import { pgTable, uuid, text, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { z } from "zod";
import { profiles } from "./profilesSchema.js";

/**
 * User Event Claims Table
 * Tracks which events users have marked as claimed/redeemed/caught
 * Used for tera raids, mystery gifts, promo codes, etc. (not participation counters)
 */
export const userEventClaims = pgTable("user_event_claims", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  eventKey: text("event_key").notNull(), // References event in config files (offline-first)
  claimed: boolean().default(false).notNull(),
  claimedAt: timestamp("claimed_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  unique("user_event_claims_user_id_event_key_key").on(table.userId, table.eventKey),
]);

// Type exports
export type UserEventClaim = typeof userEventClaims.$inferSelect;
export type NewUserEventClaim = typeof userEventClaims.$inferInsert;

// Zod Schemas for validation

/**
 * Schema for creating/updating a claim
 */
export const upsertClaimSchema = z.object({
  userId: z.string().uuid(),
  eventKey: z.string().min(1),
  claimed: z.boolean(),
  claimedAt: z.string().datetime().optional(),
});

/**
 * Schema for batch syncing claims
 */
export const batchSyncClaimsSchema = z.object({
  userId: z.string().uuid(),
  claims: z.array(z.object({
    eventKey: z.string().min(1),
    claimed: z.boolean(),
    claimedAt: z.string().datetime().optional(),
  })),
});
