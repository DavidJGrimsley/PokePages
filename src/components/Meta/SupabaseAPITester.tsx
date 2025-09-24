// Manual API test utility for Supabase 406 troubleshooting
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { supabase } from 'utils/supabaseClient';
// Inline an error card to avoid casing conflicts with shared Error component
import { ThemedText } from 'components/TextTheme/ThemedText';

export const SupabaseAPITester: React.FC = () => {
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState('');
  const [userId, setUserId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runManualAPITest = async () => {
    setLoading(true);
    setResults('Running manual API tests...\n\n');
    
  try {
      // Test 1: Basic connection
      const { data: basicTest, error: basicError } = await supabase
        .from('event_counters')
        .select('count');
        
  setResults(prev => prev + `Test 1 - Basic Connection:\n${basicError ? `❌ Error: ${JSON.stringify(basicError, null, 2)}` : `✅ Success: ${JSON.stringify(basicTest, null, 2)}`}\n\n`);
  if (basicError) setErrorMessage(basicError.message || 'Unknown error in basic connection test');
      
      // Test 2: User participation query (with explicit headers)
      if (eventId && userId) {
        const { data: userTest, error: userError, status, statusText } = await supabase
          .from('user_event_participation')
          .select('contribution_count, event_id, user_id')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .maybeSingle();  // Use maybeSingle() to handle empty results gracefully
          
  setResults(prev => prev + `Test 2 - User Participation Query:\nStatus: ${status} ${statusText}\n${userError ? `❌ Error: ${JSON.stringify(userError, null, 2)}` : `✅ Success: ${JSON.stringify(userTest, null, 2)}`}\n\n`);
  if (userError) setErrorMessage(userError.message || 'Unknown error in user participation test');
      }
      
      // Test 3: Check auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  setResults(prev => prev + `Test 3 - Auth Session:\n${sessionError ? `❌ Error: ${JSON.stringify(sessionError, null, 2)}` : `✅ Session exists: ${!!session}\nUser ID: ${session?.user?.id}\nAccess token: ${session?.access_token ? 'Present' : 'Missing'}`}\n\n`);
  if (sessionError) setErrorMessage(sessionError.message || 'Unknown error in session test');
      
      // Test 4: Manual fetch (simulating cURL)
      try {
        const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/user_event_participation?select=contribution_count&event_id=eq.${eventId}&user_id=eq.${userId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        const responseText = await response.text();
        setResults(prev => prev + `Test 4 - Manual Fetch:\nStatus: ${response.status} ${response.statusText}\nResponse: ${responseText}\n\n`);
      } catch (fetchError) {
  setResults(prev => prev + `Test 4 - Manual Fetch:\n❌ Error: ${fetchError}\n\n`);
  setErrorMessage(String(fetchError));
      }
      
    } catch (error) {
      setResults(prev => prev + `Overall Error: ${error}\n`);
      setErrorMessage(String(error));
    }
    
    setLoading(false);
  };

  const clearResults = () => {
  setResults('');
  setErrorMessage(null);
  };

  return (
    <ScrollView className="flex-1 p-4 bg-app-background">
      <ThemedText type="header" className="text-center mb-6">Supabase API Diagnostics</ThemedText>
      {errorMessage && (
        <View className="my-6 bg-white border border-red-400 rounded-md p-4">
          <View className="self-center p-2 bg-red-500 rounded-md mb-2">
            <ThemedText type="subheader" className="text-white">API Test Error</ThemedText>
          </View>
          <ThemedText type="copy" className="text-center mb-2">
            An error occurred during one of the Supabase API tests.
          </ThemedText>
          <ThemedText type="mono" className="text-red-600 text-xs">
            {errorMessage}
          </ThemedText>
        </View>
      )}
      
      <View className="mb-4">
        <ThemedText type="copyBold" className="mb-1">Event ID (UUID):</ThemedText>
        <TextInput
          className="border border-app-secondary rounded-md p-3 bg-white typography-copy"
          value={eventId}
          onChangeText={setEventId}
          placeholder="Enter event ID for testing"
        />
      </View>
      
      <View className="mb-4">
        <ThemedText type="copyBold" className="mb-1">User ID (UUID):</ThemedText>
        <TextInput
          className="border border-app-secondary rounded-md p-3 bg-white typography-copy"
          value={userId}
          onChangeText={setUserId}
          placeholder="Enter user ID for testing"
        />
      </View>
      
      <View className="flex-row gap-4 mb-6">
        <Pressable
          className={`flex-1 rounded-md items-center p-3 ${loading ? 'bg-amber-700/60' : 'bg-app-accent'}`}
          onPress={runManualAPITest}
          disabled={loading}
        >
          <Text className="text-white typography-copy-bold">
            {loading ? 'Running Tests...' : 'Run API Tests'}
          </Text>
        </Pressable>
        
        <Pressable
          className="flex-1 rounded-md items-center p-3 bg-red-600"
          onPress={clearResults}
        >
          <Text className="text-white typography-copy-bold">Clear Results</Text>
        </Pressable>
      </View>
      
      <View className="bg-white rounded-md p-4 border border-app-secondary">
        <ThemedText type="subheader" className="mb-4">Test Results:</ThemedText>
        <Text className="font-mono text-app-text">{results}</Text>
      </View>
    </ScrollView>
  );
};

