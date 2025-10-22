"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legendsZATracker = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var profilesSchema_js_1 = require("./profilesSchema.js");
exports.legendsZATracker = (0, pg_core_1.pgTable)('legends_za_tracker', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(),
    pokemonId: (0, pg_core_1.integer)('pokemon_id').notNull(),
    normal: (0, pg_core_1.boolean)('normal').default(false).notNull(),
    shiny: (0, pg_core_1.boolean)('shiny').default(false).notNull(),
    alpha: (0, pg_core_1.boolean)('alpha').default(false).notNull(),
    alphaShiny: (0, pg_core_1.boolean)('alpha_shiny').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, function (table) { return ({
    userPokemonUnique: (0, pg_core_1.unique)('legends_za_tracker_user_id_pokemon_id_key').on(table.userId, table.pokemonId),
    userIdIdx: (0, pg_core_1.index)('idx_legends_za_tracker_user_id').on(table.userId),
    userIdFk: (0, pg_core_1.foreignKey)({
        columns: [table.userId],
        foreignColumns: [profilesSchema_js_1.profiles.id],
        name: 'legends_za_tracker_user_id_fkey'
    }).onDelete('cascade'),
}); });
