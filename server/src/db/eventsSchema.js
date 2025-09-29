"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementEventSchema = exports.eventCounters = exports.anonymousEventParticipation = exports.userEventParticipation = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const profilesSchema_1 = require("./profilesSchema");
exports.userEventParticipation = (0, pg_core_1.pgTable)("user_event_participation", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey().notNull(),
    userId: (0, pg_core_1.uuid)("user_id"),
    eventId: (0, pg_core_1.uuid)("event_id"),
    contributionCount: (0, pg_core_1.bigint)("contribution_count", { mode: "number" }).default(0),
    lastContributedAt: (0, pg_core_1.timestamp)("last_contributed_at", { withTimezone: true, mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.index)("idx_user_event_participation_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.eventId],
        foreignColumns: [exports.eventCounters.id],
        name: "user_event_participation_event_id_fkey"
    }).onDelete("cascade"),
    (0, pg_core_1.foreignKey)({
        columns: [table.userId],
        foreignColumns: [profilesSchema_1.profiles.id],
        name: "user_event_participation_user_id_fkey"
    }).onDelete("cascade"),
    (0, pg_core_1.unique)("user_event_participation_user_id_event_id_key").on(table.userId, table.eventId),
    (0, pg_core_1.pgPolicy)("Enable read access for all users", { as: "permissive", for: "select", to: ["public"], using: (0, drizzle_orm_1.sql) `true` }),
    (0, pg_core_1.pgPolicy)("user_participation_upsert_own", { as: "permissive", for: "all", to: ["public"] }),
]);
exports.anonymousEventParticipation = (0, pg_core_1.pgTable)("anonymous_event_participation", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey().notNull(),
    eventId: (0, pg_core_1.uuid)("event_id"),
    anonymousId: (0, pg_core_1.text)("anonymous_id").notNull(),
    contributionCount: (0, pg_core_1.bigint)("contribution_count", { mode: "number" }).default(0),
    lastContributedAt: (0, pg_core_1.timestamp)("last_contributed_at", { withTimezone: true, mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.eventId],
        foreignColumns: [exports.eventCounters.id],
        name: "anonymous_event_participation_event_id_fkey"
    }).onDelete("cascade"),
    (0, pg_core_1.unique)("anonymous_event_participation_event_id_anonymous_id_key").on(table.eventId, table.anonymousId),
    (0, pg_core_1.pgPolicy)("anon_participation_insert_all", { as: "permissive", for: "insert", to: ["public"], withCheck: (0, drizzle_orm_1.sql) `true` }),
    (0, pg_core_1.pgPolicy)("anon_participation_select_all", { as: "permissive", for: "select", to: ["public"] }),
    (0, pg_core_1.pgPolicy)("anon_participation_update_all", { as: "permissive", for: "update", to: ["public"] }),
]);
exports.eventCounters = (0, pg_core_1.pgTable)("event_counters", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey().notNull(),
    eventKey: (0, pg_core_1.text)("event_key").notNull(),
    pokemonName: (0, pg_core_1.text)("pokemon_name").notNull(),
    pokemonId: (0, pg_core_1.integer)("pokemon_id"),
    totalCount: (0, pg_core_1.bigint)("total_count", { mode: "number" }).default(0),
    targetCount: (0, pg_core_1.bigint)("target_count", { mode: "number" }).default(0),
    maxRewards: (0, pg_core_1.bigint)("max_rewards", { mode: "number" }).default(0),
    startDate: (0, pg_core_1.timestamp)("start_date", { withTimezone: true, mode: 'string' }),
    endDate: (0, pg_core_1.timestamp)("end_date", { withTimezone: true, mode: 'string' }),
    distributionStart: (0, pg_core_1.text)("distribution_start"),
    distributionEnd: (0, pg_core_1.text)("distribution_end"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("event_counters_event_key_key").on(table.eventKey),
    (0, pg_core_1.pgPolicy)("event_counters_select_all", { as: "permissive", for: "select", to: ["public"], using: (0, drizzle_orm_1.sql) `true` }),
]);
exports.incrementEventSchema = zod_1.z.object({
    userId: zod_1.z.uuid().optional(),
    anonymousId: zod_1.z.uuid().optional(),
}).refine(data => data.userId || data.anonymousId, {
    message: 'Either userId or anonymousId is required',
});
