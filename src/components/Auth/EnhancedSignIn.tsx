import React, { useState } from 'react'
import { View, Text, TextInput, AppState } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { supabase } from "~/utils/supabaseClient"
import { router } from 'expo-router'

import { Button } from 'components/UI/Button'
import LoadingLottieModal from '@/src/components/Animation/LoadingLottieModal'

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

interface SignInFormData {
  email: string
  password: string
}

export default function EnhancedSignIn() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true)
    setErrorMessage(null)
    
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email.trim(),
      password: data.password,
    })
    
    if (error) {
      setErrorMessage(
        error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')
          ? 'Invalid email or password. Please check your credentials and try again.'
          : error.message
      )
    }
    
    setLoading(false)
  }

  const navigateToSignUp = () => {
    router.replace('/sign-up')
  }

  return (
    <>
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: 64 }}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
      <Text className="text-2xl font-bold text-center mb-8 text-gray-800">
        Welcome Back
      </Text>

      {errorMessage && (
        <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Text className="text-red-700 text-sm text-center">
            {errorMessage}
          </Text>
        </View>
      )}

      {/* Email Field */}
      <View className="mb-4">
        <Text className="mb-2 text-gray-800 font-bold">Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Please enter a valid email address',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="email@address.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
              className={`border ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } bg-white text-gray-800 rounded-md px-4 py-4`}
              accessibilityLabel="Email"
            />
          )}
        />
        {errors.email && (
          <Text className="text-red-600 text-sm mt-1">{errors.email.message}</Text>
        )}
      </View>

      {/* Password Field */}
      <View className="mb-6">
        <Text className="mb-2 text-gray-800 font-bold">Password</Text>
        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Password"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              className={`border ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              } bg-white text-gray-800 rounded-md px-4 py-4`}
              accessibilityLabel="Password"
            />
          )}
        />
        {errors.password && (
          <Text className="text-red-600 text-sm mt-1">{errors.password.message}</Text>
        )}
      </View>

      {/* Submit Button */}
      <View className="mb-8">
        <Button 
          title={loading ? 'Signing in...' : 'Sign In'} 
          disabled={loading} 
          onPress={handleSubmit(onSubmit)} 
        />
      </View>

      {/* Don't have account section */}
      <View className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Text className="text-center text-gray-600 mb-3">
          Don&apos;t have an account?
        </Text>
        <Button
          title="Click here to sign up"
          onPress={navigateToSignUp}
          disabled={loading}
        />
      </View>
    </KeyboardAwareScrollView>
    
    {/* Loading Modal */}
    <LoadingLottieModal visible={loading} message="Signing in..." />
  </>
  )
}