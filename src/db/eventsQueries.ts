import { eq, and, sql } from 'drizzle-orm';
import { db } from './index.js';
import {
  eventCounters, 
  userEventParticipation, 
  anonymousEventParticipation,
  type EventCounter,
  type UserEventParticipation,
  type AnonymousEventParticipation
} from './eventsSchema.js';
import { 
  profiles,
} from './profilesSchema.js';

// Get all event counters
export async function getEventCounters(): Promise<EventCounter[]> {
  try {
    const events = await db.select().from(eventCounters).orderBy(eventCounters.createdAt);
    return events;
  } catch (error) {
    console.error('Error fetching event counters:', error);
    throw error;
  }
}

// Get a specific event counter by eventKey
export async function getEventCounter(eventKey: string): Promise<EventCounter | null> {
  try {
    const [event] = await db
      .select()
      .from(eventCounters)
      .where(eq(eventCounters.eventKey, eventKey));
    
    return event || null;
  } catch (error) {
    console.error('Error fetching event counter:', error);
    throw error;
  }
}

// Increment event counter and track user/anonymous participation
export async function incrementEventCounter(
  eventKey: string, 
  userId?: string, 
  anonymousId?: string
): Promise<{
  event: EventCounter;
  userContribution: number;
  totalContributions: number;
}> {
  try {
    // First, get the event
    const event = await getEventCounter(eventKey);
    if (!event) {
      throw new Error(`Event not found: ${eventKey}`);
    }

    let userContribution = 0;

    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Increment the global counter
      const [updatedEvent] = await tx
        .update(eventCounters)
        .set({ 
          totalCount: sql`${eventCounters.totalCount} + 1`,
          updatedAt: sql`NOW()`
        })
        .where(eq(eventCounters.eventKey, eventKey))
        .returning();

      if (userId) {
        // Handle logged-in user participation
        const [existingParticipation] = await tx
          .select()
          .from(userEventParticipation)
          .where(
            and(
              eq(userEventParticipation.eventId, event.id),
              eq(userEventParticipation.userId, userId)
            )
          );

        if (existingParticipation) {
          // Update existing participation
          const [updated] = await tx
            .update(userEventParticipation)
            .set({
              contributionCount: sql`${userEventParticipation.contributionCount} + 1`,
              lastContributedAt: sql`NOW()`,
              updatedAt: sql`NOW()`
            })
            .where(
              and(
                eq(userEventParticipation.eventId, event.id),
                eq(userEventParticipation.userId, userId)
              )
            )
            .returning();
          
          userContribution = updated.contributionCount ?? 0;
        } else {
          // Create new participation record
          const [created] = await tx
            .insert(userEventParticipation)
            .values({
              eventId: event.id,
              userId: userId,
              contributionCount: 1,
              lastContributedAt: sql`NOW()`,
            })
            .returning();
          
          userContribution = created.contributionCount ?? 1;
        }
      } else if (anonymousId) {
        // Handle anonymous user participation
        const [existingAnonymous] = await tx
          .select()
          .from(anonymousEventParticipation)
          .where(
            and(
              eq(anonymousEventParticipation.eventId, event.id),
              eq(anonymousEventParticipation.anonymousId, anonymousId)
            )
          );

        if (existingAnonymous) {
          // Update existing anonymous participation
          const [updated] = await tx
            .update(anonymousEventParticipation)
            .set({
              contributionCount: sql`${anonymousEventParticipation.contributionCount} + 1`,
              lastContributedAt: sql`NOW()`,
              updatedAt: sql`NOW()`
            })
            .where(
              and(
                eq(anonymousEventParticipation.eventId, event.id),
                eq(anonymousEventParticipation.anonymousId, anonymousId)
              )
            )
            .returning();
          
          userContribution = updated.contributionCount ?? 0;
        } else {
          // Create new anonymous participation record
          const [created] = await tx
            .insert(anonymousEventParticipation)
            .values({
              eventId: event.id,
              anonymousId: anonymousId,
              contributionCount: 1,
              lastContributedAt: sql`NOW()`,
            })
            .returning();
          
          userContribution = created.contributionCount ?? 1;
        }
      }

      return { updatedEvent, userContribution };
    });

    return {
      event: result.updatedEvent,
      userContribution: result.userContribution,
      totalContributions: result.updatedEvent.totalCount ?? 0
    };

  } catch (error) {
    console.error('Error incrementing event counter:', error);
    throw error;
  }
}

