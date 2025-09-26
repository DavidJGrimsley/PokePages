import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

const connectionString = process.env.DATABASE_URL;

// use prepare: false for Supabase pooler Transaction mode
export const client = postgres(connectionString, {
  prepare: false,
  ssl: 'require'
});

export const db = drizzle(client, { schema });