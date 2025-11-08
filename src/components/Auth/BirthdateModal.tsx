import React, { useState } from 'react'
import { View, Text, Modal, TouchableOpacity, Platform, Alert } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Button } from 'components/UI/Button'
import { buildApiUrl } from '~/utils/apiConfig'
import { useAuthStore } from '~/store/authStore'

interface BirthdateModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function BirthdateModal({ visible, onClose, onSuccess }: BirthdateModalProps) {
  const { setProfile, updateComputedProperties, session } = useAuthStore()
  const [birthdate, setBirthdate] = useState(new Date(2000, 0, 1))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    
    if (selectedDate) {
      setBirthdate(selectedDate)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!session?.user) {
        throw new Error('You must be logged in to set your birthdate')
      }

      const apiUrl = buildApiUrl(`profiles/${session.user.id}`)

      // Small helper to avoid indefinite hanging fetches
      const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 15000) => {
        return Promise.race([
          fetch(url, options),
          new Promise((_r, rej) => setTimeout(() => rej(new Error('Request timed out')), timeout)),
        ]) as Promise<Response>
      }

      const response = await fetchWithTimeout(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          birthdate: birthdate.toISOString().split('T')[0], // YYYY-MM-DD format
        }),
      }, 15000)

      const result = await (response as Response).json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update birthdate')
      }

      // Update local store
      setProfile({
        username: result.data.username || null,
        birthdate: result.data.birthdate || null,
        bio: result.data.bio || null,
        avatarUrl: result.data.avatarUrl || null,
      })

      // Trigger re-calculation of age-based permissions
      updateComputedProperties()

      if (Platform.OS === 'web') {
        window.alert('Birthdate saved successfully! You can now access social features.')
      } else {
        Alert.alert('Success', 'Birthdate saved successfully! You can now access social features.')
      }

      onSuccess()
    } catch (error) {
      console.error('Birthdate update error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
      
      if (Platform.OS === 'web') {
        window.alert(`Error: ${errorMessage}`)
      } else {
        Alert.alert('Error', errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-lg p-6 w-full max-w-md">
          <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Set Your Birthdate
          </Text>

          <View className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Text className="text-blue-800 text-sm">
              To access social features, we need to verify your age. You must be 13 or older.
            </Text>
          </View>

          <View className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Text className="text-yellow-800 text-xs font-semibold">
              ⚠️ Important: Your birthdate cannot be changed after setting it. 
              Please ensure it&apos;s accurate. Contact support if you need to update it later.
            </Text>
          </View>

          {error && (
            <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}

          <View className="mb-6">
            <Text className="mb-2 text-gray-800 font-bold">Birthdate</Text>
            
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={birthdate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const dateString = e.target.value
                  if (dateString) {
                    const newDate = new Date(dateString + 'T00:00:00.000Z')
                    setBirthdate(newDate)
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                min={new Date(1900, 0, 1).toISOString().split('T')[0]}
                className="border border-gray-300 bg-white text-gray-800 rounded-md px-4 py-4 w-full"
                style={{
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  height: '64px',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="border border-gray-300 bg-white rounded-md px-4 py-4"
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
          </View>

          <View className="space-y-2">
            <Button
              title={loading ? 'Saving...' : 'Save Birthdate'}
              onPress={handleSubmit}
              disabled={loading}
            />
            <Button
              title="Cancel"
              onPress={onClose}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}