// Get user participation for a specific event
export async function getUserParticipation(
  eventKey: string, 
  userId: string
): Promise<UserEventParticipation | null> {
  try {
    const event = await getEventCounter(eventKey);
    if (!event) {
      return null;
    }

    const [participation] = await db
      .select()
      .from(userEventParticipation)
      .where(
        and(
          eq(userEventParticipation.eventId, event.id),
          eq(userEventParticipation.userId, userId)
        )
      );

    return participation || null;
  } catch (error) {
    console.error('Error fetching user participation:', error);
    throw error;
  }
}

// Get anonymous participation for a specific event
export async function getAnonymousParticipation(
  eventKey: string, 
  anonymousId: string
): Promise<AnonymousEventParticipation | null> {
  try {
    const event = await getEventCounter(eventKey);
    if (!event) {
      return null;
    }

    const [participation] = await db
      .select()
      .from(anonymousEventParticipation)
      .where(
        and(
          eq(anonymousEventParticipation.eventId, event.id),
          eq(anonymousEventParticipation.anonymousId, anonymousId)
        )
      );

    return participation || null;
  } catch (error) {
    console.error('Error fetching anonymous participation:', error);
    throw error;
  }
}

// Get comprehensive stats for an event
export async function getEventStats(eventKey: string): Promise<{
  event: EventCounter;
  totalParticipants: number;
  registeredUsers: number;
  anonymousUsers: number;
  topContributors: {
    userId?: string;
    username?: string;
    anonymousId?: string;
    contributionCount: number;
    isAnonymous: boolean;
  }[];
} | null> {
  try {
    const event = await getEventCounter(eventKey);
    if (!event) {
      return null;
    }

    // Get participation counts
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userEventParticipation)
      .where(eq(userEventParticipation.eventId, event.id));

    const [anonCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(anonymousEventParticipation)
      .where(eq(anonymousEventParticipation.eventId, event.id));

    // Get top contributors (registered users)
    const topUsers = await db
      .select({
        userId: userEventParticipation.userId,
        username: profiles.username,
        contributionCount: userEventParticipation.contributionCount,
      })
      .from(userEventParticipation)
      .leftJoin(profiles, eq(userEventParticipation.userId, profiles.id))
      .where(eq(userEventParticipation.eventId, event.id))
      .orderBy(sql`${userEventParticipation.contributionCount} DESC`)
      .limit(10);

    // Get top anonymous contributors
    const topAnonymous = await db
      .select({
        anonymousId: anonymousEventParticipation.anonymousId,
        contributionCount: anonymousEventParticipation.contributionCount,
      })
      .from(anonymousEventParticipation)
      .where(eq(anonymousEventParticipation.eventId, event.id))
      .orderBy(sql`${anonymousEventParticipation.contributionCount} DESC`)
      .limit(5);

    // Combine and format top contributors
    const topContributors = [
      ...topUsers.map(user => ({
        userId: user.userId!,
        username: user.username ?? undefined,
        contributionCount: user.contributionCount ?? 0,
        isAnonymous: false
      })),
      ...topAnonymous.map(anon => ({
        anonymousId: anon.anonymousId,
        contributionCount: anon.contributionCount ?? 0,
        isAnonymous: true
      }))
    ].sort((a, b) => (b.contributionCount ?? 0) - (a.contributionCount ?? 0)).slice(0, 10);

    return {
      event,
      totalParticipants: (userCount?.count || 0) + (anonCount?.count || 0),
      registeredUsers: userCount?.count || 0,
      anonymousUsers: anonCount?.count || 0,
      topContributors
    };

  } catch (error) {
    console.error('Error fetching event stats:', error);
    throw error;
  }
}