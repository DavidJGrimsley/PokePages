"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anonymousEventParticipationRelations = exports.profilesRelations = exports.eventCountersRelations = exports.userEventParticipationRelations = void 0;
const relations_1 = require("drizzle-orm/relations");
const eventsSchema_1 = require("./eventsSchema");
const profilesSchema_1 = require("./profilesSchema");
exports.userEventParticipationRelations = (0, relations_1.relations)(eventsSchema_1.userEventParticipation, ({ one }) => ({
    eventCounter: one(eventsSchema_1.eventCounters, {
        fields: [eventsSchema_1.userEventParticipation.eventId],
        references: [eventsSchema_1.eventCounters.id]
    }),
    profile: one(profilesSchema_1.profiles, {
        fields: [eventsSchema_1.userEventParticipation.userId],
        references: [profilesSchema_1.profiles.id]
    }),
}));
exports.eventCountersRelations = (0, relations_1.relations)(eventsSchema_1.eventCounters, ({ many }) => ({
    userEventParticipations: many(eventsSchema_1.userEventParticipation),
    anonymousEventParticipations: many(eventsSchema_1.anonymousEventParticipation),
}));
exports.profilesRelations = (0, relations_1.relations)(profilesSchema_1.profiles, ({ many }) => ({
    userEventParticipations: many(eventsSchema_1.userEventParticipation),
}));
exports.anonymousEventParticipationRelations = (0, relations_1.relations)(eventsSchema_1.anonymousEventParticipation, ({ one }) => ({
    eventCounter: one(eventsSchema_1.eventCounters, {
        fields: [eventsSchema_1.anonymousEventParticipation.eventId],
        references: [eventsSchema_1.eventCounters.id]
    }),
}));
