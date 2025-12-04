import { Router } from 'express';
import {
  listUserClaims,
  getUserClaim,
  upsertUserClaim,
  syncUserClaims,
  deleteUserClaim,
} from './controller.js';

const eventClaimsRouter = Router();

/**
 * @route GET /api/event-claims
 * @desc Get all claims for a user
 * @access Public
 * @query userId - User ID
 */
eventClaimsRouter.get('/', listUserClaims);

/**
 * @route POST /api/event-claims/sync
 * @desc Batch sync multiple claims
 * @access Public
 * @body { userId: string, claims: Array<{ eventKey, claimed, claimedAt? }> }
 */
eventClaimsRouter.post('/sync', syncUserClaims);

/**
 * @route GET /api/event-claims/:eventKey
 * @desc Get a specific claim for a user and event
 * @access Public
 * @query userId - User ID
 */
eventClaimsRouter.get('/:eventKey', getUserClaim);

/**
 * @route POST /api/event-claims/:eventKey
 * @desc Upsert a claim (create or update)
 * @access Public
 * @body { userId: string, claimed: boolean, claimedAt?: string }
 */
eventClaimsRouter.post('/:eventKey', upsertUserClaim);

/**
 * @route DELETE /api/event-claims/:eventKey
 * @desc Delete a claim
 * @access Public
 * @body { userId: string }
 */
eventClaimsRouter.delete('/:eventKey', deleteUserClaim);

export default eventClaimsRouter;
