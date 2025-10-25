import { pgTable, uuid, integer, boolean, timestamp, unique, index, foreignKey } from 'drizzle-orm/pg-core';
import { profiles } from './profilesSchema.js';



export const legendsZATracker = pgTable('legends_za_tracker', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  pokemonId: integer('pokemon_id').notNull(),
  normal: boolean('normal').default(false).notNull(),
  shiny: boolean('shiny').default(false).notNull(),
  alpha: boolean('alpha').default(false).notNull(),
  alphaShiny: boolean('alpha_shiny').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userPokemonUnique: unique('legends_za_tracker_user_id_pokemon_id_key').on(table.userId, table.pokemonId),
  userIdIdx: index('idx_legends_za_tracker_user_id').on(table.userId),
  userIdFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [profiles.id],
    name: 'legends_za_tracker_user_id_fkey'
  }).onDelete('cascade'),
}));