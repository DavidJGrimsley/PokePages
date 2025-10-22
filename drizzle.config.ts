import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: [
    './src/db/eventsSchema.ts',
    './src/db/profilesSchema.ts',
    './src/db/legendsZATrackerSchema.ts'
  ],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
