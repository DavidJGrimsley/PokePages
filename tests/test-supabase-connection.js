import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Simple query with timeout
    console.log('📊 Testing event_counters table...');
    const { data, error } = await supabase
      .from('event_counters')
      .select('event_key, total_count')
      .limit(1);
      
    if (error) {
      console.error('❌ Query failed:', error);
      return;
    }
    
    console.log('✅ Query successful:', data);
    
    // Test 2: Test the specific event
    console.log('🎯 Testing chi-yu event...');
    const { data: eventData, error: eventError } = await supabase
      .from('event_counters')
      .select('*')
      .eq('event_key', 'chi-yu')
      .single();
      
    if (eventError) {
      console.error('❌ Chi-yu event error:', eventError);
      return;
    }
    
    console.log('✅ Chi-yu event found:', eventData);
    
  } catch (error) {
    console.error('💥 Connection test failed:', error);
  }
}

testSupabaseConnection();