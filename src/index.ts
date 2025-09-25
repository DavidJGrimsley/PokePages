import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Create the postgres client
const sql = postgres(process.env.DATABASE_URL!);

// Create and export the Drizzle database instance
export const db = drizzle(sql);

// Optional: Export the raw sql client for advanced usage
export { sql };