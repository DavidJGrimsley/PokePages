import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: [
    './src/db/eventsSchema.ts',
    './src/db/profilesSchema.ts',
    './src/db/legendsZATrackerSchema.ts',
    './src/db/socialSchema.ts',
    './src/db/favoritesSchema.ts',
  ],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: { 
      rejectUnauthorized: false,
      ca: false as any,
      checkServerIdentity: () => undefined as any
    }, // Maximum SSL permissiveness for Supabase
  },
  verbose: true,
  strict: true,
});
