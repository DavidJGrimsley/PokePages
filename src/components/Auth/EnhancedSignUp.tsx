import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import DateTimePicker from '@react-native-community/datetimepicker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { supabase } from 'utils/supabaseClient'
import { buildApiUrl } from '~/utils/apiConfig'
import { router } from 'expo-router'
import { useAuthStore } from "~/store/authStore"

import { Button } from 'components/UI/Button'
import SuccessMessage from 'components/UI/SuccessMessage'
import LoadingLottieModal from '@/src/components/Animation/LoadingLottieModal'

interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  username: string
  birthdate: Date
}

export default function EnhancedSignUp() {
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchWithTimeout = (url: string, options: RequestInit = {}, timeoutMs = 15000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_r, rej) => setTimeout(() => rej(new Error('Request timed out')), timeoutMs)),
    ]) as Promise<Response>
  }

  const toFriendlyNetworkMessage = (message: string, url?: string) => {
    const m = message.toLowerCase()
    const isNetwork =
      m.includes('load failed') ||
      m.includes('failed to fetch') ||
      m.includes('network request failed') ||
      m.includes('networkerror') ||
      m.includes('request timed out')

    if (!isNetwork) return message

    const base = "Couldn't reach the server."
    const hint =
      " If you're running a dev build on a phone or another computer, your API base URL can't be localhost — set EXPO_PUBLIC_API_BASE_URL (e.g. http://192.168.1.10:3001)."
    const debug = __DEV__ && url ? `\n\nTried: ${url}` : ''
    return `${base}${hint}${debug}`
  }

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      birthdate: new Date(2000, 0, 1), // Default to Jan 1, 2000
    },
  })

  const password = watch('password')
  const birthdate = watch('birthdate')

  const onDateChange = (event: any, selectedDate?: Date) => {
    // On Android, hide picker after selection. On iOS, keep it visible until user taps away
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    
    if (selectedDate) {
      setValue('birthdate', selectedDate)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true)
    setErrorMessage(null)

    try {
      // Step 1: Create auth user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
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
      const profileUrl = buildApiUrl('profiles')
      const profileResponse = await fetchWithTimeout(profileUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: authData.user.id,
          username: data.username.trim(),
          birthdate: data.birthdate.toISOString().split('T')[0], // YYYY-MM-DD format
        }),
      }, 15000)

      let profileResult: any = null
      try {
        profileResult = await profileResponse.json()
      } catch {
        const text = await profileResponse.text().catch(() => '')
        profileResult = { success: false, error: text || 'Invalid server response' }
      }

      if (!profileResponse.ok || !profileResult.success) {
        // If profile creation fails, clean up the auth user
        await supabase.auth.signOut()
        setErrorMessage(profileResult.error || 'Failed to create profile')
        setLoading(false)
        return
      }

      // Profile created successfully - auth state listener will load profile automatically
      
      // Show success message
      setShowSuccess(true)
      
      // Redirect after delay
      setTimeout(() => {
        router.replace('/(onboarding)')
      }, 3000)
      
    } catch (error) {
      console.error('Sign up error:', error)
      const msg = error instanceof Error ? error.message : 'An unexpected error occurred'
      setErrorMessage(toFriendlyNetworkMessage(msg, buildApiUrl('profiles')))
    } finally {
      setLoading(false)
    }
  }

  const navigateToSignIn = () => {
    router.replace('/sign-in')
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
      {showSuccess ? (
        <View className="mb-6">
          <SuccessMessage
            title="Account Created!"
            message="Your account has been created successfully! Please check your email for verification. You'll be redirected to onboarding shortly."
          />
        </View>
      ) : errorMessage ? (
        <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Text className="text-red-700 text-sm text-center">
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {!showSuccess && (
        <>
          <Text className="text-2xl font-bold text-center mb-8 text-gray-800">
            Create Your Account
          </Text>

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

          {/* Username Field */}
          <View className="mb-4">
            <Text className="mb-2 text-gray-800 font-bold">Username</Text>
            <Controller
              control={control}
              name="username"
              rules={{
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Your username (min 3 characters)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="username"
                  autoComplete="username"
                  returnKeyType="next"
                  className={`border ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  } bg-white text-gray-800 rounded-md px-4 py-4`}
                  accessibilityLabel="Username"
                />
              )}
            />
            {errors.username && (
              <Text className="text-red-600 text-sm mt-1">{errors.username.message}</Text>
            )}
          </View>

          {/* Password Field */}
          <View className="mb-4">
            <Text className="mb-2 text-gray-800 font-bold">Password</Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Password (min 6 characters)"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  returnKeyType="next"
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

          {/* Confirm Password Field */}
          <View className="mb-4">
            <Text className="mb-2 text-gray-800 font-bold">Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Confirm your password"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  returnKeyType="next"
                  className={`border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } bg-white text-gray-800 rounded-md px-4 py-4`}
                  accessibilityLabel="Confirm Password"
                />
              )}
            />
            {errors.confirmPassword && (
              <Text className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</Text>
            )}
          </View>

          {/* Birthdate Field */}
          <View className="mb-6">
            <Text className="mb-2 text-gray-800 font-bold">Birthdate</Text>
            
            {/* Warning Message */}
            <View className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Text className="text-yellow-800 text-xs font-semibold">
                ⚠️ Important: Your birthdate cannot be changed after account creation. 
                Please ensure it&apos;s accurate. Contact support if you need to update it later.
              </Text>
            </View>
            
            {Platform.OS === 'web' ? (
              <Controller
                control={control}
                name="birthdate"
                rules={{
                  required: 'Birthdate is required',
                }}
                render={({ field: { onChange, value } }) => {
                  const formattedValue = value.toISOString().split('T')[0]; // YYYY-MM-DD format
                  
                  return (
                    <input
                      type="date"
                      value={formattedValue}
                      onChange={(e) => {
                        const dateString = e.target.value;
                        if (dateString) {
                          const newDate = new Date(dateString + 'T00:00:00.000Z'); // Ensure UTC to avoid timezone issues
                          onChange(newDate);
                        }
                      }}
                      max={new Date().toISOString().split('T')[0]}
                      min={new Date(1900, 0, 1).toISOString().split('T')[0]}
                      className={`border ${
                        errors.birthdate ? 'border-red-300' : 'border-gray-300'
                      } bg-white text-gray-800 rounded-md px-4 py-4 w-full`}
                      style={{
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        height: '64px',
                        boxSizing: 'border-box',
                      }}
                    />
                  );
                }}
              />
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className={`border ${
                    errors.birthdate ? 'border-red-300' : 'border-gray-300'
                  } bg-white rounded-md px-4 py-4`}
                  style={{ minHeight: 64, justifyContent: 'center' }}
                >
                  <Text className="text-gray-800 text-base">
                    {formatDate(birthdate)}
                  </Text>
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={birthdate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                )}
              </>
            )}
            
            {errors.birthdate && (
              <Text className="text-red-600 text-sm mt-1">{errors.birthdate.message}</Text>
            )}
          </View>

          {/* Submit Button */}
          <View className="mb-8">
            <Button
              title={loading ? 'Creating Account...' : 'Create Account'}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            />
          </View>

          {/* Already have account section */}
          <View className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Text className="text-center text-gray-600 mb-3">
              Already have an account?
            </Text>
            <Button
              title="Click here to sign in"
              onPress={navigateToSignIn}
              disabled={loading}
            />
          </View>
        </>
      )}
    </KeyboardAwareScrollView>
    
    {/* Loading Modal */}
    <LoadingLottieModal visible={loading} message="Creating your account..." />
  </>
  )
}