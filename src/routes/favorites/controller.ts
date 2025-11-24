import { Request, Response } from 'express';
import * as favoritesQueries from '../../db/favoritesQueries.js';

export async function getFavorites(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });
    const rows = await favoritesQueries.getUserFavorites(userId);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch favorites' });
  }
}

export async function addFavorite(req: Request, res: Response) {
  try {
    const userId = req.user?.id as string;
    if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });
    const { featureKey, featureTitle } = req.body;
    if (!featureKey) return res.status(400).json({ success: false, error: 'featureKey is required' });
    const row = await favoritesQueries.addFavoriteFeature(userId, featureKey, featureTitle);
    res.json({ success: true, data: row });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Failed to add favorite' });
  }
}

export async function removeFavorite(req: Request, res: Response) {
  try {
    const userId = req.user?.id as string;
    if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });
    const { featureKey } = req.params;
    if (!featureKey) return res.status(400).json({ success: false, error: 'featureKey is required' });
    await favoritesQueries.removeFavoriteFeature(userId, decodeURIComponent(featureKey));
    res.json({ success: true, message: 'Favorite removed' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to remove favorite' });
  }
}

export default {
  getFavorites,
  addFavorite,
  removeFavorite,
};
