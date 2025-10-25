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
console.log('[DEBUG] legends-za/index.ts router loaded');

const router = Router();

// Lightweight health check that does NOT require auth
// Useful to verify the router is actually mounted in the running server
router.get('/health', (_req, res) => {
  console.log('[DEBUG] /api/legends-za/health endpoint hit');
  return res.json({ ok: true, service: 'legends-za' });
});

// Apply authentication middleware to all subsequent routes
router.use((req, res, next) => {
  console.log(`[DEBUG] legends-za router: ${req.method} ${req.originalUrl}`);
  next();
});
router.use(verifySupabaseAuth);

/**
 * @route GET /api/legends-za
 * @desc Get all Pokemon tracker data for the authenticated user
 * @access Private
 */
router.get('/', getUserTrackerData);

/**
 * @route GET /api/legends-za/stats
 * @desc Get Pokemon tracker statistics for the authenticated user
 * @access Private
 */
router.get('/stats', getTrackerStats);

/**
 * @route GET /api/legends-za/:pokemonId
 * @desc Get specific Pokemon record for the authenticated user
 * @access Private
 */
router.get('/:pokemonId', getPokemonRecord);

/**
 * @route PUT /api/legends-za/:pokemonId
 * @desc Update a Pokemon form for the authenticated user
 * @access Private
 * @body { formType: string, value: boolean }
 */
router.put('/:pokemonId', updatePokemonFormData);

/**
 * @route POST /api/legends-za/batch
 * @desc Batch update multiple Pokemon records
 * @access Private
 * @body { updates: Array<{ pokemonId: number, formData: object }> }
 */
router.post('/batch', batchUpdateRecords);

/**
 * @route DELETE /api/legends-za/:pokemonId
 * @desc Delete a Pokemon record
 * @access Private
 */
router.delete('/:pokemonId', deletePokemonRecordData);

export default router;