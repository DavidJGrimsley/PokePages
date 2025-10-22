"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationQuerySchema = exports.searchQuerySchema = exports.usernameParamsSchema = exports.userIdParamsSchema = exports.signupProfileSchema = exports.userEditableProfileSchema = exports.updateProfileSchema = exports.profiles = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
var drizzle_zod_1 = require("drizzle-zod");
var zod_1 = require("zod");
exports.profiles = (0, pg_core_1.pgTable)("profiles", {
    id: (0, pg_core_1.uuid)().primaryKey().notNull(),
    username: (0, pg_core_1.text)(),
    birthdate: (0, pg_core_1.date)(),
    avatarUrl: (0, pg_core_1.text)("avatar_url"),
    bio: (0, pg_core_1.text)(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, function (table) { return [
    // Note: profiles.id references auth.users.id (Supabase auth table not in public schema)
    (0, pg_core_1.unique)("profiles_username_key").on(table.username),
    // Row Level Security (RLS) policies are handled in Supabase dashboard/SQL
    (0, pg_core_1.check)("username_length", (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["(username IS NULL) OR (char_length(username) >= 3)"], ["(username IS NULL) OR (char_length(username) >= 3)"])))),
]; });
var createProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.profiles);
// Example: Only allow specific fields for updates
exports.updateProfileSchema = createProfileSchema.pick({
    username: true,
    birthdate: true,
    avatarUrl: true,
    bio: true,
});
// Example: Only allow user-controlled fields (exclude system fields)
exports.userEditableProfileSchema = createProfileSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Schema for creating new profiles (includes id from Supabase auth)
exports.signupProfileSchema = createProfileSchema.pick({
    id: true,
    username: true,
    birthdate: true,
});
// Validation schemas for params and query
exports.userIdParamsSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
});
exports.usernameParamsSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(24),
});
exports.searchQuerySchema = zod_1.z.object({
    q: zod_1.z.string().min(1).max(50),
    limit: zod_1.z.string().regex(/^\d+$/).optional().default('20'),
});
exports.paginationQuerySchema = zod_1.z.object({
    limit: zod_1.z.string().regex(/^\d+$/).optional().default('100'),
    offset: zod_1.z.string().regex(/^\d+$/).optional().default('0'),
});
var templateObject_1;
