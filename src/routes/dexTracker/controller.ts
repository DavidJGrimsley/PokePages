import { Request, Response } from 'express';
import {
  getUserPokemonTrackerData,
  getUserPokemonRecord,
  updatePokemonForm,
  batchUpdatePokemonRecords,
  deletePokemonRecord,
  getUserPokemonStats,
} from '../../db/dexTrackerQueries.js';
import { RegisteredStatus } from '@/src/types/tracker';

console.log('[DEBUG] dexTracker/controller.ts loaded');

/**
 * Get all Pokemon tracker data for the authenticated user
 */
export const getUserTrackerData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { pokedex } = req.query;
    if (!pokedex || typeof pokedex !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'pokedex query parameter is required (e.g., ?pokedex=lumiose)'
      });
    }

    const data = await getUserPokemonTrackerData(userId, pokedex);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting user tracker data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tracker data'
    });
  }
};

/**
 * Get specific Pokemon record for the authenticated user
 */
export const getPokemonRecord = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { pokemonId } = req.params;
    const { pokedex } = req.query;
    
    if (!pokemonId || isNaN(parseInt(pokemonId))) {
      return res.status(400).json({
        success: false,
        error: 'Valid Pokemon ID is required'
      });
    }

    if (!pokedex || typeof pokedex !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'pokedex query parameter is required (e.g., ?pokedex=lumiose)'
      });
    }
    
    const record = await getUserPokemonRecord(userId, pokedex, parseInt(pokemonId));
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error getting Pokemon record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Pokemon record'
    });
  }
};

/**
 * Update a Pokemon form for the authenticated user
 */
export const updatePokemonFormData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { pokemonId } = req.params;
    const { formType, value, pokedex } = req.body;
    
    // Validation
    if (!pokemonId || isNaN(parseInt(pokemonId))) {
      return res.status(400).json({
        success: false,
        error: 'Valid Pokemon ID is required'
      });
    }

    if (!pokedex || typeof pokedex !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'pokedex field is required in request body (e.g., pokedex: "lumiose")'
      });
    }
    
    if (!formType || !['normal', 'shiny', 'alpha', 'alphaShiny'].includes(formType)) {
      return res.status(400).json({
        success: false,
        error: 'Valid form type is required (normal, shiny, alpha, alphaShiny)'
      });
    }
    
    if (typeof value !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Value must be a boolean'
      });
    }
    
    const updatedRecord = await updatePokemonForm(userId, pokedex, parseInt(pokemonId), formType as keyof RegisteredStatus, value);
    
    res.json({
      success: true,
      data: updatedRecord
    });
  } catch (error) {
    console.error('Error updating Pokemon form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update Pokemon form'
    });
  }
};

/**
 * Batch update multiple Pokemon records
 */
export const batchUpdateRecords = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { updates, pokedex } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        error: 'Updates must be an array'
      });
    }

    if (!pokedex || typeof pokedex !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'pokedex field is required in request body (e.g., pokedex: "lumiose")'
      });
    }
    
    // Validate each update
    for (const update of updates) {
      if (!update.pokemonId || isNaN(parseInt(update.pokemonId))) {
        return res.status(400).json({
          success: false,
          error: 'Each update must have a valid pokemonId'
        });
      }
      
      if (!update.formData || typeof update.formData !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Each update must have formData object'
        });
      }
      
      const { normal, shiny, alpha, alphaShiny } = update.formData;
      if (typeof normal !== 'boolean' || typeof shiny !== 'boolean' || 
          typeof alpha !== 'boolean' || typeof alphaShiny !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'All form fields must be boolean values'
        });
      }
    }
    
    const results = await batchUpdatePokemonRecords(userId, pokedex, updates);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error batch updating records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to batch update records'
    });
  }
};

/**
 * Delete a Pokemon record
 */
export const deletePokemonRecordData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { pokemonId } = req.params;
    const { pokedex } = req.query;
    
    if (!pokemonId || isNaN(parseInt(pokemonId))) {
      return res.status(400).json({
        success: false,
        error: 'Valid Pokemon ID is required'
      });
    }

    if (!pokedex || typeof pokedex !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'pokedex query parameter is required (e.g., ?pokedex=lumiose)'
      });
    }
    
    await deletePokemonRecord(userId, pokedex, parseInt(pokemonId));
    
    res.json({
      success: true,
      message: 'Pokemon record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Pokemon record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete Pokemon record'
    });
  }
};

/**
 * Get Pokemon tracker statistics for the authenticated user
 */
export const getTrackerStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { pokedex } = req.query;
    if (!pokedex || typeof pokedex !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'pokedex query parameter is required (e.g., ?pokedex=lumiose)'
      });
    }

    const stats = await getUserPokemonStats(userId, pokedex);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting tracker stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tracker statistics'
    });
  }
};