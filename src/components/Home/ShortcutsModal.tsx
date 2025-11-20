import React from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShortcutsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-lg">
        <View className="bg-app-background dark:bg-dark-app-background rounded-xl w-full max-w-md shadow-app-large">
          {/* Header */}
          <View className="flex-row items-center justify-between p-md border-b border-app-flag">
            <Text className="typography-subheader text-app-text dark:text-dark-app-text">
              About Shortcuts
            </Text>
            <Pressable onPress={onClose} className="p-sm">
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView className="p-lg" showsVerticalScrollIndicator={false}>
            <Text className="typography-copy text-app-text dark:text-dark-app-text mb-md">
              Shortcuts give you quick access to your favorite features right from the home screen!
            </Text>

            {/* How it Works */}
            <Text className="typography-subheader text-app-secondary mb-sm">
              How it Works
            </Text>
            <Text className="typography-copy text-app-brown dark:text-dark-app-brown mb-md">
              1. Navigate to any feature page (like Type Analyzer, Pokédex Tracker, etc.)
            </Text>
            <Text className="typography-copy text-app-brown dark:text-dark-app-brown mb-md">
              2. Look for the heart icon in the header
            </Text>

            {/* Heart Icon Demo */}
            <View className="flex-row items-center justify-around bg-app-white dark:bg-gray-800 rounded-lg p-md mb-md">
              <View className="items-center">
                <Ionicons name="heart-outline" size={32} color="#6B7280" />
                <Text className="text-xs text-app-brown mt-xs">Not Favorited</Text>
              </View>
              <Text className="text-2xl text-app-brown">→</Text>
              <View className="items-center">
                <Ionicons name="heart" size={32} color="#F44336" />
                <Text className="text-xs text-app-brown mt-xs">Favorited!</Text>
              </View>
            </View>

            <Text className="typography-copy text-app-brown dark:text-dark-app-brown mb-md">
              3. Tap the heart to add the feature to your shortcuts
            </Text>
            <Text className="typography-copy text-app-brown dark:text-dark-app-brown mb-md">
              4. Your shortcuts will appear on the home screen as orange HomeCards
            </Text>

            {/* Features with Favorites */}
            <Text className="typography-subheader text-app-secondary mb-sm">
              Available Features
            </Text>
            <Text className="typography-copy text-app-brown dark:text-dark-app-brown mb-sm">
              • Type Analyzer
            </Text>
            <Text className="typography-copy text-app-brown dark:text-dark-app-brown mb-sm">
              • Pokédex Tracker
            </Text>
            <Text className="typography-copy text-app-brown dark:text-dark-app-brown mb-lg">
              • More coming soon!
            </Text>

            {/* Close Button */}
            <Pressable
              className="bg-app-accent py-md px-lg rounded-md items-center active:opacity-80"
              onPress={onClose}
            >
              <Text className="typography-cta text-app-background dark:text-dark-app-background">
                Got it!
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
