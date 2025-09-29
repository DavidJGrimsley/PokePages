"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationQuerySchema = exports.searchQuerySchema = exports.usernameParamsSchema = exports.userIdParamsSchema = exports.signupProfileSchema = exports.userEditableProfileSchema = exports.updateProfileSchema = exports.profiles = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
exports.profiles = (0, pg_core_1.pgTable)("profiles", {
    id: (0, pg_core_1.uuid)().primaryKey().notNull(),
    username: (0, pg_core_1.text)(),
    birthdate: (0, pg_core_1.date)(),
    avatarUrl: (0, pg_core_1.text)("avatar_url"),
    bio: (0, pg_core_1.text)(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("profiles_username_key").on(table.username),
    (0, pg_core_1.pgPolicy)("Public profiles are viewable by everyone.", { as: "permissive", for: "select", to: ["public"], using: (0, drizzle_orm_1.sql) `true` }),
    (0, pg_core_1.pgPolicy)("Users can insert their own profile.", { as: "permissive", for: "insert", to: ["public"] }),
    (0, pg_core_1.pgPolicy)("Users can update own profile.", { as: "permissive", for: "update", to: ["public"] }),
    (0, pg_core_1.check)("username_length", (0, drizzle_orm_1.sql) `(username IS NULL) OR (char_length(username) >= 3)`),
]);
const createProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.profiles);
exports.updateProfileSchema = createProfileSchema.pick({
    username: true,
    birthdate: true,
    avatarUrl: true,
    bio: true,
});
exports.userEditableProfileSchema = createProfileSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.signupProfileSchema = createProfileSchema.pick({
    id: true,
    username: true,
    birthdate: true,
});
exports.userIdParamsSchema = zod_1.z.object({
    userId: zod_1.z.uuid(),
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
