import { eq, sql } from 'drizzle-orm';
import { db } from './index.js';
import {
  profiles,
  type Profile,
  type NewProfile,
} from './profilesSchema.js';

// Get profile by user ID

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId));
    
    return profile || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

// Get profile by username
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username));
    
    return profile || null;
  } catch (error) {
    console.error('Error fetching profile by username:', error);
    throw error;
  }
}

// Create a new profile
export async function createProfile(profileData: NewProfile): Promise<Profile> {
  try {
    const [newProfile] = await db
      .insert(profiles)
      .values({
        ...profileData,
        updatedAt: sql`NOW()`,
        createdAt: sql`NOW()`,
      })
      .returning();
    
    return newProfile;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}

// Update profile
export async function updateProfile(
  userId: string, 
  updates: Partial<NewProfile>
): Promise<Profile | null> {
  try {
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        ...updates,
        updatedAt: sql`NOW()`,
      })
      .where(eq(profiles.id, userId))
      .returning();
    
    return updatedProfile || null;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// Upsert profile (insert or update)
export async function upsertProfile(profileData: NewProfile): Promise<Profile> {
  try {
    const [profile] = await db
      .insert(profiles)
      .values({
        ...profileData,
        updatedAt: sql`NOW()`,
        createdAt: sql`NOW()`,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          username: profileData.username,
          birthdate: profileData.birthdate,
          avatarUrl: profileData.avatarUrl,
          bio: profileData.bio,
          updatedAt: sql`NOW()`,
        },
      })
      .returning();
    
    return profile;
  } catch (error) {
    console.error('Error upserting profile:', error);
    throw error;
  }
}

// Delete profile
export async function deleteProfile(userId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(profiles)
      .where(eq(profiles.id, userId))
      .returning();
    
    return result.length > 0;
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}

// Search profiles by username (for user discovery)
export async function searchProfilesByUsername(query: string, limit: number = 20): Promise<Profile[]> {
  try {
    const searchResults = await db
      .select()
      .from(profiles)
      .where(sql`${profiles.username} ILIKE ${'%' + query + '%'}`)
      .limit(limit);
    
    return searchResults;
  } catch (error) {
    console.error('Error searching profiles:', error);
    throw error;
  }
}

// Get all profiles (for admin purposes - use with caution)
export async function getAllProfiles(limit: number = 100, offset: number = 0): Promise<Profile[]> {
  try {
    const allProfiles = await db
      .select()
      .from(profiles)
      .limit(limit)
      .offset(offset)
      .orderBy(profiles.createdAt);
    
    return allProfiles;
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    throw error;
  }
}