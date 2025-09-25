import { relations } from "drizzle-orm/relations";
import { eventCounters, userEventParticipation, usersInAuth, anonymousEventParticipation, profiles } from "./schema";

export const userEventParticipationRelations = relations(userEventParticipation, ({one}) => ({
	eventCounter: one(eventCounters, {
		fields: [userEventParticipation.eventId],
		references: [eventCounters.id]
	}),
	usersInAuth: one(usersInAuth, {
		fields: [userEventParticipation.userId],
		references: [usersInAuth.id]
	}),
}));

export const eventCountersRelations = relations(eventCounters, ({many}) => ({
	userEventParticipations: many(userEventParticipation),
	anonymousEventParticipations: many(anonymousEventParticipation),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	userEventParticipations: many(userEventParticipation),
	profiles: many(profiles),
}));

export const anonymousEventParticipationRelations = relations(anonymousEventParticipation, ({one}) => ({
	eventCounter: one(eventCounters, {
		fields: [anonymousEventParticipation.eventId],
		references: [eventCounters.id]
	}),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [profiles.id],
		references: [usersInAuth.id]
	}),
}));