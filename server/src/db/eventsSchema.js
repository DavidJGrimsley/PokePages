import { pgTable, index, foreignKey, unique, uuid, bigint, timestamp, text, integer } from "drizzle-orm/pg-core";
import { z } from "zod";
import { profiles } from "./profilesSchema.js";
export const userEventParticipation = pgTable("user_event_participation", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id"),
    eventId: uuid("event_id"),
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
]);
export const anonymousEventParticipation = pgTable("anonymous_event_participation", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    eventId: uuid("event_id"),
    anonymousId: text("anonymous_id").notNull(),
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
]);
export const eventCounters = pgTable("event_counters", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    eventKey: text("event_key").notNull(),
    pokemonName: text("pokemon_name").notNull(),
    pokemonId: integer("pokemon_id"),
    totalCount: bigint("total_count", { mode: "number" }).default(0),
    targetCount: bigint("target_count", { mode: "number" }).default(0),
    maxRewards: bigint("max_rewards", { mode: "number" }).default(0),
    startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }),
    endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
    distributionStart: text("distribution_start"),
    distributionEnd: text("distribution_end"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
    unique("event_counters_event_key_key").on(table.eventKey),
]);
export const incrementEventSchema = z.object({
    userId: z.string().uuid().optional(),
    anonymousId: z.string().uuid().optional(),
}).refine(data => data.userId || data.anonymousId, {
    message: 'Either userId or anonymousId is required',
});
