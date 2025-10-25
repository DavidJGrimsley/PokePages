import { eq, and } from 'drizzle-orm';
import { db } from './index.js';
import { legendsZATracker } from './legendsZATrackerSchema.js';
import { RegisteredStatus } from '@/src/types/tracker';

// RegisteredStatus is now shared from src/types/tracker

console.log('[DEBUG] legendsZATrackerQueries.ts loaded');

export type PokemonTrackerRecord = {
  id: string;
  userId: string;
  pokemonId: number;
  normal: boolean;
  shiny: boolean;
  alpha: boolean;
  alphaShiny: boolean;
  updatedAt: Date | null;
  createdAt: Date | null;
};

/**
 * Get all Pokemon tracker records for a user
 */
export async function getUserPokemonTrackerData(userId: string): Promise<PokemonTrackerRecord[]> {
  try {
    const result = await db
      .select()
      .from(legendsZATracker)
      .where(eq(legendsZATracker.userId, userId));
    
    return result;
  } catch (error) {
    console.error('Error fetching user Pokemon tracker data:', error);
    throw error;
  }
}

/**
 * Get specific Pokemon tracker record for a user
 */
export async function getUserPokemonRecord(
  userId: string, 
  pokemonId: number
): Promise<PokemonTrackerRecord | null> {
  try {
    const result = await db
      .select()
      .from(legendsZATracker)
      .where(and(
        eq(legendsZATracker.userId, userId),
        eq(legendsZATracker.pokemonId, pokemonId)
      ))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching Pokemon record:', error);
    throw error;
  }
}

/**
 * Upsert Pokemon tracker record (insert or update)
 */
export async function upsertPokemonRecord(
  userId: string,
  pokemonId: number,
  formData: RegisteredStatus
): Promise<PokemonTrackerRecord> {
  try {
    // First, try to get existing record
    const existingRecord = await getUserPokemonRecord(userId, pokemonId);
    
    if (existingRecord) {
      // Update existing record
      const result = await db
        .update(legendsZATracker)
        .set({
          ...formData,
          updatedAt: new Date(),
        })
        .where(and(
          eq(legendsZATracker.userId, userId),
          eq(legendsZATracker.pokemonId, pokemonId)
        ))
        .returning();
      
      return result[0];
    } else {
      // Insert new record
      const result = await db
        .insert(legendsZATracker)
        .values({
          userId,
          pokemonId,
          ...formData,
        })
        .returning();
      
      return result[0];
    }
  } catch (error) {
    console.error('Error upserting Pokemon record:', error);
    throw error;
  }
}

/**
 * Update specific form for a Pokemon
 */
export async function updatePokemonForm(
  userId: string,
  pokemonId: number,
  formType: keyof RegisteredStatus,
  value: boolean
): Promise<PokemonTrackerRecord> {
  try {
    // Get current record or create default
    let currentRecord = await getUserPokemonRecord(userId, pokemonId);
    
    if (!currentRecord) {
      // Create new record with default values
      const defaultFormData: RegisteredStatus = {
        normal: false,
        shiny: false,
        alpha: false,
        alphaShiny: false,
      };
      defaultFormData[formType] = value;
      
      return await upsertPokemonRecord(userId, pokemonId, defaultFormData);
    }
    
    // Update the specific form
    const updatedFormData: RegisteredStatus = {
      normal: currentRecord.normal,
      shiny: currentRecord.shiny,
      alpha: currentRecord.alpha,
      alphaShiny: currentRecord.alphaShiny,
    };
    updatedFormData[formType] = value;
    
    return await upsertPokemonRecord(userId, pokemonId, updatedFormData);
  } catch (error) {
    console.error('Error updating Pokemon form:', error);
    throw error;
  }
}

/**
 * Batch update multiple Pokemon records
 */
export async function batchUpdatePokemonRecords(
  userId: string,
  updates: { pokemonId: number; formData: RegisteredStatus }[]
): Promise<PokemonTrackerRecord[]> {
  try {
    const results: PokemonTrackerRecord[] = [];
    
    // Process updates sequentially to avoid conflicts
    for (const update of updates) {
      const result = await upsertPokemonRecord(userId, update.pokemonId, update.formData);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error('Error batch updating Pokemon records:', error);
    throw error;
  }
}

/**
 * Delete specific Pokemon tracker record
 */
export async function deletePokemonRecord(
  userId: string,
  pokemonId: number
): Promise<void> {
  try {
    await db
      .delete(legendsZATracker)
      .where(and(
        eq(legendsZATracker.userId, userId),
        eq(legendsZATracker.pokemonId, pokemonId)
      ));
  } catch (error) {
    console.error('Error deleting Pokemon record:', error);
    throw error;
  }
}

/**
 * Get Pokemon tracker statistics for a user
 */
export async function getUserPokemonStats(userId: string) {
  try {
    const records = await getUserPokemonTrackerData(userId);
    
    const stats = {
      totalRegistered: 0,
      totalShiny: 0,
      totalAlpha: 0,
      totalAlphaShiny: 0,
      totalUnique: records.length,
      registeredPercent: 0,
      shinyPercent: 0,
      alphaPercent: 0,
      alphaShinyPercent: 0,
    };
    
    records.forEach(record => {
      if (record.normal) stats.totalRegistered++;
      if (record.shiny) stats.totalShiny++;
      if (record.alpha) stats.totalAlpha++;
      if (record.alphaShiny) stats.totalAlphaShiny++;
    });
    
    // Calculate percentages (assuming 235 total Pokemon)
    const totalPokemon = 235;
    stats.registeredPercent = Math.round((stats.totalRegistered / totalPokemon) * 100);
    stats.shinyPercent = Math.round((stats.totalShiny / totalPokemon) * 100);
    stats.alphaPercent = Math.round((stats.totalAlpha / totalPokemon) * 100);
    stats.alphaShinyPercent = Math.round((stats.totalAlphaShiny / totalPokemon) * 100);
    
    return stats;
  } catch (error) {
    console.error('Error getting Pokemon stats:', error);
    throw error;
  }
}