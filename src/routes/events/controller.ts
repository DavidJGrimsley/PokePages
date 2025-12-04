import { Request, Response } from 'express';
import {
  getEventCounters as dbGetEventCounters,
  getEventCounter as dbGetEventCounter,
  incrementEventCounter as dbIncrementEventCounter,
  getUserParticipation as dbGetUserParticipation,
  getEventStats as dbGetEventStats,
} from '../../db/eventsQueries.js';

export async function listEvents(req: Request, res: Response) {
  try {
    const events = await dbGetEventCounters();
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,     
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getEvent(req: Request, res: Response) {
  try {
    const { eventKey } = req.params;
    const event = await dbGetEventCounter(eventKey);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function incrementEvent(req: Request, res: Response) {
  try {
    const { eventKey } = req.params;
    const { userId, anonymousId } = req.body;

    if (!userId && !anonymousId) {
      return res.status(400).json({
        success: false,
        error: 'Either userId or anonymousId is required',
      });
    }

    const result = await dbIncrementEventCounter(eventKey, userId, anonymousId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error incrementing counter:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getUserParticipation(req: Request, res: Response) {
  try {
    const { eventKey, userId } = req.params;
    const participation = await dbGetUserParticipation(eventKey, userId);

    res.json({ success: true, data: participation });
  } catch (error) {
    console.error('Error fetching participation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getEventStats(req: Request, res: Response) {
  try {
    const { eventKey } = req.params;
    const stats = await dbGetEventStats(eventKey);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}