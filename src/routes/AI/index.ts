import { Router } from 'express';
import { chat } from './AIController.js';

const aiRouter = Router();

/**
 * @route POST /api/ai/chat
 * @desc Send a message to the AI chatbot
 * @access Public
 * @body { message: string, conversationId?: string }
 */
aiRouter.post('/chat', chat);

export default aiRouter;