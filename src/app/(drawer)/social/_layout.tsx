import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

import { useAuthStore } from '~/store/authStore';
import { useUserAge } from '~/hooks/useUserAge';

export default function SocialLayout() {
  const { isLoggedIn } = useAuthStore();
  const { canUseSocialFeatures, hasProvidedBirthdate } = useUserAge();

  // Show age restriction message for logged in users who can't access social features
  if (isLoggedIn && !canUseSocialFeatures) {
    return (
      <View className="flex-1 justify-center items-center px-xl bg-app-background">
        <Text className="typography-header text-app-primary text-center mb-lg">Social Features Restricted</Text>
        {!hasProvidedBirthdate ? (
          <Text className="typography-copy text-app-secondary text-center leading-6">
            Please add your birthdate in your profile to access social features and comply with our terms of service.
          </Text>
        ) : (
          <Text className="typography-copy text-app-secondary text-center leading-6">
            You must be 13 or older to access social features including profiles, posts, and comments. 
            You can still use all other app features like counters, builds, and resources.
          </Text>
        )}
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn && canUseSocialFeatures}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}


