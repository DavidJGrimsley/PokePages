import { relations } from "drizzle-orm/relations";
import { profiles, legends-zaTracker, eventCounters, userEventParticipation, anonymousEventParticipation } from "./schema";

export const legends-zaTrackerRelations = relations(legends-zaTracker, ({one}) => ({
	profile: one(profiles, {
		fields: [legends-zaTracker.userId],
		references: [profiles.id]
	}),
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	legends-zaTrackers: many(legends-zaTracker),
	userEventParticipations: many(userEventParticipation),
}));

export const userEventParticipationRelations = relations(userEventParticipation, ({one}) => ({
	eventCounter: one(eventCounters, {
		fields: [userEventParticipation.eventId],
		references: [eventCounters.id]
	}),
	profile: one(profiles, {
		fields: [userEventParticipation.userId],
		references: [profiles.id]
	}),
}));

export const eventCountersRelations = relations(eventCounters, ({many}) => ({
	userEventParticipations: many(userEventParticipation),
	anonymousEventParticipations: many(anonymousEventParticipation),
}));

export const anonymousEventParticipationRelations = relations(anonymousEventParticipation, ({one}) => ({
	eventCounter: one(eventCounters, {
		fields: [anonymousEventParticipation.eventId],
		references: [eventCounters.id]
	}),
}));