// src/db/relations.ts
// Drizzle relations for your PokePages database
import { relations } from "drizzle-orm/relations";
import { eventCounters, userEventParticipation, users, anonymousEventParticipation, profiles } from "./schema";

export const userEventParticipationRelations = relations(userEventParticipation, ({one}) => ({
	eventCounter: one(eventCounters, {
		fields: [userEventParticipation.eventId],
		references: [eventCounters.id]
	}),
	user: one(users, {
		fields: [userEventParticipation.userId],
		references: [users.id]
	}),
}));

export const eventCountersRelations = relations(eventCounters, ({many}) => ({
	userEventParticipations: many(userEventParticipation),
	anonymousEventParticipations: many(anonymousEventParticipation),
}));

export const usersRelations = relations(users, ({many}) => ({
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
	user: one(users, {
		fields: [profiles.id],
		references: [users.id]
	}),
}));