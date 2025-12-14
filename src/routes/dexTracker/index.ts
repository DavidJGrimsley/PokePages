import { Router } from 'express';
import { verifySupabaseAuth } from '../../middlewares/authMiddleware.js';
import {
  getUserTrackerData,
  getPokemonRecord,
  updatePokemonFormData,
  batchUpdateRecords,
  deletePokemonRecordData,
  getTrackerStats
} from './controller.js';


// Debug: Log when this router file is loaded
console.log('[DEBUG] dexTracker/index.ts router loaded');

const router = Router();

// Lightweight health check that does NOT require auth
// Useful to verify the router is actually mounted in the running server
router.get('/health', (_req, res) => {
  console.log('[DEBUG] /api/dex-tracker/health endpoint hit');
  return res.json({ ok: true, service: 'dex-tracker' });
});

// Apply authentication middleware to all subsequent routes
router.use((req, res, next) => {
  console.log(`[DEBUG] dex-tracker router: ${req.method} ${req.originalUrl}`);
  next();
});
router.use(verifySupabaseAuth);

/**
 * @route GET /api/dex-tracker?pokedex=lumiose
 * @desc Get all Pokemon tracker data for the authenticated user in a specific pokedex
 * @access Private
 */
router.get('/', getUserTrackerData);

/**
 * @route GET /api/dex-tracker/stats?pokedex=lumiose
 * @desc Get Pokemon tracker statistics for the authenticated user in a specific pokedex
 * @access Private
 */
router.get('/stats', getTrackerStats);

/**
 * @route GET /api/dex-tracker/:pokemonId?pokedex=lumiose
 * @desc Get specific Pokemon record for the authenticated user
 * @access Private
 */
router.get('/:pokemonId', getPokemonRecord);

/**
 * @route PUT /api/dex-tracker/:pokemonId
 * @desc Update a Pokemon form for the authenticated user
 * @access Private
 * @body { pokedex: string, formType: string, value: boolean }
 */
router.put('/:pokemonId', updatePokemonFormData);

/**
 * @route POST /api/dex-tracker/batch
 * @desc Batch update multiple Pokemon records
 * @access Private
 * @body { pokedex: string, updates: Array<{ pokemonId: number, formData: object }> }
 */
router.post('/batch', batchUpdateRecords);

/**
 * @route DELETE /api/dex-tracker/:pokemonId?pokedex=lumiose
 * @desc Delete a Pokemon record
 * @access Private
 */
router.delete('/:pokemonId', deletePokemonRecordData);

export default router;