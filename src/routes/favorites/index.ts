import { Router } from 'express';
import * as favoritesController from './controller.js';
import { verifySupabaseAuth } from '../../middlewares/authMiddleware.js';

const router = Router();

/**
 * @route GET /api/favorites
 * @desc Get all favorite features for the authenticated user
 * @access Private
 */
router.get('/', verifySupabaseAuth, favoritesController.getFavorites);

/**
 * @route POST /api/favorites
 * @desc Add a new favorite feature
 * @access Private
 * @body { featureKey: string, featureTitle?: string }
 */
router.post('/', verifySupabaseAuth, favoritesController.addFavorite);

/**
 * @route DELETE /api/favorites/:featureKey
 * @desc Remove a favorite feature
 * @access Private
 */
router.delete('/:featureKey', verifySupabaseAuth, favoritesController.removeFavorite);

export default router;
