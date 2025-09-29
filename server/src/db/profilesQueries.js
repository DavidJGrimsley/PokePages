"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.getProfileByUsername = getProfileByUsername;
exports.createProfile = createProfile;
exports.updateProfile = updateProfile;
exports.upsertProfile = upsertProfile;
exports.deleteProfile = deleteProfile;
exports.searchProfilesByUsername = searchProfilesByUsername;
exports.getAllProfiles = getAllProfiles;
const drizzle_orm_1 = require("drizzle-orm");
const index_1 = require("./index");
const profilesSchema_1 = require("./profilesSchema");
async function getProfile(userId) {
    try {
        const [profile] = await index_1.db
            .select()
            .from(profilesSchema_1.profiles)
            .where((0, drizzle_orm_1.eq)(profilesSchema_1.profiles.id, userId));
        return profile || null;
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}
async function getProfileByUsername(username) {
    try {
        const [profile] = await index_1.db
            .select()
            .from(profilesSchema_1.profiles)
            .where((0, drizzle_orm_1.eq)(profilesSchema_1.profiles.username, username));
        return profile || null;
    }
    catch (error) {
        console.error('Error fetching profile by username:', error);
        throw error;
    }
}
async function createProfile(profileData) {
    try {
        const [newProfile] = await index_1.db
            .insert(profilesSchema_1.profiles)
            .values({
            ...profileData,
            updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
            createdAt: (0, drizzle_orm_1.sql) `NOW()`,
        })
            .returning();
        return newProfile;
    }
    catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
}
async function updateProfile(userId, updates) {
    try {
        const [updatedProfile] = await index_1.db
            .update(profilesSchema_1.profiles)
            .set({
            ...updates,
            updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
        })
            .where((0, drizzle_orm_1.eq)(profilesSchema_1.profiles.id, userId))
            .returning();
        return updatedProfile || null;
    }
    catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}
async function upsertProfile(profileData) {
    try {
        const [profile] = await index_1.db
            .insert(profilesSchema_1.profiles)
            .values({
            ...profileData,
            updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
            createdAt: (0, drizzle_orm_1.sql) `NOW()`,
        })
            .onConflictDoUpdate({
            target: profilesSchema_1.profiles.id,
            set: {
                username: profileData.username,
                birthdate: profileData.birthdate,
                avatarUrl: profileData.avatarUrl,
                bio: profileData.bio,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
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
async function deleteProfile(userId) {
    try {
        const result = await index_1.db
            .delete(profilesSchema_1.profiles)
            .where((0, drizzle_orm_1.eq)(profilesSchema_1.profiles.id, userId))
            .returning();
        return result.length > 0;
    }
    catch (error) {
        console.error('Error deleting profile:', error);
        throw error;
    }
}
async function searchProfilesByUsername(query, limit = 20) {
    try {
        const searchResults = await index_1.db
            .select()
            .from(profilesSchema_1.profiles)
            .where((0, drizzle_orm_1.sql) `${profilesSchema_1.profiles.username} ILIKE ${'%' + query + '%'}`)
            .limit(limit);
        return searchResults;
    }
    catch (error) {
        console.error('Error searching profiles:', error);
        throw error;
    }
}
async function getAllProfiles(limit = 100, offset = 0) {
    try {
        const allProfiles = await index_1.db
            .select()
            .from(profilesSchema_1.profiles)
            .limit(limit)
            .offset(offset)
            .orderBy(profilesSchema_1.profiles.createdAt);
        return allProfiles;
    }
    catch (error) {
        console.error('Error fetching all profiles:', error);
        throw error;
    }
}
