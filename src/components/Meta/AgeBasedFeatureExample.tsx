import React from 'react';
import { View, Text } from 'react-native';
import { useUserAge } from '~/hooks/useUserAge';

/**
 * Example component showing how to use age-based features
 * This demonstrates the different states and permissions based on user age
 */
export const AgeBasedFeatureExample = () => {
  const {
    isAdult,
    canUseSocialFeatures,
    hasProvidedBirthdate,
    shouldShowSocialTab,
    shouldShowAgeWarning,
    isLoggedIn,
  } = useUserAge();

  if (!isLoggedIn) {
    return (
      <View className="p-6">
        <Text className="typography-header text-app-primary text-center mb-6">Age-Based Features</Text>
        <Text className="typography-copy text-app-secondary text-center">Please sign in to see personalized features</Text>
      </View>
    );
  }

  return (
    <View className="p-6">
      <Text className="typography-header text-app-primary text-center mb-6">Your Account Status</Text>
      
      {!hasProvidedBirthdate && (
        <View className="p-4 rounded-md mb-3 border bg-yellow-100 border-yellow-200">
          <Text className="typography-copy-bold mb-1">⚠️ Birthdate Not Provided</Text>
          <Text className="typography-copy">
            Add your birthdate to access age-appropriate features and comply with our terms of service.
          </Text>
        </View>
      )}

      {shouldShowAgeWarning && (
        <View className="p-4 rounded-md mb-3 border bg-sky-100 border-blue-200">
          <Text className="typography-copy-bold mb-1">ℹ️ Limited Access</Text>
          <Text className="typography-copy">
            You can use all basic features (counters, builds, resources) but need to be 13+ for social features.
          </Text>
        </View>
      )}

      {shouldShowSocialTab && (
        <View className="p-4 rounded-md mb-3 border bg-green-100 border-green-200">
          <Text className="typography-copy-bold mb-1">✅ Social Features Available</Text>
          <Text className="typography-copy">
            You can access the social tab, create posts, and interact with other users.
          </Text>
        </View>
      )}

      {isAdult && (
        <View className="p-4 rounded-md mb-3 border bg-green-100 border-green-200">
          <Text className="typography-copy-bold mb-1">🔓 Full Access</Text>
          <Text className="typography-copy">
            As an adult user (18+), you have access to all features without restrictions.
          </Text>
        </View>
      )}

      <View className="mt-6 p-4 bg-app-background rounded-sm">
        <Text className="typography-copy-bold mb-1">Debug Info:</Text>
        <Text className="font-mono text-xs text-app-secondary">Has Birthdate: {hasProvidedBirthdate ? 'Yes' : 'No'}</Text>
        <Text className="font-mono text-xs text-app-secondary">Can Use Social: {canUseSocialFeatures ? 'Yes' : 'No'}</Text>
        <Text className="font-mono text-xs text-app-secondary">Is Adult: {isAdult ? 'Yes' : 'No'}</Text>
      </View>
    </View>
  );
};
 
