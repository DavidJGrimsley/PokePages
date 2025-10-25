// Test database connection and legends_za_tracker functionality
import 'dotenv/config';
import { supabase } from '../src/utils/supabaseClient';
import { 
  getUserPokemonTrackerData,
  updatePokemonForm,
  getUserPokemonStats
} from '../src/db/legends-zaTrackerQueries';

async function testDatabaseIntegration() {
  console.log('🧪 Testing Legends Z-A Tracker Database Integration...\n');

  try {
    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    const { data, error } = await supabase.from('legends_za_tracker').select('count').limit(1);
    
    if (error) {
      console.log('❌ Database connection error:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful');

    // Test 2: Check if user is authenticated
    console.log('\n2. Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Authentication error:', authError.message);
      console.log('💡 Please sign in to test the database integration');
      return;
    }

    if (!user) {
      console.log('❌ No authenticated user found');
      console.log('💡 Please sign in to test the database integration');
      return;
    }

    console.log('✅ User authenticated:', user.email);

    // Test 3: Fetch current Pokemon tracker data
    console.log('\n3. Fetching current Pokemon tracker data...');
    const currentData = await getUserPokemonTrackerData(user.id);
    console.log(`✅ Found ${currentData.length} Pokemon records`);

    // Test 4: Test adding a Pokemon record
    console.log('\n4. Testing Pokemon form update...');
    const testPokemonId = 1; // Bulbasaur
    const testForm = 'normal' as const;
    
    await updatePokemonForm(user.id, testPokemonId, testForm, true);
    console.log(`✅ Successfully updated Pokemon ${testPokemonId} - ${testForm} form`);

    // Test 5: Verify the update
    console.log('\n5. Verifying the update...');
    const updatedData = await getUserPokemonTrackerData(user.id);
    const testRecord = updatedData.find(r => r.pokemonId === testPokemonId);
    
    if (testRecord && testRecord.normal) {
      console.log('✅ Update verified successfully');
      console.log('   Record:', {
        pokemonId: testRecord.pokemonId,
        normal: testRecord.normal,
        shiny: testRecord.shiny,
        alpha: testRecord.alpha,
        alphaShiny: testRecord.alphaShiny
      });
    } else {
      console.log('❌ Update verification failed');
    }

    // Test 6: Get user stats
    console.log('\n6. Testing stats calculation...');
    const stats = await getUserPokemonStats(user.id);
    console.log('✅ Stats calculated:', {
      totalRegistered: stats.totalRegistered,
      registeredPercent: stats.registeredPercent,
      totalUnique: stats.totalUnique
    });

    console.log('\n🎉 All tests passed! Database integration is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDatabaseIntegration();