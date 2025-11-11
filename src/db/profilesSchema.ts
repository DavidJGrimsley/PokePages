import { pgTable, unique, uuid, timestamp, text, check, date } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	username: text(),
	birthdate: date(),
	avatarUrl: text("avatar_url"),
	bio: text(),
	socialLink: text("social_link"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	// Note: profiles.id references auth.users.id (Supabase auth table not in public schema)
	unique("profiles_username_key").on(table.username),
	// Row Level Security (RLS) policies are handled in Supabase dashboard/SQL
	check("username_length", sql`(username IS NULL) OR (char_length(username) >= 3)`),
]);


// Profile types
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

const createProfileSchema = createInsertSchema(profiles);

// Example: Only allow specific fields for updates
export const updateProfileSchema = createProfileSchema.pick({
  username: true,
  birthdate: true,
  avatarUrl: true,
  bio: true,
  socialLink: true,
});

// Example: Only allow user-controlled fields (exclude system fields)
export const userEditableProfileSchema = createProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for creating new profiles (includes id from Supabase auth)
export const signupProfileSchema = createProfileSchema.pick({
  id: true,
  username: true,
  birthdate: true,
});

// Validation schemas for params and query
export const userIdParamsSchema = z.object({
  userId: z.string().uuid(),
});

export const usernameParamsSchema = z.object({
  username: z.string().min(3).max(24),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(50),
  limit: z.string().regex(/^\d+$/).optional().default('20'),
});

export const paginationQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).optional().default('100'),
  offset: z.string().regex(/^\d+$/).optional().default('0'),
});

type ProfileType = z.infer<typeof updateProfileSchema>;