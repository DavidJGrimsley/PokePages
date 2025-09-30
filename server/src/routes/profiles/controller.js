import { getProfile as dbGetProfile, getProfileByUsername as dbGetProfileByUsername, createProfile as dbCreateProfile, updateProfile as dbUpdateProfile, deleteProfile as dbDeleteProfile, searchProfilesByUsername as dbSearchProfilesByUsername, getAllProfiles as dbGetAllProfiles, } from '../../db/profilesQueries.js';
export async function getProfile(req, res) {
    try {
        const { userId } = req.params;
        const profile = await dbGetProfile(userId);
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
export async function getProfileByUsername(req, res) {
    try {
        const { username } = req.params;
        const profile = await dbGetProfileByUsername(username);
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
export async function createProfile(req, res) {
    try {
        const profileData = req.validated;
        const newProfile = await dbCreateProfile(profileData);
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
export async function updateProfile(req, res) {
    try {
        const { userId } = req.params;
        const updates = req.validated;
        const updatedProfile = await dbUpdateProfile(userId, updates);
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
export async function deleteProfile(req, res) {
    try {
        const { userId } = req.params;
        const deleted = await dbDeleteProfile(userId);
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
export async function searchProfiles(req, res) {
    try {
        const { q: query, limit = '20' } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "q" is required',
            });
        }
        const profiles = await dbSearchProfilesByUsername(query, parseInt(limit));
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
export async function getAllProfiles(req, res) {
    try {
        const { limit = '100', offset = '0' } = req.query;
        const profiles = await dbGetAllProfiles(parseInt(limit), parseInt(offset));
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
