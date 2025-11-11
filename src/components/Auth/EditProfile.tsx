import { useState, useEffect } from 'react'
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
  const { setProfile, profile, updateComputedProperties } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [socialLink, setSocialLink] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Sync form fields with profile data from store
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setBio(profile.bio || '')
      setSocialLink(profile.socialLink || '')
    } else {
      setUsername('')
      setBio('')
      setSocialLink('')
    }
  }, [profile])

  const updateProfile = async ({ 
    username, 
    bio, 
    socialLink,
  }: {
    username: string
    bio: string
    socialLink: string
  }) => {
    console.log('🔄 updateProfile called with:', { username, bio, socialLink })
    setLoading(true)
    setError(null)
    try {
      if (!session?.user) throw new Error('No user on the session!')
      console.log('✅ Session user found:', session.user.id)
    
      

      // Prepare the update data (only include non-empty fields)
      const updates: any = {}
      if (username?.trim()) updates.username = username.trim()
      if (bio?.trim()) {
        // Validate bio word count (max 50 words)
        const wordCount = bio.trim().split(/\s+/).length
        if (wordCount > 50) {
          throw new Error('Bio must be 50 words or less')
        }
        updates.bio = bio.trim()
      }
      if (socialLink?.trim()) updates.socialLink = socialLink.trim()
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
      console.log('🔍 Birthdate in response:', result.data?.birthdate)

      if (!response.ok || !result.success) {
        console.error('❌ API Error:', result.error || 'Failed to update profile')
        throw new Error(result.error || 'Failed to update profile')
      }

      // Update local store with the returned profile data
      // IMPORTANT: Preserve birthdate from current profile if not in response
      setProfile({
        username: result.data.username || null,
        birthdate: result.data.birthdate || profile?.birthdate || null,
        bio: result.data.bio || null,
        avatarUrl: result.data.avatarUrl || null,
        socialLink: result.data.socialLink || null,
      })
      console.log('✅ Profile updated successfully in store')
      console.log('🔍 Birthdate after update:', result.data.birthdate || profile?.birthdate || null)

      // IMPORTANT: Trigger re-calculation of age-based permissions
      updateComputedProperties()
      console.log('✅ Computed properties updated (age verification)')

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
        <Text className="mb-2 text-gray-800 font-bold">Bio (max 50 words)</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={4}
          className="border border-gray-300 bg-white text-gray-800 rounded-md px-4 py-4 h-30 text-top"
          accessibilityLabel="Bio"
        />
        <Text className="text-xs text-gray-500 mt-1">
          {bio.trim() ? bio.trim().split(/\s+/).length : 0} / 50 words
        </Text>
      </View>
      <View className="py-2 self-stretch">
        <Text className="mb-2 text-gray-800 font-bold">Social Media Link</Text>
        <TextInput
          value={socialLink}
          onChangeText={setSocialLink}
          placeholder="https://twitter.com/yourhandle or https://instagram.com/yourhandle"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          className="border border-gray-300 bg-white text-gray-800 rounded-md px-4 py-4"
          accessibilityLabel="Social Media Link"
        />
      </View>
      <View className="py-2 self-stretch mt-8">
        <Button
          title={loading ? 'Loading ...' : 'Update Profile'}
          onPress={() => {
            console.log('🔘 Update Profile button pressed!')
            updateProfile({ username, bio, socialLink })
          }}
          disabled={loading}
        />
      </View>
     
    </View>
  )
}