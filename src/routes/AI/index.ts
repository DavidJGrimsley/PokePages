import { Router } from 'express';
import { chat } from './AIController';

const aiRouter = Router();

aiRouter.post('/chat', chat);

export default aiRouter;