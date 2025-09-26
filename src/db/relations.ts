import { relations } from "drizzle-orm/relations";
import { eventCounters, userEventParticipation, anonymousEventParticipation, profiles } from "./schema";

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

export const profilesRelations = relations(profiles, ({many}) => ({
	userEventParticipations: many(userEventParticipation),
}));

export const anonymousEventParticipationRelations = relations(anonymousEventParticipation, ({one}) => ({
	eventCounter: one(eventCounters, {
		fields: [anonymousEventParticipation.eventId],
		references: [eventCounters.id]
	}),
}));

// Note: profiles.id actually references auth.users.id (not included in public schema)