import { Router } from 'express';
import {
  listEvents,
  getEvent,
  incrementEvent,
  getUserParticipation,
  getEventStats,
} from './eventsController';

const eventRouter = Router();

eventRouter.get('/', listEvents);

eventRouter.get('/:eventKey', getEvent);

eventRouter.post('/:eventKey/increment', incrementEvent);

eventRouter.get('/:eventKey/participation/:userId', getUserParticipation);

eventRouter.get('/:eventKey/stats', getEventStats);

export default eventRouter;