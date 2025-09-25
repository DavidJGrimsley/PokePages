// src/db/schema.ts
// Manually authored initial Drizzle schema (introspection blocked by IPv6 connectivity)
// Adjust types & columns once introspection succeeds.

import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  username: text('username'),
  birthdate: text('birthdate'), // stored as ISO string in your app
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
});

export const eventCounters = pgTable('event_counters', {
  id: uuid('id').defaultRandom().primaryKey(), // adjust if this is serial in DB
  eventKey: text('event_key').notNull(),
  pokemonName: text('pokemon_name'), // present if you added it
  currentCount: integer('current_count').default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const userEventParticipation = pgTable('user_event_participation', {
  eventId: uuid('event_id').notNull(),
  userId: uuid('user_id').notNull(),
  contributionCount: integer('contribution_count').default(0),
  // TODO: Add a composite primary key or unique constraint (eventId + userId) if DB has it
});

// You reference an RPC function `increment_counter` in components; that lives in SQL, not here.
// Once connectivity works, run `npx drizzle-kit pull` and reconcile differences.
