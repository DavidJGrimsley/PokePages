import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

import { useAuthStore } from '~/store/authStore';
import { useUserAge } from '~/hooks/useUserAge';
import { theme } from 'constants/style/theme';

export default function SocialLayout() {
  const { isLoggedIn } = useAuthStore();
  const { canUseSocialFeatures, hasProvidedBirthdate } = useUserAge();

  // Show age restriction message for logged in users who can't access social features
  if (isLoggedIn && !canUseSocialFeatures) {
    return (
      <View style={styles.restrictionContainer}>
        <Text style={styles.restrictionTitle}>Social Features Restricted</Text>
        {!hasProvidedBirthdate ? (
          <Text style={styles.restrictionText}>
            Please add your birthdate in your profile to access social features and comply with our terms of service.
          </Text>
        ) : (
          <Text style={styles.restrictionText}>
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

const styles = StyleSheet.create({
  restrictionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.light.background,
  },
  restrictionTitle: {
    ...theme.typography.header,
    color: theme.colors.light.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  restrictionText: {
    ...theme.typography.copy,
    color: theme.colors.light.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
