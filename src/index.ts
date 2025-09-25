import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { profiles, eventCounters, userEventParticipation } from './db/schema';

// Create the database connection
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: { rejectUnauthorized: false }, // Disable SSL certificate verification for pooler
});
const db = drizzle(sql);

async function main() {
  console.log('🚀 Testing Drizzle ORM with your Supabase database...');

  try {
    // Test reading existing data
    console.log('\n📊 Fetching existing profiles...');
    const existingProfiles = await db.select().from(profiles).limit(5);
    console.log('Profiles found:', existingProfiles.length);
    
    console.log('\n📊 Fetching event counters...');
    const events = await db.select().from(eventCounters).limit(5);
    console.log('Event counters found:', events.length);
    
    console.log('\n📊 Fetching user participation...');
    const participation = await db.select().from(userEventParticipation).limit(5);
    console.log('User participations found:', participation.length);
    
    console.log('\n✅ Drizzle ORM is working correctly with your Supabase database!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

main();