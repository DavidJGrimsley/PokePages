import { Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { useState, useCallback } from 'react';

import { useAuthStore } from '~/store/authStore';
import { useUserAge } from '~/hooks/useUserAge';
import BirthdateModal from '~/components/Auth/BirthdateModal';
import { Button } from '~/components/UI/Button';

export default function SocialLayout() {
  const { isLoggedIn, profile, _authInitialized } = useAuthStore();
  const { canUseSocialFeatures, hasProvidedBirthdate } = useUserAge();
  const [showBirthdateModal, setShowBirthdateModal] = useState(false);

  // Debug logging - MOVED BEFORE HOOKS
  console.log('🔍 Social Layout Debug:', {
    authInitialized: _authInitialized,
    isLoggedIn,
    canUseSocialFeatures,
    hasProvidedBirthdate,
    birthdate: profile?.birthdate,
    profileFull: profile ? {
      username: profile.username,
      birthdate: profile.birthdate,
      bio: profile.bio,
      hasAvatarUrl: !!profile.avatarUrl,
      socialLink: profile.socialLink,
    } : null,
  });

  const handleOpenModal = useCallback(() => {
    setShowBirthdateModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowBirthdateModal(false);
  }, []);

  const handleSuccess = useCallback(() => {
    setShowBirthdateModal(false);
  }, []);

  // Debug logging
  console.log('🔍 After hooks - Social Layout Debug:', {
    isLoggedIn,
    canUseSocialFeatures,
    hasProvidedBirthdate,
    birthdate: profile?.birthdate,
    fullProfile: profile,
    authInitialized: _authInitialized,
  });

  // Don't render anything until auth initialization is complete
  // This prevents showing the "add birthdate" modal when the profile hasn't loaded yet
  if (!_authInitialized) {
    console.log('⏳ Auth not yet initialized, waiting...');
    return (
      <View className="flex-1 justify-center items-center bg-app-background">
        <Text className="typography-copy text-app-secondary">Loading...</Text>
      </View>
    );
  }

  // Show age restriction message for logged in users who can't access social features
  if (isLoggedIn && !canUseSocialFeatures) {
    return (
      <>
        <View className="flex-1 justify-center items-center px-xl bg-app-background">
          <Text className="typography-header text-app-primary text-center mb-lg">Social Features Restricted</Text>
          {!hasProvidedBirthdate ? (
            <>
              <Text className="typography-copy text-app-secondary text-center leading-6 mb-lg">
                Please add your birthdate to access social features and comply with our terms of service.
              </Text>
              <Button 
                title="Add Birthdate" 
                onPress={handleOpenModal} 
              />
            </>
          ) : (
            <Text className="typography-copy text-app-secondary text-center leading-6">
              You must be 13 or older to access social features including profiles, posts, and comments. 
              You can still use all other app features like counters, builds, and resources.
            </Text>
          )}
        </View>
        
        {/* Render modal outside the conditional flow to avoid re-render issues */}
        <BirthdateModal
          visible={showBirthdateModal}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      </>
    );
  }

  return (
    <Stack>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn && canUseSocialFeatures}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="conversations/[conversationId]" />
      </Stack.Protected>
    </Stack>
  );
}


