import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as profilesSchema from './profilesSchema.js';
import * as eventsSchema from './eventsSchema.js';
import * as legendsZATrackerSchema from './legendsZATrackerSchema.js';
import * as socialSchema from './socialSchema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

const connectionString = process.env.DATABASE_URL;

// use prepare: false for Supabase pooler Transaction mode
export const client = postgres(connectionString, {
  prepare: false,
  ssl: 'require'
});

// Merge schemas so drizzle has the full set of tables
export const db = drizzle(client, { schema: {
  ...profilesSchema,
  ...eventsSchema,
  ...legendsZATrackerSchema,
  ...socialSchema,
} });