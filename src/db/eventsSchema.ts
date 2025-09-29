import { pgTable, index, foreignKey, unique, pgPolicy, uuid, bigint, timestamp, text, integer, check, date } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { z } from "zod"

import { profiles } from "./profilesSchema";

export const userEventParticipation = pgTable("user_event_participation", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	eventId: uuid("event_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	contributionCount: bigint("contribution_count", { mode: "number" }).default(0),
	lastContributedAt: timestamp("last_contributed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_user_event_participation_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [eventCounters.id],
			name: "user_event_participation_event_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "user_event_participation_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_event_participation_user_id_event_id_key").on(table.userId, table.eventId),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("user_participation_upsert_own", { as: "permissive", for: "all", to: ["public"] }),
]);

export const anonymousEventParticipation = pgTable("anonymous_event_participation", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventId: uuid("event_id"),
	anonymousId: text("anonymous_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	contributionCount: bigint("contribution_count", { mode: "number" }).default(0),
	lastContributedAt: timestamp("last_contributed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [eventCounters.id],
			name: "anonymous_event_participation_event_id_fkey"
		}).onDelete("cascade"),
	unique("anonymous_event_participation_event_id_anonymous_id_key").on(table.eventId, table.anonymousId),
	pgPolicy("anon_participation_insert_all", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("anon_participation_select_all", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("anon_participation_update_all", { as: "permissive", for: "update", to: ["public"] }),
]);

export const eventCounters = pgTable("event_counters", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventKey: text("event_key").notNull(),
	pokemonName: text("pokemon_name").notNull(),
	pokemonId: integer("pokemon_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalCount: bigint("total_count", { mode: "number" }).default(0),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	targetCount: bigint("target_count", { mode: "number" }).default(0),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	maxRewards: bigint("max_rewards", { mode: "number" }).default(0),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
	distributionStart: text("distribution_start"),
	distributionEnd: text("distribution_end"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("event_counters_event_key_key").on(table.eventKey),
	pgPolicy("event_counters_select_all", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

// Event Counter types
export type EventCounter = typeof eventCounters.$inferSelect;
export type NewEventCounter = typeof eventCounters.$inferInsert;

// User Event Participation types
export type UserEventParticipation = typeof userEventParticipation.$inferSelect;
export type NewUserEventParticipation = typeof userEventParticipation.$inferInsert;

// Anonymous Event Participation types  
export type AnonymousEventParticipation = typeof anonymousEventParticipation.$inferSelect;
export type NewAnonymousEventParticipation = typeof anonymousEventParticipation.$inferInsert;



// Zod Schemas

// Schema for incrementing event counter - only needs user identification
export const incrementEventSchema = z.object({
  userId: z.uuid().optional(),
  anonymousId: z.uuid().optional(),
}).refine(data => data.userId || data.anonymousId, {
  message: 'Either userId or anonymousId is required',
});