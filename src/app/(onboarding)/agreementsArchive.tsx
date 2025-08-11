import { Stack, Link } from 'expo-router';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { Button } from '~/components/Button';
import { ShowAgreement } from '~/components/ShowAgreement';
import { useOnboardingStore } from '~/utils/onboardingStore';

export default function OnboardingAgreementsScreen() {
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
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Legal Agreements</Text>
          
          <Text style={styles.subtitle}>
            Before we begin, please review and accept our terms
          </Text>
          
          <View style={styles.agreementContainer}>
            <View style={styles.agreementItem}>
              <View style={styles.agreementHeader}>
                <Text style={styles.agreementTitle}>📄 Terms of Service</Text>
                <View style={[styles.checkmark, hasAcceptedTerms && styles.checkmarkAccepted]}>
                  <Text style={[styles.checkmarkText, hasAcceptedTerms && styles.checkmarkTextAccepted]}>
                    {hasAcceptedTerms ? '✓' : '○'}
                  </Text>
                </View>
              </View>
              <Text style={styles.agreementDescription}>
                Understand how to use PokePages responsibly and what we expect from our community.
              </Text>
              <Button
                title={hasAcceptedTerms ? "Accepted" : "Review & Accept"}
                onPress={() => setShowTermsModal(true)}
                style={[styles.agreementButton, hasAcceptedTerms && styles.acceptedButton]}
              />
            </View>
            
            <View style={styles.agreementItem}>
              <View style={styles.agreementHeader}>
                <Text style={styles.agreementTitle}>🔒 Privacy Policy</Text>
                <View style={[styles.checkmark, hasAcceptedPrivacy && styles.checkmarkAccepted]}>
                  <Text style={[styles.checkmarkText, hasAcceptedPrivacy && styles.checkmarkTextAccepted]}>
                    {hasAcceptedPrivacy ? '✓' : '○'}
                  </Text>
                </View>
              </View>
              <Text style={styles.agreementDescription}>
                Learn how we protect your data and respect your privacy while using our app.
              </Text>
              <Button
                title={hasAcceptedPrivacy ? "Accepted" : "Review & Accept"}
                onPress={() => setShowPrivacyModal(true)}
                style={[styles.agreementButton, hasAcceptedPrivacy && styles.acceptedButton]}
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
      </ScrollView>
      
      <View style={styles.footer}>
        <Link href="./final" asChild push>
          <Button
            title="Continue"
            disabled={!canContinue}
            style={[styles.continueButton, !canContinue && styles.disabledButton]}
          />
        </Link>
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
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  agreementContainer: {
    marginBottom: 24,
  },
  agreementItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24, // Add this instead of gap
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  agreementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  agreementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkAccepted: {
    backgroundColor: '#4CAF50',
  },
  checkmarkText: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
  },
  checkmarkTextAccepted: {
    color: '#fff',
  },
  agreementDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  agreementButton: {
    backgroundColor: '#6366F1',
  },
  acceptedButton: {
    backgroundColor: '#4CAF50',
  },
  successContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  successText: {
    fontSize: 16,
    color: '#2E7D2E',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingTop: 12,
  },
  continueButton: {
    backgroundColor: '#6366F1',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});
