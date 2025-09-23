import { View, AppState, TextInput } from 'react-native'
import React, { useState } from 'react'
import { supabase } from "~/utils/supabaseClient"

import { Button } from 'components/UI/Button'
import ErrorMessage from 'components/Meta/Error';

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
    <View className="mt-20 p-4">
      {errorMessage && (
        <ErrorMessage
          title="Authentication Error"
          description="There was a problem signing in or signing up."
          error={errorMessage}
        />
      )}
      <View className="py-1 self-stretch mt-6">
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          className="border border-purple-300 rounded-md px-4 py-3 bg-white text-black text-base"
        />
      </View>
      <View className="py-1 self-stretch">
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          className="border border-purple-300 rounded-md px-4 py-3 bg-white text-black text-base"
        />
      </View>
      <View className="py-1 self-stretch mt-6">
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      <View className="py-1 self-stretch">
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
      </View>
    </View>
  )
}