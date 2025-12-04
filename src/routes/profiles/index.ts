import { Router } from 'express';

import {
  getProfile,
  getProfileByUsername,
  createProfile,
  updateProfile,
  deleteProfile,
  searchProfiles,
  getAllProfiles,
} from './controller.js';
import { validateData, validateParams, validateQuery } from '../../middlewares/validationMiddleware.js';
import { verifySupabaseAuth, verifyResourceOwnership, requireAdmin } from '../../middlewares/authMiddleware.js';
import { 
  updateProfileSchema,
  userEditableProfileSchema,
  signupProfileSchema,
  userIdParamsSchema,
  usernameParamsSchema,
  searchQuerySchema,
  paginationQuerySchema,
} from '../../db/profilesSchema.js';

const profileRouter = Router();

/**
 * @route GET /api/profiles/search
 * @desc Search for profiles by username
 * @access Public
 * @query { q: string, limit?: number }
 */
profileRouter.get('/search', validateQuery(searchQuerySchema), searchProfiles);

/**
 * @route GET /api/profiles/all
 * @desc Get all profiles with pagination (admin only)
 * @access Private (Admin)
 * @query { limit?: number, offset?: number }
 */
profileRouter.get('/all', 
  verifySupabaseAuth,
  requireAdmin,
  validateQuery(paginationQuerySchema), 
  getAllProfiles
);

/**
 * @route GET /api/profiles/by-username/:username
 * @desc Get a profile by username
 * @access Public
 */
profileRouter.get('/by-username/:username', validateParams(usernameParamsSchema), getProfileByUsername);

/**
 * @route GET /api/profiles/:userId
 * @desc Get a profile by user ID
 * @access Public
 */
profileRouter.get('/:userId', validateParams(userIdParamsSchema), getProfile);

/**
 * @route POST /api/profiles
 * @desc Create a new profile
 * @access Public
 * @body { userId: string, username: string, displayName?: string, ... }
 */
profileRouter.post('/', validateData(signupProfileSchema), createProfile);

/**
 * @route PUT /api/profiles/:userId
 * @desc Update a profile (requires auth + ownership)
 * @access Private
 * @body { username?: string, displayName?: string, bio?: string, ... }
 */
profileRouter.put('/:userId', 
  verifySupabaseAuth,
  verifyResourceOwnership,
  validateParams(userIdParamsSchema),
  validateData(updateProfileSchema),
  updateProfile
);

/**
 * @route DELETE /api/profiles/:userId
 * @desc Delete a profile (requires auth + ownership)
 * @access Private
 */
profileRouter.delete('/:userId', 
  verifySupabaseAuth,
  verifyResourceOwnership,
  validateParams(userIdParamsSchema), 
  deleteProfile
);

export default profileRouter;