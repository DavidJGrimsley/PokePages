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

// GET /profiles/search?q=username&limit=20 (public)
profileRouter.get('/search', validateQuery(searchQuerySchema), searchProfiles);

// GET /profiles/all?limit=100&offset=0 (admin only)
profileRouter.get('/all', 
  verifySupabaseAuth,
  requireAdmin,
  validateQuery(paginationQuerySchema), 
  getAllProfiles
);

// GET /profiles/by-username/:username (public)
profileRouter.get('/by-username/:username', validateParams(usernameParamsSchema), getProfileByUsername);

// GET /profiles/:userId (public)
profileRouter.get('/:userId', validateParams(userIdParamsSchema), getProfile);

// POST /profiles (create new profile - public for sign-up)
profileRouter.post('/', validateData(signupProfileSchema), createProfile);

// PUT /profiles/:userId (update profile - requires auth + ownership)
profileRouter.put('/:userId', 
  verifySupabaseAuth,
  verifyResourceOwnership,
  validateParams(userIdParamsSchema),
  validateData(updateProfileSchema),
  updateProfile
);

// DELETE /profiles/:userId (delete profile - requires auth + ownership)
profileRouter.delete('/:userId', 
  verifySupabaseAuth,
  verifyResourceOwnership,
  validateParams(userIdParamsSchema), 
  deleteProfile
);

export default profileRouter;