import { View, AppState, TextInput, Text } from 'react-native'
import React, { useState } from 'react'
import { supabase } from "~/utils/supabaseClient"
import { router } from 'expo-router'

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

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signInWithEmail() {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password')
      return
    }

    setLoading(true)
    setErrorMessage(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    })
    
    if (error) {
      setErrorMessage(error.message)
    }
    
    setLoading(false);
  }

  const navigateToSignUp = () => {
    router.replace('/sign-up')
  }

  return (
    <View className="mt-16 p-4">
      <Text className="text-2xl font-bold text-center mb-8 text-gray-800">
        Welcome Back
      </Text>

      {errorMessage && (
        <View className="mb-6">
          <ErrorMessage
            title="Sign In Error"
            description="There was a problem signing in to your account."
            error={errorMessage}
          />
        </View>
      )}

      <View className="py-2 self-stretch">
        <Text className="mb-2 text-gray-800 font-bold">Email</Text>
        <TextInput
          onChangeText={setEmail}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          className="border border-gray-300 bg-white text-gray-800 rounded-md px-4 py-4"
          accessibilityLabel="Email"
        />
      </View>

      <View className="py-2 self-stretch">
        <Text className="mb-2 text-gray-800 font-bold">Password</Text>
        <TextInput
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          className="border border-gray-300 bg-white text-gray-800 rounded-md px-4 py-4"
          accessibilityLabel="Password"
        />
      </View>

      <View className="py-2 self-stretch mt-8">
        <Button 
          title={loading ? 'Signing in...' : 'Sign In'} 
          disabled={loading} 
          onPress={signInWithEmail} 
        />
      </View>

      {/* Don't have account section */}
      <View className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Text className="text-center text-gray-600 mb-3">
          Don&apos;t have an account?
        </Text>
        <Button
          title="Click here to sign up"
          onPress={navigateToSignUp}
          disabled={loading}
        />
      </View>
    </View>
  )
}