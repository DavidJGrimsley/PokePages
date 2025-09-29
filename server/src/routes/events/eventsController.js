"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEvents = listEvents;
exports.getEvent = getEvent;
exports.incrementEvent = incrementEvent;
exports.getUserParticipation = getUserParticipation;
exports.getEventStats = getEventStats;
const eventsQueries_1 = require("../../db/eventsQueries");
async function listEvents(req, res) {
    try {
        const events = await (0, eventsQueries_1.getEventCounters)();
        res.json({ success: true, data: events });
    }
    catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function getEvent(req, res) {
    try {
        const { eventKey } = req.params;
        const event = await (0, eventsQueries_1.getEventCounter)(eventKey);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found',
            });
        }
        res.json({ success: true, data: event });
    }
    catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function incrementEvent(req, res) {
    try {
        const { eventKey } = req.params;
        const { userId, anonymousId } = req.body;
        if (!userId && !anonymousId) {
            return res.status(400).json({
                success: false,
                error: 'Either userId or anonymousId is required',
            });
        }
        const result = await (0, eventsQueries_1.incrementEventCounter)(eventKey, userId, anonymousId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Error incrementing counter:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function getUserParticipation(req, res) {
    try {
        const { eventKey, userId } = req.params;
        const participation = await (0, eventsQueries_1.getUserParticipation)(eventKey, userId);
        res.json({ success: true, data: participation });
    }
    catch (error) {
        console.error('Error fetching participation:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function getEventStats(req, res) {
    try {
        const { eventKey } = req.params;
        const stats = await (0, eventsQueries_1.getEventStats)(eventKey);
        res.json({ success: true, data: stats });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
