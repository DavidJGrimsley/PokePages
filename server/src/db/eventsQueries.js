"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventCounters = getEventCounters;
exports.getEventCounter = getEventCounter;
exports.incrementEventCounter = incrementEventCounter;
exports.getUserParticipation = getUserParticipation;
exports.getAnonymousParticipation = getAnonymousParticipation;
exports.getEventStats = getEventStats;
const drizzle_orm_1 = require("drizzle-orm");
const index_1 = require("./index");
const eventsSchema_1 = require("./eventsSchema");
const profilesSchema_1 = require("./profilesSchema");
async function getEventCounters() {
    try {
        const events = await index_1.db.select().from(eventsSchema_1.eventCounters).orderBy(eventsSchema_1.eventCounters.createdAt);
        return events;
    }
    catch (error) {
        console.error('Error fetching event counters:', error);
        throw error;
    }
}
async function getEventCounter(eventKey) {
    try {
        const [event] = await index_1.db
            .select()
            .from(eventsSchema_1.eventCounters)
            .where((0, drizzle_orm_1.eq)(eventsSchema_1.eventCounters.eventKey, eventKey));
        return event || null;
    }
    catch (error) {
        console.error('Error fetching event counter:', error);
        throw error;
    }
}
async function incrementEventCounter(eventKey, userId, anonymousId) {
    try {
        const event = await getEventCounter(eventKey);
        if (!event) {
            throw new Error(`Event not found: ${eventKey}`);
        }
        let userContribution = 0;
        const result = await index_1.db.transaction(async (tx) => {
            const [updatedEvent] = await tx
                .update(eventsSchema_1.eventCounters)
                .set({
                totalCount: (0, drizzle_orm_1.sql) `${eventsSchema_1.eventCounters.totalCount} + 1`,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`
            })
                .where((0, drizzle_orm_1.eq)(eventsSchema_1.eventCounters.eventKey, eventKey))
                .returning();
            if (userId) {
                const [existingParticipation] = await tx
                    .select()
                    .from(eventsSchema_1.userEventParticipation)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(eventsSchema_1.userEventParticipation.eventId, event.id), (0, drizzle_orm_1.eq)(eventsSchema_1.userEventParticipation.userId, userId)));
                if (existingParticipation) {
                    const [updated] = await tx
                        .update(eventsSchema_1.userEventParticipation)
                        .set({
                        contributionCount: (0, drizzle_orm_1.sql) `${eventsSchema_1.userEventParticipation.contributionCount} + 1`,
                        lastContributedAt: (0, drizzle_orm_1.sql) `NOW()`,
                        updatedAt: (0, drizzle_orm_1.sql) `NOW()`
                    })
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(eventsSchema_1.userEventParticipation.eventId, event.id), (0, drizzle_orm_1.eq)(eventsSchema_1.userEventParticipation.userId, userId)))
                        .returning();
                    userContribution = updated.contributionCount ?? 0;
                }
                else {
                    const [created] = await tx
                        .insert(eventsSchema_1.userEventParticipation)
                        .values({
                        eventId: event.id,
                        userId: userId,
                        contributionCount: 1,
                        lastContributedAt: (0, drizzle_orm_1.sql) `NOW()`,
                    })
                        .returning();
                    userContribution = created.contributionCount ?? 1;
                }
            }
            else if (anonymousId) {
                const [existingAnonymous] = await tx
                    .select()
                    .from(eventsSchema_1.anonymousEventParticipation)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(eventsSchema_1.anonymousEventParticipation.eventId, event.id), (0, drizzle_orm_1.eq)(eventsSchema_1.anonymousEventParticipation.anonymousId, anonymousId)));
                if (existingAnonymous) {
                    const [updated] = await tx
                        .update(eventsSchema_1.anonymousEventParticipation)
                        .set({
                        contributionCount: (0, drizzle_orm_1.sql) `${eventsSchema_1.anonymousEventParticipation.contributionCount} + 1`,
                        lastContributedAt: (0, drizzle_orm_1.sql) `NOW()`,
                        updatedAt: (0, drizzle_orm_1.sql) `NOW()`
                    })
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(eventsSchema_1.anonymousEventParticipation.eventId, event.id), (0, drizzle_orm_1.eq)(eventsSchema_1.anonymousEventParticipation.anonymousId, anonymousId)))
                        .returning();
                    userContribution = updated.contributionCount ?? 0;
                }
                else {
                    const [created] = await tx
                        .insert(eventsSchema_1.anonymousEventParticipation)
                        .values({
                        eventId: event.id,
                        anonymousId: anonymousId,
                        contributionCount: 1,
                        lastContributedAt: (0, drizzle_orm_1.sql) `NOW()`,
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
    }
    catch (error) {
        console.error('Error incrementing event counter:', error);
        throw error;
    }
}
async function getUserParticipation(eventKey, userId) {
    try {
        const event = await getEventCounter(eventKey);
        if (!event) {
            return null;
        }
        const [participation] = await index_1.db
            .select()
            .from(eventsSchema_1.userEventParticipation)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(eventsSchema_1.userEventParticipation.eventId, event.id), (0, drizzle_orm_1.eq)(eventsSchema_1.userEventParticipation.userId, userId)));
        return participation || null;
    }
    catch (error) {
        console.error('Error fetching user participation:', error);
        throw error;
    }
}
async function getAnonymousParticipation(eventKey, anonymousId) {
    try {
        const event = await getEventCounter(eventKey);
        if (!event) {
            return null;
        }
        const [participation] = await index_1.db
            .select()
            .from(eventsSchema_1.anonymousEventParticipation)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(eventsSchema_1.anonymousEventParticipation.eventId, event.id), (0, drizzle_orm_1.eq)(eventsSchema_1.anonymousEventParticipation.anonymousId, anonymousId)));
        return participation || null;
    }
    catch (error) {
        console.error('Error fetching anonymous participation:', error);
        throw error;
    }
}
async function getEventStats(eventKey) {
    try {
        const event = await getEventCounter(eventKey);
        if (!event) {
            return null;
        }
        const [userCount] = await index_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(eventsSchema_1.userEventParticipation)
            .where((0, drizzle_orm_1.eq)(eventsSchema_1.userEventParticipation.eventId, event.id));
        const [anonCount] = await index_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(eventsSchema_1.anonymousEventParticipation)
            .where((0, drizzle_orm_1.eq)(eventsSchema_1.anonymousEventParticipation.eventId, event.id));
        const topUsers = await index_1.db
            .select({
            userId: eventsSchema_1.userEventParticipation.userId,
            username: profilesSchema_1.profiles.username,
            contributionCount: eventsSchema_1.userEventParticipation.contributionCount,
        })
            .from(eventsSchema_1.userEventParticipation)
            .leftJoin(profilesSchema_1.profiles, (0, drizzle_orm_1.eq)(eventsSchema_1.userEventParticipation.userId, profilesSchema_1.profiles.id))
            .where((0, drizzle_orm_1.eq)(eventsSchema_1.userEventParticipation.eventId, event.id))
            .orderBy((0, drizzle_orm_1.sql) `${eventsSchema_1.userEventParticipation.contributionCount} DESC`)
            .limit(10);
        const topAnonymous = await index_1.db
            .select({
            anonymousId: eventsSchema_1.anonymousEventParticipation.anonymousId,
            contributionCount: eventsSchema_1.anonymousEventParticipation.contributionCount,
        })
            .from(eventsSchema_1.anonymousEventParticipation)
            .where((0, drizzle_orm_1.eq)(eventsSchema_1.anonymousEventParticipation.eventId, event.id))
            .orderBy((0, drizzle_orm_1.sql) `${eventsSchema_1.anonymousEventParticipation.contributionCount} DESC`)
            .limit(5);
        const topContributors = [
            ...topUsers.map(user => ({
                userId: user.userId,
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
    }
    catch (error) {
        console.error('Error fetching event stats:', error);
        throw error;
    }
}
