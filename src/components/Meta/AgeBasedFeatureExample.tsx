import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUserAge } from '~/hooks/useUserAge';
import { theme } from 'constants/style/theme';

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
      <View style={styles.container}>
        <Text style={styles.title}>Age-Based Features</Text>
        <Text style={styles.info}>Please sign in to see personalized features</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Account Status</Text>
      
      {!hasProvidedBirthdate && (
        <View style={[styles.card, styles.warning]}>
          <Text style={styles.cardTitle}>⚠️ Birthdate Not Provided</Text>
          <Text style={styles.cardText}>
            Add your birthdate to access age-appropriate features and comply with our terms of service.
          </Text>
        </View>
      )}

      {shouldShowAgeWarning && (
        <View style={[styles.card, styles.infoCard]}>
          <Text style={styles.cardTitle}>ℹ️ Limited Access</Text>
          <Text style={styles.cardText}>
            You can use all basic features (counters, builds, resources) but need to be 13+ for social features.
          </Text>
        </View>
      )}

      {shouldShowSocialTab && (
        <View style={[styles.card, styles.success]}>
          <Text style={styles.cardTitle}>✅ Social Features Available</Text>
          <Text style={styles.cardText}>
            You can access the social tab, create posts, and interact with other users.
          </Text>
        </View>
      )}

      {isAdult && (
        <View style={[styles.card, styles.success]}>
          <Text style={styles.cardTitle}>🔓 Full Access</Text>
          <Text style={styles.cardText}>
            As an adult user (18+), you have access to all features without restrictions.
          </Text>
        </View>
      )}

      <View style={styles.debugInfo}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        <Text style={styles.debugText}>Has Birthdate: {hasProvidedBirthdate ? 'Yes' : 'No'}</Text>
        <Text style={styles.debugText}>Can Use Social: {canUseSocialFeatures ? 'Yes' : 'No'}</Text>
        <Text style={styles.debugText}>Is Adult: {isAdult ? 'Yes' : 'No'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.header,
    color: theme.colors.light.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  info: {
    ...theme.typography.copy,
    color: theme.colors.light.secondary,
    textAlign: 'center',
  },
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
  },
  cardTitle: {
    ...theme.typography.copyBold,
    marginBottom: theme.spacing.xs,
  },
  cardText: {
    ...theme.typography.copy,
  },
  warning: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
  },
  infoCard: {
    backgroundColor: '#D1ECF1',
    borderColor: '#B3D4FC',
  },
  success: {
    backgroundColor: '#D4EDDA',
    borderColor: '#C3E6CB',
  },
  debugInfo: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.light.background,
    borderRadius: theme.borderRadius.sm,
  },
  debugTitle: {
    ...theme.typography.copyBold,
    marginBottom: theme.spacing.xs,
  },
  debugText: {
    ...theme.typography.mono,
    fontSize: 12,
    color: theme.colors.light.secondary,
  },
});
