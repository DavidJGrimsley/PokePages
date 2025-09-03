import { useState, useEffect } from 'react'
import { supabase } from "~/utils/supabaseClient"
import { useAuthStore } from "../utils/authStore"
import { StyleSheet, View, Alert, Platform, Text, TextInput } from 'react-native'
import { Session } from '@supabase/supabase-js'

import { Button } from '~/components/Button'
import ErrorMessage from '~/components/Error'
import { theme } from '../../constants/style/theme'

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
      // Clear form if no profile
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

      // Validate username length (your constraint requires >= 3 chars)
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
        console.error('Supabase error:', error)
        setError(error.message)
        showAlert('Update Failed', error.message)
        return
      }

      // Update the store with the new profile data
      setProfile({
        username: username || null,
        birthdate: birthdate || null,
        bio: bio || null,
        avatar_url: avatar_url || null,
      })

      showAlert('Success', isSignUp ? 'Profile created successfully!' : 'Profile updated successfully!')
    } catch (error) {
      console.error('Full error:', error)
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
    <View style={styles.container}>
      {error && (
        <View style={{ marginVertical: theme.spacing.lg }}>
          <ErrorMessage
            title="Profile Error"
            description="There was a problem loading or updating your profile."
            error={error}
          />
        </View>
      )}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          value={session?.user?.email ?? ''}
          editable={false}
          selectTextOnFocus={false}
          style={[styles.input, styles.inputDisabled]}
          accessibilityLabel="Email"
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Your username"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
          style={styles.input}
          accessibilityLabel="Username"
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Text style={styles.inputLabel}>Birthdate</Text>
        <TextInput
          value={birthdate}
          onChangeText={setBirthdate}
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          accessibilityLabel="Birthdate"
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Text style={styles.inputLabel}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
          accessibilityLabel="Bio"
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : (isSignUp ? 'Complete Profile' : 'Update')}
          onPress={() => updateProfile({ username, birthdate, bio, avatar_url: avatarUrl })}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={handleSignOut} />
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
  inputLabel: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.light.text,
    ...theme.typography.copyBold,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
    backgroundColor: theme.colors.light.white,
    color: theme.colors.light.text,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.typography.copy,
  },
  inputDisabled: {
    backgroundColor: theme.colors.light.background,
    color: theme.colors.light.brown,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
})