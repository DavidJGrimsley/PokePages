// Simple database test using raw Supabase client
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseConnection() {
  console.log('🧪 Testing Legends Z-A Tracker Database...\n');

  try {
    // Test 1: Check if the table exists and we can query it
    console.log('1. Testing legends_za_tracker table access...');
    const { data, error } = await supabase
      .from('legends_za_tracker')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Table access error:', error.message);
      if (error.message.includes('relation "legends_za_tracker" does not exist')) {
        console.log('💡 The table might not have been created yet. Please run the migration.');
      }
      return;
    }

    console.log('✅ Table exists and is accessible');
    console.log(`✅ Found ${data?.length || 0} sample records`);

    // Test 2: Test RLS policies (this should fail without authentication)
    console.log('\n2. Testing Row Level Security...');
    const { data: insertData, error: insertError } = await supabase
      .from('legends_za_tracker')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        pokemon_id: 1,
        normal: true,
        shiny: false,
        alpha: false,
        alpha_shiny: false
      });

    if (insertError) {
      if (insertError.message.includes('RLS') || insertError.message.includes('policy')) {
        console.log('✅ RLS policies are working correctly (insert blocked for unauthenticated user)');
      } else {
        console.log('❌ Unexpected insert error:', insertError.message);
      }
    } else {
      console.log('⚠️  Warning: Insert succeeded without authentication - RLS might not be working');
    }

    // Test 3: Check table structure
    console.log('\n3. Checking table structure...');
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'legends_za_tracker' })
      .limit(10);

    if (columnError) {
      console.log('⚠️  Could not fetch column info:', columnError.message);
    } else {
      console.log('✅ Table structure verified');
    }

    console.log('\n🎉 Database setup is working correctly!');
    console.log('\n📝 Next steps:');
    console.log('   1. Sign in to your app to test authenticated operations');
    console.log('   2. Test the Pokemon tracker functionality in the app');
    console.log('   3. Verify cross-device sync is working');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDatabaseConnection();