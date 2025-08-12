// Diagnostic utilities for troubleshooting Supabase 406 errors
import { supabase } from './supabaseClient';

export const diagnosticChecks = {
  // Check if we can connect to Supabase and get basic info
  async testConnection() {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Test basic connection
      const { data, error } = await supabase.from('event_counters').select('count');
      
      if (error) {
        console.error('❌ Connection test failed:', error);
        return { success: false, error };
      }
      
      console.log('✅ Connection test passed');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Connection test error:', error);
      return { success: false, error };
    }
  },

  // Test the specific query that's causing issues
  async testUserParticipationQuery(eventId: string, userId: string) {
    try {
      console.log('🔍 Testing user participation query...');
      console.log('Event ID:', eventId);
      console.log('User ID:', userId);
      
      // Test with explicit column selection as suggested
      const { data, error, status, statusText } = await supabase
        .from('user_event_participation')
        .select('contribution_count, event_id, user_id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();  // Use maybeSingle() to handle empty tables

      console.log('Response status:', status);
      console.log('Response statusText:', statusText);
      
      if (error) {
        console.error('❌ User participation query failed:', error);
        console.error('Full error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { success: false, error, status, statusText };
      }
      
      console.log('✅ User participation query passed');
      console.log('Data:', data);
      return { success: true, data, status, statusText };
      
    } catch (error) {
      console.error('❌ User participation query error:', error);
      return { success: false, error };
    }
  },

  // Check table structure and permissions
  async checkTableInfo() {
    try {
      console.log('🔍 Checking table information...');
      
      // Try to get table schema info
      const { data: tableData, error: tableError } = await supabase
        .from('user_event_participation')
        .select('*')
        .limit(1);

      if (tableError) {
        console.error('❌ Table access failed:', tableError);
        return { success: false, error: tableError };
      }

      console.log('✅ Table accessible');
      console.log('Sample data structure:', tableData?.[0] || 'No data in table');
      
      return { success: true, data: tableData };
      
    } catch (error) {
      console.error('❌ Table check error:', error);
      return { success: false, error };
    }
  },

  // Check current user session
  async checkSession() {
    try {
      console.log('🔍 Checking user session...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session check failed:', error);
        return { success: false, error };
      }
      
      console.log('✅ Session check passed');
      console.log('User:', session?.user?.id || 'No user');
      console.log('Access token present:', !!session?.access_token);
      
      return { success: true, session };
      
    } catch (error) {
      console.error('❌ Session check error:', error);
      return { success: false, error };
    }
  },

  // Run all diagnostic checks
  async runAllChecks(eventId?: string, userId?: string) {
    console.log('🚀 Running comprehensive Supabase diagnostics...');
    
    const results = {
      connection: await this.testConnection(),
      session: await this.checkSession(),
      tableInfo: await this.checkTableInfo(),
      userParticipation: eventId && userId ? await this.testUserParticipationQuery(eventId, userId) : null
    };
    
    console.log('📊 Diagnostic Results Summary:');
    console.log('Connection:', results.connection.success ? '✅' : '❌');
    console.log('Session:', results.session.success ? '✅' : '❌');
    console.log('Table Info:', results.tableInfo.success ? '✅' : '❌');
    console.log('User Participation:', results.userParticipation?.success ? '✅' : results.userParticipation ? '❌' : '⏭️ Skipped');
    
    return results;
  }
};

// Helper function to format event/user IDs for testing
export const formatTestIds = (eventData: any, user: any) => {
  console.log('🔍 Test ID Information:');
  console.log('Event Data:', eventData);
  console.log('Event ID type:', typeof eventData?.id);
  console.log('Event ID value:', eventData?.id);
  console.log('User Data:', user);
  console.log('User ID type:', typeof user?.id);
  console.log('User ID value:', user?.id);
  
  return {
    eventId: eventData?.id,
    userId: user?.id,
    eventIdValid: !!eventData?.id,
    userIdValid: !!user?.id
  };
};
