import { useState, useEffect } from 'react'
import { supabase } from "~/utils/supabaseClient"
import { useAuthStore } from "../utils/authStore"
import { StyleSheet, View, Alert, Platform, Text, TextInput } from 'react-native'
import { Session } from '@supabase/supabase-js'

import { Button } from '~/components/Button'
import { theme } from '../../constants/style/theme'

// Cross-platform alert function
const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title)
  } else {
    Alert.alert(title, message)
  }
}

export default function Account({ session }: { session: Session }) {
  const { signOut } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, bio, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setBio(data.bio)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    bio,
    avatar_url,
  }: {
    username: string
    bio: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      // Validate username length (your constraint requires >= 3 chars)
      if (username && username.length < 3) {
        showAlert('Validation Error', 'Username must be at least 3 characters long')
        return
      }

      const updates = {
        id: session?.user.id,
        username: username || null,
        bio: bio || null,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString(),
      }

      console.log('Sending updates:', updates)

      const { data, error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        console.error('Supabase error:', error)
        showAlert('Update Failed', error.message)
        return
      }

      showAlert('Success', 'Profile updated successfully!')
      console.log('Update successful:', data)
    } catch (error) {
      console.error('Full error:', error)
      if (error instanceof Error) {
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
          title={loading ? 'Loading ...' : 'Update'}
          onPress={() => updateProfile({ username, bio, avatar_url: avatarUrl })}
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