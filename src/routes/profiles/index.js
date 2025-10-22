"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var controller_js_1 = require("./controller.js");
var validationMiddleware_js_1 = require("../../middlewares/validationMiddleware.js");
var authMiddleware_js_1 = require("../../middlewares/authMiddleware.js");
var profilesSchema_js_1 = require("../../db/profilesSchema.js");
var profileRouter = (0, express_1.Router)();
// GET /profiles/search?q=username&limit=20 (public)
profileRouter.get('/search', (0, validationMiddleware_js_1.validateQuery)(profilesSchema_js_1.searchQuerySchema), controller_js_1.searchProfiles);
// GET /profiles/all?limit=100&offset=0 (admin only)
profileRouter.get('/all', authMiddleware_js_1.verifySupabaseAuth, authMiddleware_js_1.requireAdmin, (0, validationMiddleware_js_1.validateQuery)(profilesSchema_js_1.paginationQuerySchema), controller_js_1.getAllProfiles);
// GET /profiles/by-username/:username (public)
profileRouter.get('/by-username/:username', (0, validationMiddleware_js_1.validateParams)(profilesSchema_js_1.usernameParamsSchema), controller_js_1.getProfileByUsername);
// GET /profiles/:userId (public)
profileRouter.get('/:userId', (0, validationMiddleware_js_1.validateParams)(profilesSchema_js_1.userIdParamsSchema), controller_js_1.getProfile);
// POST /profiles (create new profile - public for sign-up)
profileRouter.post('/', (0, validationMiddleware_js_1.validateData)(profilesSchema_js_1.signupProfileSchema), controller_js_1.createProfile);
// PUT /profiles/:userId (update profile - requires auth + ownership)
profileRouter.put('/:userId', authMiddleware_js_1.verifySupabaseAuth, authMiddleware_js_1.verifyResourceOwnership, (0, validationMiddleware_js_1.validateParams)(profilesSchema_js_1.userIdParamsSchema), (0, validationMiddleware_js_1.validateData)(profilesSchema_js_1.updateProfileSchema), controller_js_1.updateProfile);
// DELETE /profiles/:userId (delete profile - requires auth + ownership)
profileRouter.delete('/:userId', authMiddleware_js_1.verifySupabaseAuth, authMiddleware_js_1.verifyResourceOwnership, (0, validationMiddleware_js_1.validateParams)(profilesSchema_js_1.userIdParamsSchema), controller_js_1.deleteProfile);
exports.default = profileRouter;
