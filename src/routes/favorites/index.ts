import { Router } from 'express';
import * as favoritesController from './controller.js';
import { verifySupabaseAuth } from '../../middlewares/authMiddleware.js';

const router = Router();

router.get('/', verifySupabaseAuth, favoritesController.getFavorites);
router.post('/', verifySupabaseAuth, favoritesController.addFavorite);
router.delete('/:featureKey', verifySupabaseAuth, favoritesController.removeFavorite);

export default router;
