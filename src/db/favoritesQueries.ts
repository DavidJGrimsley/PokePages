import { eq, and, sql } from 'drizzle-orm';
import { db } from './index.js';
import { favoriteFeatures } from './favoritesSchema.js';

export async function addFavoriteFeature(userId: string, featureKey: string, featureTitle?: string) {
  try {
    const inserted = await db.insert(favoriteFeatures).values({ userId, featureKey, featureTitle }).onConflictDoNothing().returning();
    if (Array.isArray(inserted) && inserted.length > 0) {
      return inserted[0];
    }
    const rows = await db.select().from(favoriteFeatures).where(and(eq(favoriteFeatures.userId, userId), eq(favoriteFeatures.featureKey, featureKey)));
    if (Array.isArray(rows) && rows.length > 0) {
      console.warn('[favoritesQueries] addFavoriteFeature: insert did nothing (already exists), returning existing row');
    }
    return rows[0];
  } catch (error) {
    console.error('[favoritesQueries] addFavoriteFeature error:', error);
    throw error;
  }
}

export async function removeFavoriteFeature(userId: string, featureKey: string) {
  try {
    // Use case-insensitive comparison for feature_key
    const deleted = await db.delete(favoriteFeatures)
      .where(
        and(
          eq(favoriteFeatures.userId, userId),
          sql`LOWER(${favoriteFeatures.featureKey}) = LOWER(${featureKey})`
        )
      )
      .returning();
    return Array.isArray(deleted) && deleted.length > 0;
  } catch (error) {
    console.error('[favoritesQueries] removeFavoriteFeature error:', error);
    throw error;
  }
}

export async function getUserFavorites(userId: string) {
  try {
    const rows = await db.select().from(favoriteFeatures).where(eq(favoriteFeatures.userId, userId));
    return rows;
  } catch (error) {
    console.error('[favoritesQueries] getUserFavorites error:', error);
    throw error;
  }
}
