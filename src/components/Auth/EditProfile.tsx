import { useState, useEffect } from 'react'
import { supabase } from "utils/supabaseClient"
import { useAuthStore } from "~/store/authStore"
import { View, Alert, Platform, Text, TextInput } from 'react-native'
import { Session } from '@supabase/supabase-js'

import { Button } from 'components/UI/Button'
import ErrorMessage from 'components/Meta/Error'
import { buildApiUrl } from '~/utils/apiConfig'

// Cross-platform alert function
const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title)
  } else {
    Alert.alert(title, message)
  }
}

export default function EditProfile({ session }: { session: Session }) {
  const { signOut, setProfile, profile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [bio, setBio] = useState('')
  const [avatar_url, setAvatar_url] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Sync form fields with profile data from store
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setBirthdate(profile.birthdate || '')
      setBio(profile.bio || '')
      setAvatar_url(profile.avatar_url || '')
    } else {
      setUsername('')
      setBirthdate('')
      setBio('')
      setAvatar_url('')
    }
  }, [profile])

  const updateProfile = async ({ 
    username, 
    birthdate, 
    bio, 
    avatar_url,
  }: {
    username: string
    birthdate: string
    bio: string
    avatar_url: string
  }) => {
    console.log('🔄 updateProfile called with:', { username, birthdate, bio, avatar_url })
    setLoading(true)
    setError(null)
    try {
      if (!session?.user) throw new Error('No user on the session!')
      console.log('✅ Session user found:', session.user.id)
    
      

      // Prepare the update data (only include non-empty fields)
      const updates: any = {}
      if (username?.trim()) updates.username = username.trim()
      if (birthdate?.trim()) updates.birthdate = birthdate.trim()
      if (bio?.trim()) updates.bio = bio.trim()
      if (avatar_url?.trim()) updates.avatarUrl = avatar_url.trim()
      console.log('📝 Update payload:', updates)

      // Update profile via Express API
      const apiUrl = buildApiUrl(`profiles/${session.user.id}`)
      console.log('🌐 Making API call to:', apiUrl)
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
      })

      console.log('📡 API Response status:', response.status, response.statusText)
      const result = await response.json()
      console.log('📦 API Response data:', result)

      if (!response.ok || !result.success) {
        console.error('❌ API Error:', result.error || 'Failed to update profile')
        throw new Error(result.error || 'Failed to update profile')
      }

      // Update local store with the returned profile data
      setProfile({
        username: result.data.username || null,
        birthdate: result.data.birthdate || null,
        bio: result.data.bio || null,
        avatar_url: result.data.avatarUrl || null,
      })
      console.log('✅ Profile updated successfully in store')

      showAlert('Success', 'Profile updated successfully!')
    } catch (error) {
      console.error('💥 UpdateProfile error:', error)
      if (error instanceof Error) {
        setError(error.message)
        showAlert('Update Failed', error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    console.log('🚪 Sign Out button pressed!')
    try {
      console.log('🔄 Calling signOut function...')
      await signOut()
      console.log('✅ Sign out successful!')
    } catch (error) {
      console.error('💥 Sign out error:', error)
      if (error instanceof Error) {
        showAlert('Sign Out Error', error.message)
      }
    }
  }

  return (
    <View className="mt-16 p-4">
      {error && (
        <View className="my-8">
          <ErrorMessage
            title="Profile Error"
            description="There was a problem loading or updating your profile."
            error={error}
          />
        </View>
      )}
      <View className="py-2 self-stretch mt-8">
        <Text className="mb-2 text-gray-800 font-bold">Email</Text>
        <TextInput
          value={session?.user?.email ?? ''}
          editable={false}
          selectTextOnFocus={false}
          className="border border-gray-300 bg-white text-gray-500 rounded-md px-4 py-4"
          accessibilityLabel="Email"
        />
      </View>
      <View className="py-2 self-stretch">
        <Text className="mb-2 text-gray-800 font-bold">Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Your username"
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
      <View className="py-2 self-stretch">
        <Text className="mb-2 text-gray-800 font-bold">Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={4}
          className="border border-gray-300 bg-white text-gray-800 rounded-md px-4 py-4 h-30 text-top"
          accessibilityLabel="Bio"
        />
      </View>
      <View className="py-2 self-stretch">
        <Text className="mb-2 text-gray-800 font-bold">Avatar URL</Text>
        <TextInput
          value={avatar_url}
          onChangeText={setAvatar_url}
          placeholder="https://example.com/avatar.jpg"
          autoCapitalize="none"
          autoCorrect={false}
          className="border border-gray-300 bg-white text-gray-800 rounded-md px-4 py-4"
          accessibilityLabel="Avatar URL"
        />
      </View>
      <View className="py-2 self-stretch mt-8">
        <Button
          title={loading ? 'Loading ...' : 'Update Profile'}
          onPress={() => {
            console.log('🔘 Update Profile button pressed!')
            updateProfile({ username, birthdate, bio, avatar_url })
          }}
          disabled={loading}
        />
      </View>
      <View className="py-2 self-stretch">
        <Button 
          title="Sign Out" 
          onPress={() => {
            console.log('🔘 Sign Out button UI pressed!')
            handleSignOut()
          }}
        />
      </View>
    </View>
  )
}