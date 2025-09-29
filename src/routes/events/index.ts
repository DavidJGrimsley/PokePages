import { Router } from 'express';

import {
  listEvents,
  getEvent,
  incrementEvent,
  getUserParticipation,
  getEventStats,
} from './eventsController';
import { validateData } from '../../middlewares/validationMiddleware';
import { incrementEventSchema } from '../../db/eventsSchema';

const eventRouter = Router();

eventRouter.get('/', listEvents);

eventRouter.get('/:eventKey', getEvent);

eventRouter.post('/:eventKey/increment', validateData(incrementEventSchema), incrementEvent);

eventRouter.get('/:eventKey/participation/:userId', getUserParticipation);

eventRouter.get('/:eventKey/stats', getEventStats);

export default eventRouter;