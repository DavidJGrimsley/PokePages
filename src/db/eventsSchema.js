"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementEventSchema = exports.eventCounters = exports.anonymousEventParticipation = exports.userEventParticipation = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var zod_1 = require("zod");
var profilesSchema_js_1 = require("./profilesSchema.js");
exports.userEventParticipation = (0, pg_core_1.pgTable)("user_event_participation", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey().notNull(),
    userId: (0, pg_core_1.uuid)("user_id"),
    eventId: (0, pg_core_1.uuid)("event_id"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    contributionCount: (0, pg_core_1.bigint)("contribution_count", { mode: "number" }).default(0),
    lastContributedAt: (0, pg_core_1.timestamp)("last_contributed_at", { withTimezone: true, mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("idx_user_event_participation_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.eventId],
        foreignColumns: [exports.eventCounters.id],
        name: "user_event_participation_event_id_fkey"
    }).onDelete("cascade"),
    (0, pg_core_1.foreignKey)({
        columns: [table.userId],
        foreignColumns: [profilesSchema_js_1.profiles.id],
        name: "user_event_participation_user_id_fkey"
    }).onDelete("cascade"),
    (0, pg_core_1.unique)("user_event_participation_user_id_event_id_key").on(table.userId, table.eventId),
    // RLS policies handled in Supabase
]; });
exports.anonymousEventParticipation = (0, pg_core_1.pgTable)("anonymous_event_participation", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey().notNull(),
    eventId: (0, pg_core_1.uuid)("event_id"),
    anonymousId: (0, pg_core_1.text)("anonymous_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    contributionCount: (0, pg_core_1.bigint)("contribution_count", { mode: "number" }).default(0),
    lastContributedAt: (0, pg_core_1.timestamp)("last_contributed_at", { withTimezone: true, mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.foreignKey)({
        columns: [table.eventId],
        foreignColumns: [exports.eventCounters.id],
        name: "anonymous_event_participation_event_id_fkey"
    }).onDelete("cascade"),
    (0, pg_core_1.unique)("anonymous_event_participation_event_id_anonymous_id_key").on(table.eventId, table.anonymousId),
    // RLS policies handled in Supabase
]; });
exports.eventCounters = (0, pg_core_1.pgTable)("event_counters", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey().notNull(),
    eventKey: (0, pg_core_1.text)("event_key").notNull(),
    pokemonName: (0, pg_core_1.text)("pokemon_name").notNull(),
    pokemonId: (0, pg_core_1.integer)("pokemon_id"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    totalCount: (0, pg_core_1.bigint)("total_count", { mode: "number" }).default(0),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    targetCount: (0, pg_core_1.bigint)("target_count", { mode: "number" }).default(0),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    maxRewards: (0, pg_core_1.bigint)("max_rewards", { mode: "number" }).default(0),
    startDate: (0, pg_core_1.timestamp)("start_date", { withTimezone: true, mode: 'string' }),
    endDate: (0, pg_core_1.timestamp)("end_date", { withTimezone: true, mode: 'string' }),
    distributionStart: (0, pg_core_1.text)("distribution_start"),
    distributionEnd: (0, pg_core_1.text)("distribution_end"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.unique)("event_counters_event_key_key").on(table.eventKey),
    // RLS policies handled in Supabase
]; });
// Zod Schemas
// Schema for incrementing event counter - only needs user identification
exports.incrementEventSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid().optional(),
    anonymousId: zod_1.z.string().uuid().optional(),
}).refine(function (data) { return data.userId || data.anonymousId; }, {
    message: 'Either userId or anonymousId is required',
});
