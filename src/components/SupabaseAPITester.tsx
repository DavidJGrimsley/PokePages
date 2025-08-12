// Manual API test utility for Supabase 406 troubleshooting
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import { supabase } from '../utils/supabaseClient';

export const SupabaseAPITester: React.FC = () => {
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState('');
  const [userId, setUserId] = useState('');

  const runManualAPITest = async () => {
    setLoading(true);
    setResults('Running manual API tests...\n\n');
    
    try {
      // Test 1: Basic connection
      const { data: basicTest, error: basicError } = await supabase
        .from('event_counters')
        .select('count');
        
      setResults(prev => prev + `Test 1 - Basic Connection:\n${basicError ? `❌ Error: ${JSON.stringify(basicError, null, 2)}` : `✅ Success: ${JSON.stringify(basicTest, null, 2)}`}\n\n`);
      
      // Test 2: User participation query (with explicit headers)
      if (eventId && userId) {
        const { data: userTest, error: userError, status, statusText } = await supabase
          .from('user_event_participation')
          .select('contribution_count, event_id, user_id')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .maybeSingle();  // Use maybeSingle() to handle empty results gracefully
          
        setResults(prev => prev + `Test 2 - User Participation Query:\nStatus: ${status} ${statusText}\n${userError ? `❌ Error: ${JSON.stringify(userError, null, 2)}` : `✅ Success: ${JSON.stringify(userTest, null, 2)}`}\n\n`);
      }
      
      // Test 3: Check auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      setResults(prev => prev + `Test 3 - Auth Session:\n${sessionError ? `❌ Error: ${JSON.stringify(sessionError, null, 2)}` : `✅ Session exists: ${!!session}\nUser ID: ${session?.user?.id}\nAccess token: ${session?.access_token ? 'Present' : 'Missing'}`}\n\n`);
      
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
      }
      
    } catch (error) {
      setResults(prev => prev + `Overall Error: ${error}\n`);
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setResults('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Supabase API Diagnostics</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Event ID (UUID):</Text>
        <TextInput
          style={styles.input}
          value={eventId}
          onChangeText={setEventId}
          placeholder="Enter event ID for testing"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>User ID (UUID):</Text>
        <TextInput
          style={styles.input}
          value={userId}
          onChangeText={setUserId}
          placeholder="Enter user ID for testing"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={runManualAPITest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Running Tests...' : 'Run API Tests'}
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.button, styles.clearButton]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </Pressable>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        <Text style={styles.results}>{results}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  results: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
    color: '#333',
  },
});
