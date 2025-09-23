import { StyleSheet, View, TextInput, ScrollView, Alert, Text } from 'react-native'
import React, { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from "~/utils/supabaseClient"
import { Button } from 'components/UI/Button'
import { theme } from 'constants/style/theme'
import ErrorMessage from 'components/Meta/Error'

export default function SignUp() {
  const params = useLocalSearchParams()
  
  // Pre-fill from sign-in screen
  const [email, setEmail] = useState(params.email as string || '')
  const [password, setPassword] = useState(params.password as string || '')
  
  // Additional profile fields
  const [username, setUsername] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [bio, setBio] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function signUpWithProfile() {
    setLoading(true)
    setErrorMessage(null)

    try {
      // First, create the auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (signUpError) {
        setErrorMessage(signUpError.message)
        setLoading(false)
        return
      }

      // If signup successful and we have a user, create the profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username: username,
              birthdate: birthdate || null,
              bio: bio || null,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
          ])

        if (profileError) {
          setErrorMessage(`Profile creation failed: ${profileError.message}`)
          setLoading(false)
          return
        }

        Alert.alert(
          'Success!',
          'Please check your inbox for email verification!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        )
      } else if (!signUpError) {
        setErrorMessage('Please check your inbox for email verification!')
      }
    } catch {
      setErrorMessage('An unexpected error occurred')
    }

    setLoading(false)
  }

  const canSubmit = email.length > 0 && password.length > 0 && username.length > 0

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>
        Fill in the additional details to complete your profile
      </Text>

      {errorMessage && (
        <ErrorMessage
          title="Sign Up Error"
          description="There was a problem creating your account."
          error={errorMessage}
        />
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          keyboardType="email-address"
          style={styles.input}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Password *</Text>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Choose a secure password"
          autoCapitalize={'none'}
          style={styles.input}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Username *</Text>
        <TextInput
          onChangeText={(text) => setUsername(text)}
          value={username}
          placeholder="Choose a unique username"
          autoCapitalize={'none'}
          style={styles.input}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Birthdate (Optional)</Text>
        <TextInput
          onChangeText={(text) => setBirthdate(text)}
          value={birthdate}
          placeholder="YYYY-MM-DD"
          style={styles.input}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Bio (Optional)</Text>
        <TextInput
          onChangeText={(text) => setBio(text)}
          value={bio}
          placeholder="Tell us about yourself..."
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
          editable={!loading}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="Create Account" 
          disabled={loading || !canSubmit} 
          onPress={signUpWithProfile} 
        />
        <Button 
          title="Back to Sign In" 
          disabled={loading} 
          onPress={() => router.back()}
          style={styles.secondaryButton}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.header,
    color: theme.colors.light.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.copy,
    color: theme.colors.light.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.copyBold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.light.white,
    color: theme.colors.light.text,
    ...theme.typography.copy,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  secondaryButton: {
    backgroundColor: theme.colors.light.secondary,
  },
})
