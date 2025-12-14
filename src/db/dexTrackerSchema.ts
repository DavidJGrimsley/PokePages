import { pgTable, uuid, integer, boolean, timestamp, unique, index, foreignKey, varchar } from 'drizzle-orm/pg-core';
import { profiles } from './profilesSchema.js';



export const dexTracker = pgTable('dex_tracker', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  pokedex: varchar('pokedex', { length: 50 }).notNull(), // Which dex: 'lumiose', 'hyperspace', etc.
  pokemonId: integer('pokemon_id').notNull(),
  normal: boolean('normal').default(false).notNull(),
  shiny: boolean('shiny').default(false).notNull(),
  alpha: boolean('alpha').default(false).notNull(),
  alphaShiny: boolean('alpha_shiny').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  // Prevents duplicate: same user can't track same pokemon twice in same dex
  userPokedexPokemonUnique: unique('dex_tracker_user_pokedex_pokemon_key').on(table.userId, table.pokedex, table.pokemonId),
  // Makes queries fast when getting all pokemon for a specific dex
  userPokedexIdx: index('idx_dex_tracker_user_pokedex').on(table.userId, table.pokedex),
  // Ensures user_id exists in profiles table
  userIdFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [profiles.id],
    name: 'dex_tracker_user_id_fkey'
  }).onDelete('cascade'),
}));