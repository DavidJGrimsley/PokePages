import { eq, sql } from 'drizzle-orm';
import { db } from './index.js';
import { profiles, } from './profilesSchema.js';
export async function getProfile(userId) {
    try {
        const [profile] = await db
            .select()
            .from(profiles)
            .where(eq(profiles.id, userId));
        return profile || null;
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}
export async function getProfileByUsername(username) {
    try {
        const [profile] = await db
            .select()
            .from(profiles)
            .where(eq(profiles.username, username));
        return profile || null;
    }
    catch (error) {
        console.error('Error fetching profile by username:', error);
        throw error;
    }
}
export async function createProfile(profileData) {
    try {
        const [newProfile] = await db
            .insert(profiles)
            .values({
            ...profileData,
            updatedAt: sql `NOW()`,
            createdAt: sql `NOW()`,
        })
            .returning();
        return newProfile;
    }
    catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
}
export async function updateProfile(userId, updates) {
    try {
        const [updatedProfile] = await db
            .update(profiles)
            .set({
            ...updates,
            updatedAt: sql `NOW()`,
        })
            .where(eq(profiles.id, userId))
            .returning();
        return updatedProfile || null;
    }
    catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}
export async function upsertProfile(profileData) {
    try {
        const [profile] = await db
            .insert(profiles)
            .values({
            ...profileData,
            updatedAt: sql `NOW()`,
            createdAt: sql `NOW()`,
        })
            .onConflictDoUpdate({
            target: profiles.id,
            set: {
                username: profileData.username,
                birthdate: profileData.birthdate,
                avatarUrl: profileData.avatarUrl,
                bio: profileData.bio,
                updatedAt: sql `NOW()`,
            },
        })
            .returning();
        return profile;
    }
    catch (error) {
        console.error('Error upserting profile:', error);
        throw error;
    }
}
export async function deleteProfile(userId) {
    try {
        const result = await db
            .delete(profiles)
            .where(eq(profiles.id, userId))
            .returning();
        return result.length > 0;
    }
    catch (error) {
        console.error('Error deleting profile:', error);
        throw error;
    }
}
export async function searchProfilesByUsername(query, limit = 20) {
    try {
        const searchResults = await db
            .select()
            .from(profiles)
            .where(sql `${profiles.username} ILIKE ${'%' + query + '%'}`)
            .limit(limit);
        return searchResults;
    }
    catch (error) {
        console.error('Error searching profiles:', error);
        throw error;
    }
}
export async function getAllProfiles(limit = 100, offset = 0) {
    try {
        const allProfiles = await db
            .select()
            .from(profiles)
            .limit(limit)
            .offset(offset)
            .orderBy(profiles.createdAt);
        return allProfiles;
    }
    catch (error) {
        console.error('Error fetching all profiles:', error);
        throw error;
    }
}
