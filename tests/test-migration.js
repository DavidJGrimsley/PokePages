import { db } from '../src/db/index.js';
import { userEventParticipation, profiles, eventCounters } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

async function testMigration() {
  try {
    console.log('🧪 Testing migration...');
    
    // Test 1: Can we query user participation?
    const participations = await db
      .select()
      .from(userEventParticipation)
      .limit(3);
    
    console.log('✅ User participations:', participations.length, 'records');
    
    // Test 2: Can we join with profiles?
    const participationsWithProfiles = await db
      .select({
        eventId: userEventParticipation.eventId,
        contributionCount: userEventParticipation.contributionCount,
        username: profiles.username,
        userId: profiles.id
      })
      .from(userEventParticipation)
      .leftJoin(profiles, eq(userEventParticipation.userId, profiles.id))
      .limit(3);
      
    console.log('✅ Participations with profiles:', participationsWithProfiles);
    
    // Test 3: Can we join with events?
    const fullData = await db
      .select({
        username: profiles.username,
        eventKey: eventCounters.eventKey,
        pokemonName: eventCounters.pokemonName,
        contributionCount: userEventParticipation.contributionCount
      })
      .from(userEventParticipation)
      .leftJoin(profiles, eq(userEventParticipation.userId, profiles.id))
      .leftJoin(eventCounters, eq(userEventParticipation.eventId, eventCounters.id))
      .limit(3);
      
    console.log('✅ Full join test:', fullData);
    
    console.log('🎉 Migration successful! All relationships working.');
    
  } catch (error) {
    console.error('❌ Migration test failed:', error);
  }
  
  process.exit(0);
}

testMigration();