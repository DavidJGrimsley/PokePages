import { relations } from "drizzle-orm/relations";
import { profiles, legendsZaTracker, eventCounters, userEventParticipation, anonymousEventParticipation } from "./schema";

export const legendsZaTrackerRelations = relations(legendsZaTracker, ({one}) => ({
	profile: one(profiles, {
		fields: [legendsZaTracker.userId],
		references: [profiles.id]
	}),
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	legendsZaTrackers: many(legendsZaTracker),
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