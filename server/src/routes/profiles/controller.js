"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.getProfileByUsername = getProfileByUsername;
exports.createProfile = createProfile;
exports.updateProfile = updateProfile;
exports.deleteProfile = deleteProfile;
exports.searchProfiles = searchProfiles;
exports.getAllProfiles = getAllProfiles;
const profilesQueries_1 = require("../../db/profilesQueries");
async function getProfile(req, res) {
    try {
        const { userId } = req.params;
        const profile = await (0, profilesQueries_1.getProfile)(userId);
        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found',
            });
        }
        res.json({ success: true, data: profile });
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function getProfileByUsername(req, res) {
    try {
        const { username } = req.params;
        const profile = await (0, profilesQueries_1.getProfileByUsername)(username);
        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found',
            });
        }
        res.json({ success: true, data: profile });
    }
    catch (error) {
        console.error('Error fetching profile by username:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function createProfile(req, res) {
    try {
        const profileData = req.validated;
        const newProfile = await (0, profilesQueries_1.createProfile)(profileData);
        res.status(201).json({ success: true, data: newProfile });
    }
    catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function updateProfile(req, res) {
    try {
        const { userId } = req.params;
        const updates = req.validated;
        const updatedProfile = await (0, profilesQueries_1.updateProfile)(userId, updates);
        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found',
            });
        }
        res.json({ success: true, data: updatedProfile });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function deleteProfile(req, res) {
    try {
        const { userId } = req.params;
        const deleted = await (0, profilesQueries_1.deleteProfile)(userId);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found',
            });
        }
        res.json({ success: true, message: 'Profile deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function searchProfiles(req, res) {
    try {
        const { q: query, limit = '20' } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "q" is required',
            });
        }
        const profiles = await (0, profilesQueries_1.searchProfilesByUsername)(query, parseInt(limit));
        res.json({ success: true, data: profiles });
    }
    catch (error) {
        console.error('Error searching profiles:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function getAllProfiles(req, res) {
    try {
        const { limit = '100', offset = '0' } = req.query;
        const profiles = await (0, profilesQueries_1.getAllProfiles)(parseInt(limit), parseInt(offset));
        res.json({ success: true, data: profiles });
    }
    catch (error) {
        console.error('Error fetching all profiles:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
