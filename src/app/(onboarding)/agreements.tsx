import { Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { Button } from "~/components/Button";
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
        <Image 
          source={require('@/assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
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
              style={[styles.agreementButton, hasAcceptedTerms && styles.acceptedButton]}
            />
          </View>

          <View style={styles.agreementItem}>
            <Text style={styles.agreementText}>Privacy Policy</Text>
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
      
      <View style={styles.footer}>
        <Button 
          title="Continue"
          disabled={!canContinue}
          onPress={() => {
            console.log('Navigating to final Screen');
            router.push('/final');
          }}
          style={[styles.continueButton, !canContinue && styles.disabledButton]}
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
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  agreementContainer: {
    width: '100%',
    marginBottom: 32,
  },
  agreementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  agreementEmoji: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  agreementText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
    fontWeight: '500',
  },
  agreementButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#007bff',
    color: '#fff',
  },
  acceptedButton: {
    backgroundColor: '#28a745',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
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
    paddingVertical: 20,
  },
    continueButton: {
    backgroundColor: '#6366F1',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});
