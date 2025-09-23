// Manual API test utility for Supabase 406 troubleshooting
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import { supabase } from 'utils/supabaseClient';
import { theme } from 'constants/style/theme';
import ErrorMessage from 'components/Meta/Error';

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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Supabase API Diagnostics</Text>
      {errorMessage && (
        <View style={{ marginVertical: theme.spacing.lg }}>
          <ErrorMessage
            title="API Test Error"
            description="An error occurred during one of the Supabase API tests."
            error={errorMessage}
          />
        </View>
      )}
      
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
    padding: theme.spacing.md,
    backgroundColor: theme.colors.light.background,
  },
  title: {
    ...theme.typography.header,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.light.text,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.copyBold,
    marginBottom: theme.spacing.xs,
    color: theme.colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.copy,
    backgroundColor: theme.colors.light.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  button: {
    flex: 1,
    backgroundColor: theme.colors.light.accent,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: theme.colors.light.red,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.light.brown,
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.light.white,
    ...theme.typography.copyBold,
  },
  resultsContainer: {
    backgroundColor: theme.colors.light.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
  },
  resultsTitle: {
    ...theme.typography.subheader,
    marginBottom: theme.spacing.md,
    color: theme.colors.light.text,
  },
  results: {
    ...theme.typography.mono,
    color: theme.colors.light.text,
  },
});
