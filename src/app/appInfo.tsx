import { Stack, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View, Pressable, Linking, StyleSheet } from 'react-native';
import { useState } from 'react';
import { theme } from '@/constants/style/theme';

import { ScreenContent } from '~/components/ScreenContent';
import { ShowAgreement } from '~/components/ShowAgreement';
import { useAuthStore } from '~/utils/authStore';
import { useOnboardingStore } from '~/utils/onboardingStore';

export default function AppInfo() {
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementType, setAgreementType] = useState<'termsOfService' | 'privacyPolicy'>('termsOfService');
  const { logIn, logOut } = useAuthStore();
  const { resetOnboarding } = useOnboardingStore();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const openAgreement = (type: 'termsOfService' | 'privacyPolicy') => {
    setAgreementType(type);
    setShowAgreementModal(true);
  };

  const closeAgreement = () => {
    setShowAgreementModal(false);
  };

  // const handleResetOnboarding = () => {
  //   resetOnboarding();
  //   // The app will automatically redirect to onboarding
  // };

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <ScreenContent path="app/modal.tsx" title="Thank you">
        <View style={styles.container}>
          <Text style={styles.mainText}>
            Hello fellow trainers, I appreciate you using my app! This is and always will be free to use and free from ads. Consider it my gift to the community. If you&apos;d like to support then please follow my social media pages or view my portfolio website for more of my work and contact info. Go catch &apos;em all!
          </Text>
          <View style={styles.buttonContainer}>
            <Pressable 
              style={[styles.socialButton, styles.twitterButton]}
              onPress={() => handleLinkPress('https://twitter.com/MrDJ2U26')}
            >
              <Text style={styles.buttonText}>🐦 Twitter</Text>
            </Pressable>
            <Pressable 
              style={[styles.socialButton, styles.instagramButton]}
              onPress={() => handleLinkPress('https://instagram.com/OfficialMrDJ')}
            >
              <Text style={styles.buttonText}>📸 Instagram</Text>
            </Pressable>
            <Pressable 
              style={[styles.socialButton, styles.youtubeButton]}
              onPress={() => handleLinkPress('https://youtube.com/@MrDJsArcade')}
            >
              <Text style={styles.buttonText}>🎥 YouTube</Text>
            </Pressable>
          </View>
          <Pressable 
            style={styles.portfolioButton}
            onPress={() => handleLinkPress('https://www.DavidJGrimsley.com')}
          >
            <Text style={styles.portfolioButtonText}>🌐 Visit My Portfolio</Text>
            <Text style={styles.portfolioSubtext}>www.DavidJGrimsley.com</Text>
          </Pressable>
          <View style={styles.agreementButtonContainer}>
            <Pressable 
              style={styles.agreementButton}
              onPress={() => openAgreement('termsOfService')}
            >
              <Text style={styles.agreementButtonText}>📄 Terms of Service</Text>
            </Pressable>
            <Pressable 
              style={styles.agreementButton}
              onPress={() => openAgreement('privacyPolicy')}
            >
              <Text style={styles.agreementButtonText}>🔒 Privacy Policy</Text>
            </Pressable>
          </View>
          {/* Development Helper */}
          {__DEV__ && (
            <View>
              <Pressable
                style={styles.devButton}
                onPress={resetOnboarding}
              >
                <Text style={styles.devButtonText}>🔄 Reset Onboarding (Dev)</Text>
              </Pressable>
              <Link href="/sign-in" asChild push>
                <Pressable
                  style={styles.devButton}
                >
                  <Text style={styles.devButtonText}>🔄 Create Account or Sign up(Dev-supabase)</Text>
                </Pressable>
              </Link>
              <Pressable
                onPress={logIn}
                style={styles.devButton}
              >
                <Text style={styles.devButtonText}>🔄 Log In (Dev)</Text>
              </Pressable>
              <Pressable
                onPress={logOut}
                style={styles.devButton}
              >
                <Text style={styles.devButtonText}>🔄 Log Out (Dev)</Text>
              </Pressable>
            </View>
          )}
        </View>
        <ShowAgreement
          visible={showAgreementModal}
          onClose={closeAgreement}
          agreementType={agreementType}
        />
      </ScreenContent>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
    backgroundColor: theme.colors.light.background,
  },
  mainText: {
    ...theme.typography.copy,
    color: theme.colors.light.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    lineHeight: theme.lineHeights.copy,
  },
  followText: {
    ...theme.typography.subheader,
    color: theme.colors.light.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  socialButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    minWidth: 120,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  twitterButton: {
    backgroundColor: '#1DA1F2',
  },
  instagramButton: {
    backgroundColor: '#E4405F',
  },
  youtubeButton: {
    backgroundColor: '#FF0000',
  },
  buttonText: {
    color: theme.colors.light.white,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  portfolioButton: {
    backgroundColor: theme.colors.light.accent,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.large,
    marginTop: theme.spacing.sm,
  },
  portfolioButtonText: {
    color: theme.colors.light.white,
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  portfolioSubtext: {
    color: theme.colors.light.secondary,
    fontSize: theme.fontSizes.sm,
    fontWeight: '500',
  },
  agreementButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  agreementButton: {
    flex: 1,
    backgroundColor: theme.colors.light.secondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  agreementButtonText: {
    color: theme.colors.light.white,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  devButton: {
    backgroundColor: theme.colors.light.red,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  devButtonText: {
    color: theme.colors.light.white,
    fontSize: theme.fontSizes.xs,
    fontWeight: '500',
  },
});
