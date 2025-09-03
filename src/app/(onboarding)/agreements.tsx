import { Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import Theme, { typography, shadows, lineHeights } from '@/constants/style/theme';
const { colors, fontSizes, spacing } = Theme;

import { Button } from "~/components/Button";
import { PrettyText } from '~/components/PrettyText';
import { ShowAgreement } from '~/components/ShowAgreement';
import { useOnboardingStore } from "~/utils/onboardingStore";

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const { 
    hasAcceptedTerms, 
    hasAcceptedPrivacy, 
    acceptTerms, 
    acceptPrivacy 
  } = useOnboardingStore();

  const canContinue = hasAcceptedTerms && hasAcceptedPrivacy;
  
   const handleAcceptTerms = () => {
    acceptTerms();
    setShowTermsModal(false);
  };

  const handleAcceptPrivacy = () => {
    acceptPrivacy();
    setShowPrivacyModal(false);
  };


  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '' }} />
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        {/* <Image 
          source={require('@/assets/favicon.png')} 
          style={styles.logo}
          resizeMode="contain"
        /> */}
        {/* <PrettyText text="Poké Pages" /> */}
        
        <Text style={styles.title}>Legal Agreements</Text>
        
        <Text style={styles.subtitle}>
          Before we begin, please review and accept our terms
        </Text>
        
        <View style={styles.agreementContainer}>
          <View style={styles.agreementItem}>
            <Text style={styles.agreementText}>Terms of Service</Text>
            <Button
              title={hasAcceptedTerms ? "Accepted" : "Review & Accept"}
              onPress={() => setShowTermsModal(true)}
              style={
                hasAcceptedTerms
                  ? [styles.agreementButton, styles.acceptedButton]
                  : [styles.agreementButton]
              }
            />
          </View>

          <View style={styles.agreementItem}>
            <Text style={styles.agreementText}>Privacy Policy</Text>
            <Button
              title={hasAcceptedPrivacy ? "Accepted" : "Review & Accept"}
              onPress={() => setShowPrivacyModal(true)}
              style={
                hasAcceptedPrivacy
                  ? [styles.agreementButton, styles.acceptedButton]
                  : [styles.agreementButton]
              }
            />
          </View>
        </View>

        {canContinue && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              🎉 Great! You&apos;re all set to continue
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Continue"
          disabled={!canContinue}
          onPress={() => {
            router.push('/final');
          }}
          style={ 
            !canContinue
              ? [styles.continueButton, styles.disabledButton]
              : [styles.continueButton]
          }
        />
      </View>

      {/* Terms Modal */}
            <ShowAgreement
              visible={showTermsModal}
              onClose={hasAcceptedTerms ? () => setShowTermsModal(false) : handleAcceptTerms}
              agreementType="termsOfService"
            />
            
            {/* Privacy Modal */}
            <ShowAgreement
              visible={showPrivacyModal}
              onClose={hasAcceptedPrivacy ? () => setShowPrivacyModal(false) : handleAcceptPrivacy}
              agreementType="privacyPolicy"
            />
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  logo: {
    width: '40%',
    height: '40%',
    marginBottom: spacing.lg,
    ...shadows.large,
  },
  title: {
    ...typography.header,
    color: colors.light.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.subheader,
    color: colors.light.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
    lineHeight: lineHeights.subheader,
  },
  agreementContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  agreementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  agreementText: {
    ...typography.copyBold,
    color: colors.light.primary,
    flex: 1,
  },
  agreementButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.light.flag,
    color: colors.light.white,
  },
  acceptedButton: {
    backgroundColor: colors.light.accent,
  },
  successContainer: {
    backgroundColor: colors.light.accent,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  successText: {
    ...typography.copyBold,
    color: colors.light.text,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: spacing.lg,
  },
  continueButton: {
    backgroundColor: colors.light.primary,
  },
  disabledButton: {
    backgroundColor: colors.light.red || '#ccc',
  },
});
