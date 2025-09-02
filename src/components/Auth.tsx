import { StyleSheet, View, AppState, TextInput } from 'react-native'
import React, { useState } from 'react'
import { supabase } from "~/utils/supabaseClient"


import { Button } from '~/components/Button'
import { theme } from '../../constants/style/theme'
import ErrorMessage from './Error';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signInWithEmail() {
    setLoading(true)
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) setErrorMessage(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true)
    setErrorMessage(null);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    if (error) setErrorMessage(error.message);
    if (!session && !error) setErrorMessage('Please check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {errorMessage && (
        <ErrorMessage
          title="Authentication Error"
          description="There was a problem signing in or signing up."
          error={errorMessage}
        />
      )}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          style={styles.input}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          style={styles.input}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xxl,
    padding: theme.spacing.md,
  },
  verticallySpaced: {
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: theme.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.light.white,
    color: theme.colors.light.text,
    ...theme.typography.copy,
  },
})