import { Request, Response } from 'express';
import {
  getProfile as dbGetProfile,
  getProfileByUsername as dbGetProfileByUsername,
  createProfile as dbCreateProfile,
  updateProfile as dbUpdateProfile,
  deleteProfile as dbDeleteProfile,
  searchProfilesByUsername as dbSearchProfilesByUsername,
  getAllProfiles as dbGetAllProfiles,
} from '../../db/profilesQueries.js';
import type { NewProfile } from '../../db/profilesSchema.js';

// Get profile by ID
export async function getProfile(req: Request, res: Response) {
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
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Get profile by username
export async function getProfileByUsername(req: Request, res: Response) {
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
  } catch (error) {
    console.error('Error fetching profile by username:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Create a new profile
export async function createProfile(req: Request, res: Response) {
  try {
    // req.validated contains the validated data from middleware
    const profileData = req.validated as NewProfile;
    
    const newProfile = await dbCreateProfile(profileData);
    res.status(201).json({ success: true, data: newProfile });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Update a profile
export async function updateProfile(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    // req.validated contains the validated update data from middleware
    const updates = req.validated as Partial<NewProfile>;

    const updatedProfile = await dbUpdateProfile(userId, updates);

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    res.json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Delete a profile
export async function deleteProfile(req: Request, res: Response) {
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
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Search profiles by username
export async function searchProfiles(req: Request, res: Response) {
  try {
    const { q: query, limit = '20' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
      });
    }

    const profiles = await dbSearchProfilesByUsername(query, parseInt(limit as string));
    res.json({ success: true, data: profiles });
  } catch (error) {
    console.error('Error searching profiles:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Get all profiles (admin endpoint)
export async function getAllProfiles(req: Request, res: Response) {
  try {
    const { limit = '100', offset = '0' } = req.query;
    
    const profiles = await dbGetAllProfiles(
      parseInt(limit as string), 
      parseInt(offset as string)
    );
    
    res.json({ success: true, data: profiles });
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}