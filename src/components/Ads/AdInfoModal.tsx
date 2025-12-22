import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * AdInfoModal Component
 * 
 * Explains what the featured service cards are - transparency modal
 * showing that these are services offered by the app developer.
 */
export function AdInfoModal({ visible, onClose }: AdInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full overflow-hidden"
          style={{ maxWidth: 400 }}
        >
          {/* Header */}
          <View className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-2 right-2 bg-white/20 rounded-full p-1.5 z-10"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
            
            <View className="items-center">
              <View className="bg-white/20 rounded-full p-3 mb-2">
                <Ionicons name="information-circle" size={36} color="white" />
              </View>
              <Text className="text-white font-bold text-xl text-center">
                About Featured Services
              </Text>
            </View>
          </View>

          {/* Content */}
          <ScrollView className="max-h-96">
            <View className="p-5">
              <Text className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-5">
                These cards highlight services offered directly by the creator of Poké Pages. 
                They&apos;re not traditional advertisements from third parties.
              </Text>

              <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                <View className="flex-row items-start mb-2">
                  <Ionicons 
                    name="shield-checkmark" 
                    size={20} 
                    color="#3b82f6" 
                    style={{ marginRight: 8, marginTop: 1 }}
                  />
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-semibold text-sm mb-1">
                      First-Party Services
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-xs leading-4">
                      All services are provided by the same developer who built this app
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mb-4">
                <View className="flex-row items-start mb-2">
                  <Ionicons 
                    name="heart" 
                    size={20} 
                    color="#a855f7" 
                    style={{ marginRight: 8, marginTop: 1 }}
                  />
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-semibold text-sm mb-1">
                      Support Development
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-xs leading-4">
                      Using these services helps support the continued development of Poké Pages
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
                <View className="flex-row items-start mb-2">
                  <Ionicons 
                    name="eye-off" 
                    size={20} 
                    color="#10b981" 
                    style={{ marginRight: 8, marginTop: 1 }}
                  />
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-semibold text-sm mb-1">
                      No Tracking or Data Sharing
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-xs leading-4">
                      Your privacy is protected - no third-party ad networks or tracking
                    </Text>
                  </View>
                </View>
              </View>

              <Text className="text-gray-600 dark:text-gray-400 text-xs leading-5 italic">
                You can dismiss any featured service card at any time by tapping the X icon. 
                They won&apos;t reappear during your current session.
              </Text>
            </View>
          </ScrollView>

          {/* Action Button */}
          <View className="p-4 border-t border-gray-200 dark:border-gray-700">
            <TouchableOpacity
              onPress={onClose}
              className="bg-blue-500 rounded-lg py-3 px-5"
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-semibold text-sm">
                Got It!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
