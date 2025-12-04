import type { Request, Response } from 'express';
import {
  getUserClaims,
  getUserClaimForEvent,
  upsertClaim,
  batchUpsertClaims,
  deleteClaim,
} from '../../db/eventClaimsQueries.js';

/**
 * @route GET /api/event-claims
 * @desc Get all claims for a user
 * @access Public (requires userId query param)
 */
export async function listUserClaims(req: Request, res: Response) {
  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required',
      });
    }
    
    const claims = await getUserClaims(userId);
    
    return res.status(200).json({
      success: true,
      data: claims,
    });
  } catch (error) {
    console.error('Error in listUserClaims:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user claims',
    });
  }
}

/**
 * @route GET /api/event-claims/:eventKey
 * @desc Get a specific claim for a user and event
 * @access Public (requires userId query param)
 */
export async function getUserClaim(req: Request, res: Response) {
  try {
    const { eventKey } = req.params;
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required',
      });
    }
    
    if (!eventKey) {
      return res.status(400).json({
        success: false,
        error: 'eventKey parameter is required',
      });
    }
    
    const claim = await getUserClaimForEvent(userId, eventKey);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found',
      });
    }
    
    return res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    console.error('Error in getUserClaim:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user claim',
    });
  }
}

/**
 * @route POST /api/event-claims/:eventKey
 * @desc Upsert a claim
 * @access Public
 * @body { userId: string, claimed: boolean, claimedAt?: string }
 */
export async function upsertUserClaim(req: Request, res: Response) {
  try {
    const { eventKey } = req.params;
    const { userId, claimed, claimedAt } = req.body;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }
    
    if (!eventKey) {
      return res.status(400).json({
        success: false,
        error: 'eventKey is required',
      });
    }
    
    if (typeof claimed !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'claimed must be a boolean',
      });
    }
    
    const claim = await upsertClaim(userId, eventKey, claimed, claimedAt);
    
    return res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    console.error('Error in upsertUserClaim:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upsert claim',
    });
  }
}

/**
 * @route POST /api/event-claims/sync
 * @desc Batch sync multiple claims
 * @access Public
 * @body { userId: string, claims: [{ eventKey: string, claimed: boolean, claimedAt?: string }] }
 */
export async function syncUserClaims(req: Request, res: Response) {
  try {
    const { userId, claims } = req.body;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }
    
    if (!Array.isArray(claims)) {
      return res.status(400).json({
        success: false,
        error: 'claims must be an array',
      });
    }
    
    const syncedClaims = await batchUpsertClaims(userId, claims);
    
    return res.status(200).json({
      success: true,
      data: syncedClaims,
    });
  } catch (error) {
    console.error('Error in syncUserClaims:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to sync claims',
    });
  }
}

/**
 * @route DELETE /api/event-claims/:eventKey
 * @desc Delete a claim
 * @access Public
 * @body { userId: string }
 */
export async function deleteUserClaim(req: Request, res: Response) {
  try {
    const { eventKey } = req.params;
    const { userId } = req.body;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }
    
    if (!eventKey) {
      return res.status(400).json({
        success: false,
        error: 'eventKey is required',
      });
    }
    
    await deleteClaim(userId, eventKey);
    
    return res.status(200).json({
      success: true,
      message: 'Claim deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteUserClaim:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete claim',
    });
  }
}
