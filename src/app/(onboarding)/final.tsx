import { Stack, router } from 'expo-router';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import Theme, { typography, shadows, lineHeights } from '@/constants/style/theme';
const { colors, fontSizes, spacing } = Theme;
import { StatusBar } from 'expo-status-bar';
import { useRef, useState, useCallback } from 'react';


import { Button } from '~/components/Button';
import { useOnboardingStore } from '~/utils/onboardingStore';
import { PrettyText } from '@/src/components/PrettyText';
import { size } from '@shopify/react-native-skia';

export default function OnboardingFinalScreen() {
  const { completeOnboarding, hasCompletedOnboarding } = useOnboardingStore();
  // const [confettiVisible, setConfettiVisible] = useState(false);
  // const [cannonPositions, setCannonPositions] = useState<{ x: number; y: number }[]>([]);
  // const [runId, setRunId] = useState(0); // force remount per run
  // const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exploreBtnRef = useRef<View>(null); // ref to the Start Exploring button
  const signInButtonRef = useRef<View>(null); // ref to the Sign In button



  const handleCompleteOnboarding = useCallback(() => {
    // setConfettiVisible(false);
    console.log('Attempting to complete onboarding');
    console.log('Has completed onboarding: ', hasCompletedOnboarding);
    completeOnboarding();
    console.log('Has completed onboarding: ', hasCompletedOnboarding);
    router.replace('/(drawer)' as any);
    console.log('Onboarding completed, navigating to main app...');
  }, [completeOnboarding, hasCompletedOnboarding]);

  const handleSignInCompleteOnboarding = useCallback(() => {
    // setConfettiVisible(false);
    completeOnboarding();
    router.replace('/sign-in' as any);
  }, [completeOnboarding]);


  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '' }} />
      <StatusBar style="auto" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* <Image 
          source={require('@/assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        /> */}
        {/* <PrettyText text="Poké Pages" /> */}
        <Text style={styles.title}>You&apos;re All Set!</Text>
        <Text style={styles.subtitle}>
          Welcome to the Poké Pages community, trainer!
        </Text>
        {/* <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🎯</Text>
            <Text style={styles.featureText}>
              <Text style={styles.featureTitle}>Raid Builds</Text>
              {'\n'}Access counter strategies for legendary raids
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>📊</Text>
            <Text style={styles.featureText}>
              <Text style={styles.featureTitle}>Event Counters</Text>
              {'\n'}Track community progress on special events
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>📚</Text>
            <Text style={styles.featureText}>
              <Text style={styles.featureTitle}>Resources</Text>
              {'\n'}Find guides, tips, and battle strategies
            </Text>
          </View>
        </View> */}
        
        <View style={styles.authInfo}>
          <Text style={styles.authTitle}>💡 Tip</Text>
          <Text style={styles.authDescription}>
            Some features like social interactions will require creating an account, 
            but you can explore most of the app without signing up!
          </Text>
          
            <Button 
            ref={signInButtonRef}
            title="Sign In" 
            onPress={handleSignInCompleteOnboarding}
            />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          ref={exploreBtnRef}
          title="Start Exploring"
          onPress={handleCompleteOnboarding}
          style={styles.completeButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    padding: spacing.lg,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.xl,
    width: '100%',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
    ...shadows.large,
  },
  title: {
    ...typography.header,
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.subheader,
    color: colors.light.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: lineHeights.subheader,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  featureEmoji: {
    fontSize: fontSizes.header,
    marginRight: spacing.md,
    width: 32,
    textAlign: 'center',
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    ...typography.copy,
    color: colors.light.primary,
    lineHeight: lineHeights.copy,
  },
  featureTitle: {
    ...typography.copyBold,
    color: colors.light.text,
  },
  authInfo: {
    backgroundColor: colors.light.accent,
    borderRadius: 12,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.md,
  },
  authTitle: {
    ...typography.copyBold,
    color: colors.light.primary,
    marginBottom: spacing.sm,
  },
  authDescription: {
    ...typography.copy,
    color: colors.light.primary,
    lineHeight: lineHeights.copy,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  completeButton: {
    backgroundColor: colors.light.primary,
    width: '100%',
    borderRadius: 12,
    marginTop: spacing.md,
  },
});
