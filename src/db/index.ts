import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as profilesSchema from './profilesSchema.js';
import * as eventsSchema from './eventsSchema.js';
import * as legendsZATrackerSchema from './legendsZATrackerSchema.js';
import * as socialSchema from './socialSchema.js';

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

// For Supabase pooler in Session mode (port 6543), use prepare: false
// For direct connection (port 5432), remove prepare: false
export const client = postgres(connectionString, {
  prepare: false,
  ssl: 'require',
  max: 10, // Connection pool size
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 30, // Timeout after 30 seconds if can't connect
  keep_alive: 30, // keep TCP connection alive
});

// Merge schemas so drizzle has the full set of tables
export const db = drizzle(client, { schema: {
  ...profilesSchema,
  ...eventsSchema,
  ...legendsZATrackerSchema,
  ...socialSchema,
} });