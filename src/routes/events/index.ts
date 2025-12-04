import { Router } from 'express';

import {
  listEvents,
  getEvent,
  incrementEvent,
  getUserParticipation,
  getEventStats,
} from './controller.js';

import { validateData } from '../../middlewares/validationMiddleware.js';
import { incrementEventSchema } from '../../db/eventsSchema.js';

const eventRouter = Router();

/**
 * @route GET /api/events
 * @desc Get list of all events
 * @access Public
 */
eventRouter.get('/', listEvents);

/**
 * @route GET /api/events/:eventKey
 * @desc Get details for a specific event
 * @access Public
 */
eventRouter.get('/:eventKey', getEvent);

/**
 * @route POST /api/events/:eventKey/increment
 * @desc Increment the counter for an event
 * @access Public
 * @body { userId: string, count: number }
 */
eventRouter.post('/:eventKey/increment', validateData(incrementEventSchema), incrementEvent);

/**
 * @route GET /api/events/:eventKey/participation/:userId
 * @desc Get user's participation data for a specific event
 * @access Public
 */
eventRouter.get('/:eventKey/participation/:userId', getUserParticipation);

/**
 * @route GET /api/events/:eventKey/stats
 * @desc Get statistics for a specific event
 * @access Public
 */
eventRouter.get('/:eventKey/stats', getEventStats);

export default eventRouter;