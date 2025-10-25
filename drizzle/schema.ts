import { pgTable, index, foreignKey, unique, pgPolicy, uuid, integer, boolean, timestamp, bigint, text, check, date } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const legends-zaTracker = pgTable("legends_za_tracker", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	pokemonId: integer("pokemon_id").notNull(),
	normal: boolean().default(false).notNull(),
	shiny: boolean().default(false).notNull(),
	alpha: boolean().default(false).notNull(),
	alphaShiny: boolean("alpha_shiny").default(false).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_legends_za_tracker_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "legends_za_tracker_user_id_fkey"
		}).onDelete("cascade"),
	unique("legends_za_tracker_user_id_pokemon_id_key").on(table.userId, table.pokemonId),
	pgPolicy("Users can view their own legends za tracker data", { as: "permissive", for: "select", to: ["public"], using: sql`(auth.uid() = user_id)` }),
	pgPolicy("Users can insert their own legends za tracker data", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Users can update their own legends za tracker data", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Users can delete their own legends za tracker data", { as: "permissive", for: "delete", to: ["public"] }),
]);

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

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	username: text(),
	birthdate: date(),
	avatarUrl: text("avatar_url"),
	bio: text(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	// Note: profiles.id references auth.users.id (Supabase auth table not in public schema)
	unique("profiles_username_key").on(table.username),
	pgPolicy("Public profiles are viewable by everyone.", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("Users can insert their own profile.", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Users can update own profile.", { as: "permissive", for: "update", to: ["public"] }),
	check("username_length", sql`(username IS NULL) OR (char_length(username) >= 3)`),
]);
