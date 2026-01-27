import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { AdConfig } from '~/services/adsService';

interface AdModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  
  /** Callback when modal should close */
  onClose: () => void;
  
  /** The ad configuration to display */
  ad?: AdConfig | null;
}

/**
 * AdModal Component
 * 
 * Full-screen modal displaying detailed information about a service ad.
 * Includes features list and CTA button.
 * CTA opens the external intake page.
 */
export function AdModal({ visible, onClose, ad }: AdModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!ad) {
    return null;
  }

  // Gradient colors based on accent color
  const gradientColors: Record<string, [string, string]> = {
    blue: ['#3b82f6', '#1e40af'],
    green: ['#10b981', '#047857'],
    purple: ['#a855f7', '#7e22ce'],
    orange: ['#f97316', '#c2410c'],
    pink: ['#ec4899', '#be185d'],
  };

  const gradient = gradientColors[ad.accentColor] || gradientColors.blue;
  const features = Array.isArray(ad.features) ? ad.features : [];

  console.log('[AdModal] ad details', {
    id: ad.id,
    title: ad.title,
    featuresCount: features.length,
    hasDescription: Boolean(ad.description),
  });

  const handlePrimaryCTA = async () => {
    setIsLoading(true);
    
    try {
      // Open external intake URL (in-app on mobile, new tab on web)
      const supported = await Linking.canOpenURL(ad.ctaUrl);
      
      if (supported) {
        await Linking.openURL(ad.ctaUrl);
        
        // On web, don't close modal since it opens in new tab
        if (Platform.OS !== 'web') {
          onClose();
        }
      } else {
        Alert.alert('Error', 'Unable to open this link');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Failed to open the link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        {/* Content Container - Constrained size */}
        <View 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full overflow-hidden"
          style={{ maxWidth: 480, maxHeight: '90%' }}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-4"
          >
            {/* Close button */}
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-2 right-2 bg-white/20 rounded-full p-1.5 z-10"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>

            {/* Icon and Title */}
            <View className="items-center">
              <View className="bg-white/20 rounded-full p-3 mb-2">
                <Ionicons 
                  name={ad.icon as any} 
                  size={36} 
                  color="white" 
                />
              </View>
              <Text className="text-white font-bold text-xl text-center mb-1">
                {ad.title}
              </Text>
              <Text className="text-white/90 text-sm text-center">
                {ad.tagline}
              </Text>
            </View>
          </LinearGradient>

          {/* Scrollable Content */}
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            <View className="p-4">
              {/* Description */}
              <Text className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-5">
                {ad.description}
              </Text>

              {/* Features List */}
              <Text className="text-gray-900 dark:text-white font-bold text-base mb-2">
                What&apos;s Included:
              </Text>
              <View className="space-y-2">
                {features.map((feature, index) => (
                  <View key={`${feature}-${index}`} className="flex-row items-start gap-2">
                    <Ionicons name="checkmark-circle" size={16} color={gradient[0]} style={{ marginTop: 2 }} />
                    <Text className="text-sm text-gray-800 dark:text-gray-200 leading-5">
                      {feature}
                    </Text>
                  </View>
                ))}
                {features.length === 0 && (
                  <Text className="text-sm text-gray-600 dark:text-gray-400 leading-5">
                    Details coming soon.
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="p-4 pt-2 pb-2 border-t border-gray-200 dark:border-gray-700">
              {/* Primary CTA */}
              <TouchableOpacity
                onPress={handlePrimaryCTA}
                disabled={isLoading}
                activeOpacity={0.8}
                className="mb-0"
              >
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-lg py-3 px-5"
                >
                  <Text className="text-white text-center font-bold text-sm">
                    {isLoading ? 'Opening...' : ad.ctaText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
}
