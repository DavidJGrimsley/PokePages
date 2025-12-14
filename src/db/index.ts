import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as profilesSchema from './profilesSchema.js';
import * as eventsSchema from './eventsSchema.js';
import * as dexTrackerSchema from './dexTrackerSchema.js';
import * as socialSchema from './socialSchema.js';
import * as favoritesSchema from './favoritesSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

const envLoaded = envCandidates.some((envPath) => {
  if (fs.existsSync(envPath)) {
    loadEnv({ path: envPath });
    return true;
  }
  return false;
});

if (!envLoaded) {
  console.warn('No .env file found. Proceeding with existing environment variables.');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

const connectionString = process.env.DATABASE_URL;

// Optimized connection pool settings for Supabase pooler
// Using Session mode (pgbouncer) - prepare: false is required
export let client: any;
try {
  client = postgres(connectionString, {
  prepare: false, // Required for pgbouncer
  ssl: 'require',
  max: 3, // Minimal pool for better connection stability
  idle_timeout: 20, // Timeout idle connections after 20 seconds
  connect_timeout: 30, // 30 second timeout for initial connection
  max_lifetime: 60 * 30, // 30 minutes - recycle connections to prevent stale connections
  });
} catch (e) {
  console.error('Error initializing Postgres client:', e);
  throw e;
}

// Merge schemas so drizzle has the full set of tables
export let db: any;
try {
  db = drizzle(client, { schema: {
  ...profilesSchema,
  ...eventsSchema,
  ...dexTrackerSchema,
  ...socialSchema,
  ...favoritesSchema,
  } });
} catch (e) {
  console.error('Error initializing Drizzle DB:', e);
  throw e;
}

// Helper for a lightweight DB ping
export async function getDbPing() {
  try {
    const result = await db.execute('SELECT 1 as test');
    return { ok: true, result };
  } catch (e) {
    console.error('[DB] getDbPing error:', e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    const errorStack = e instanceof Error ? e.stack : undefined;
    const errorCause = e instanceof Error && 'cause' in e ? e.cause : undefined;
    return { 
      ok: false, 
      error: errorMessage,
      stack: errorStack,
      cause: errorCause 
    };
  }
}

// Optional DB monitor (ENABLED via env var)
if (process.env.ENABLE_DB_MONITOR === 'true') {
  const intervalMs = Number(process.env.DB_MONITOR_INTERVAL_MS || 30000);
  setInterval(async () => {
    try {
      await db.execute('SELECT 1 as ok');
    } catch (err) {
      console.error('DB monitor ping failed:', err);
    }
  }, intervalMs);
}