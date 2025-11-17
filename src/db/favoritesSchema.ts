import { pgTable, uuid, timestamp, text, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { profiles } from './profilesSchema.js';

// Favorite features table: stores a user -> featureKey mapping
export const favoriteFeatures = pgTable('favorite_features', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  featureKey: text('feature_key').notNull(),
  featureTitle: text('feature_title'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index('favorite_features_user_idx').on(table.userId),
  index('favorite_features_key_idx').on(table.featureKey),
  unique('favorite_features_unique_pair').on(table.userId, table.featureKey),
]);

export const favoriteFeaturesRelations = relations(favoriteFeatures, ({ one }) => ({
  user: one(profiles, {
    fields: [favoriteFeatures.userId],
    references: [profiles.id],
  }),
}));
