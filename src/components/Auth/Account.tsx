import { useState, useEffect } from 'react'
import { supabase } from "utils/supabaseClient"
import { useAuthStore } from "~/store/authStore"
import { View, Alert, Platform, Text, TextInput } from 'react-native'
import { Session } from '@supabase/supabase-js'

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

export default function Account({ session, isSignUp = false }: { session: Session; isSignUp?: boolean }) {
  const { signOut, setProfile, profile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Sync form fields with profile data from store
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setBirthdate(profile.birthdate || '')
      setBio(profile.bio || '')
      setAvatarUrl(profile.avatar_url || '')
    } else {
      setUsername('')
      setBirthdate('')
      setBio('')
      setAvatarUrl('')
    }
  }, [profile])

  async function updateProfile({
    username,
    birthdate,
    bio,
    avatar_url,
  }: {
    username: string
    birthdate: string
    bio: string
    avatar_url: string
  }) {
    setLoading(true)
    setError(null)
    try {
      if (!session?.user) throw new Error('No user on the session!')
      if (username && username.length < 3) {
        const errorMsg = 'Username must be at least 3 characters long'
        setError(errorMsg)
        showAlert('Validation Error', errorMsg)
        return
      }
      const updates = {
        id: session?.user.id,
        username: username || null,
        birthdate: birthdate || null,
        bio: bio || null,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString(),
      }
      const { data, error } = await supabase.from('profiles').upsert(updates)
      if (error) {
        setError(error.message)
        showAlert('Update Failed', error.message)
        return
      }
      setProfile({
        username: username || null,
        birthdate: birthdate || null,
        bio: bio || null,
        avatar_url: avatar_url || null,
      })
      showAlert('Success', isSignUp ? 'Profile created successfully!' : 'Profile updated successfully!')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
        showAlert('Update Failed', error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
    } catch (error) {
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
      <View className="py-2 self-stretch mt-8">
        <Button
          title={loading ? 'Loading ...' : (isSignUp ? 'Complete Profile' : 'Update')}
          onPress={() => updateProfile({ username, birthdate, bio, avatar_url: avatarUrl })}
          disabled={loading}
        />
      </View>
      <View className="py-2 self-stretch">
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    </View>
  )
}