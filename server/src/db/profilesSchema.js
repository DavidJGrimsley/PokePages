import { pgTable, unique, uuid, timestamp, text, check, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export const profiles = pgTable("profiles", {
    id: uuid().primaryKey().notNull(),
    username: text(),
    birthdate: date(),
    avatarUrl: text("avatar_url"),
    bio: text(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
    unique("profiles_username_key").on(table.username),
    check("username_length", sql `(username IS NULL) OR (char_length(username) >= 3)`),
]);
const createProfileSchema = createInsertSchema(profiles);
export const updateProfileSchema = createProfileSchema.pick({
    username: true,
    birthdate: true,
    avatarUrl: true,
    bio: true,
});
export const userEditableProfileSchema = createProfileSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const signupProfileSchema = createProfileSchema.pick({
    id: true,
    username: true,
    birthdate: true,
});
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
