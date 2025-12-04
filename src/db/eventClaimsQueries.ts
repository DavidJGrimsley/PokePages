import { eq, and } from 'drizzle-orm';
import { db } from './index.js';
import {
  userEventClaims,
  type UserEventClaim,
} from './eventClaimsSchema.js';

/**
 * Get all claims for a user
 */
export async function getUserClaims(userId: string): Promise<UserEventClaim[]> {
  try {
    const claims = await db
      .select()
      .from(userEventClaims)
      .where(eq(userEventClaims.userId, userId));
    
    return claims;
  } catch (error) {
    console.error('Error fetching user claims:', error);
    throw error;
  }
}

/**
 * Get a specific claim for a user and event
 */
export async function getUserClaimForEvent(
  userId: string,
  eventKey: string
): Promise<UserEventClaim | null> {
  try {
    const [claim] = await db
      .select()
      .from(userEventClaims)
      .where(
        and(
          eq(userEventClaims.userId, userId),
          eq(userEventClaims.eventKey, eventKey)
        )
      );
    
    return claim || null;
  } catch (error) {
    console.error('Error fetching user claim for event:', error);
    throw error;
  }
}

/**
 * Upsert a claim (create or update)
 */
export async function upsertClaim(
  userId: string,
  eventKey: string,
  claimed: boolean,
  claimedAt?: string
): Promise<UserEventClaim> {
  try {
    const now = new Date().toISOString();
    
    // Try to find existing claim
    const existing = await getUserClaimForEvent(userId, eventKey);
    
    if (existing) {
      // Update existing claim
      const [updated] = await db
        .update(userEventClaims)
        .set({
          claimed,
          claimedAt: claimedAt || (claimed ? now : null),
          updatedAt: now,
        })
        .where(
          and(
            eq(userEventClaims.userId, userId),
            eq(userEventClaims.eventKey, eventKey)
          )
        )
        .returning();
      
      return updated;
    } else {
      // Insert new claim
      const [created] = await db
        .insert(userEventClaims)
        .values({
          userId,
          eventKey,
          claimed,
          claimedAt: claimedAt || (claimed ? now : null),
        })
        .returning();
      
      return created;
    }
  } catch (error) {
    console.error('Error upserting claim:', error);
    throw error;
  }
}

/**
 * Batch upsert claims (for syncing multiple claims at once)
 */
export async function batchUpsertClaims(
  userId: string,
  claims: { eventKey: string; claimed: boolean; claimedAt?: string }[]
): Promise<UserEventClaim[]> {
  try {
    const results: UserEventClaim[] = [];
    
    // Process each claim individually (could be optimized with a transaction)
    for (const claim of claims) {
      const result = await upsertClaim(
        userId,
        claim.eventKey,
        claim.claimed,
        claim.claimedAt
      );
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error('Error batch upserting claims:', error);
    throw error;
  }
}

/**
 * Delete a claim
 */
export async function deleteClaim(
  userId: string,
  eventKey: string
): Promise<boolean> {
  try {
    await db
      .delete(userEventClaims)
      .where(
        and(
          eq(userEventClaims.userId, userId),
          eq(userEventClaims.eventKey, eventKey)
        )
      );
    
    return true;
  } catch (error) {
    console.error('Error deleting claim:', error);
    throw error;
  }
}
