import { useState } from 'react'
import { View, Text, TextInput, Alert, Platform } from 'react-native'
import { supabase } from "~/utils/supabaseClient"
import { router } from 'expo-router'
import { useAuthStore } from "~/store/authStore"

import { Button } from 'components/UI/Button'
import ErrorMessage from 'components/Meta/Error'

// Cross-platform alert function
const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title)
  } else {
    Alert.alert(title, message)
  }
}

export default function SignUp() {
  const { setProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const validateInputs = () => {
    if (!email.trim()) {
      setErrorMessage('Email is required')
      return false
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters')
      return false
    }
    if (!username.trim() || username.length < 3) {
      setErrorMessage('Username must be at least 3 characters')
      return false
    }
    if (!birthdate.trim()) {
      setErrorMessage('Birthdate is required')
      return false
    }
    // Basic date format validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(birthdate)) {
      setErrorMessage('Birthdate must be in YYYY-MM-DD format')
      return false
    }
    return true
  }

  async function signUpWithProfile() {
    if (!validateInputs()) return

    setLoading(true)
    setErrorMessage(null)

    try {
      // Step 1: Create auth user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      })

      if (authError) {
        setErrorMessage(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setErrorMessage('Failed to create user account')
        setLoading(false)
        return
      }

      // Step 2: Create profile via our API
      const profileResponse = await fetch('http://localhost:3001/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: authData.user.id,
          username: username.trim(),
          birthdate: birthdate,
        }),
      })

      const profileResult = await profileResponse.json()

      if (!profileResponse.ok || !profileResult.success) {
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.signOut()
        setErrorMessage(profileResult.error || 'Failed to create profile')
        setLoading(false)
        return
      }

      // Update local store
      setProfile({
        username: username.trim(),
        birthdate: birthdate,
        bio: null,
        avatar_url: null,
      })

      showAlert('Success', 'Account created successfully! Please check your email for verification.')
      
      // Redirect to sign in or onboarding
      router.replace('/(onboarding)')
      
    } catch (error) {
      console.error('Sign up error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const navigateToSignIn = () => {
    router.replace('/sign-in')
  }

  return (
    <View className="mt-16 p-4">
      {errorMessage && (
        <View className="mb-6">
          <ErrorMessage
            title="Sign Up Error"
            description="There was a problem creating your account."
            error={errorMessage}
          />
        </View>
      )}

      <Text className="text-2xl font-bold text-center mb-8 text-gray-800">
        Create Your Account
      </Text>

      <View className="py-2 self-stretch">
        <Text className="mb-2 text-gray-800 font-bold">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
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
          value={password}
          onChangeText={setPassword}
          placeholder="Password (min 6 characters)"
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          className="border border-gray-300 bg-white text-gray-800 rounded-md px-4 py-4"
          accessibilityLabel="Password"
        />
      </View>

      <View className="py-2 self-stretch">
        <Text className="mb-2 text-gray-800 font-bold">Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Your username (min 3 characters)"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
          className="border border-gray-300 bg-white text-gray-800 rounded-md px-4 py-4"
          accessibilityLabel="Username"
        />
      </View>

      <View className="py-2 self-stretch">
        <Text className="mb-2 text-gray-800 font-bold">Birthdate</Text>
        <TextInput
          value={birthdate}
          onChangeText={setBirthdate}
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
          autoCorrect={false}
          className="border border-gray-300 bg-white text-gray-800 rounded-md px-4 py-4"
          accessibilityLabel="Birthdate"
        />
      </View>

      <View className="py-2 self-stretch mt-8">
        <Button
          title={loading ? 'Creating Account...' : 'Create Account'}
          onPress={signUpWithProfile}
          disabled={loading}
        />
      </View>

      {/* Already have account section */}
      <View className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Text className="text-center text-gray-600 mb-3">
          Already have an account?
        </Text>
        <Button
          title="Click here to sign in"
          onPress={navigateToSignIn}
          disabled={loading}
        />
      </View>
    </View>
  )
}


