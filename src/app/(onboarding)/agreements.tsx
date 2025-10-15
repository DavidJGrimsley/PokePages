import { Stack, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { Button } from "components/UI/Button";
import { ShowAgreement } from 'components/Docs/ShowAgreement';
import { PayPal } from 'components/Paypal';
import { useOnboardingStore } from "~/store/onboardingStore";

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
    <View className="flex-1 bg-app-background p-lg">
      <Stack.Screen options={{ title: '' }} />
      <StatusBar style="auto" />
      
      <View className="flex-1 items-center justify-center py-xl">
        {/* <Image 
          source={require('@/assets/favicon.png')} 
          className="w-[40%] h-[40%] mb-lg shadow-app-large"
          resizeMode="contain"
        /> */}
        
        <Text className="typography-header text-app-text mb-md text-center">Legal Agreements</Text>
        
        <Text className="typography-subheader text-app-secondary mb-md text-center leading-6">
          Before we begin, please review and accept our terms
        </Text>
        
        <View className="w-full mb-xl">
          <View className="flex-row items-center mb-md px-lg">
            <Text className="typography-copy-bold text-app-primary flex-1">Terms of Service</Text>
            <Button
              title={hasAcceptedTerms ? "Accepted" : "Review & Accept"}
              onPress={() => setShowTermsModal(true)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: hasAcceptedTerms ? '#6366F1' : '#582a5a'
              }}
            />
          </View>

          <View className="flex-row items-center mb-md px-lg">
            <Text className="typography-copy-bold text-app-primary flex-1">Privacy Policy</Text>
            <Button
              title={hasAcceptedPrivacy ? "Accepted" : "Review & Accept"}
              onPress={() => setShowPrivacyModal(true)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: hasAcceptedPrivacy ? '#6366F1' : '#582a5a'
              }}
            />
          </View>
        </View>

        {canContinue && (
          <View className="bg-app-accent rounded-lg p-md items-center mt-sm">
            <Text className="typography-copy-bold text-app-text text-center">
              🎉 Great! You&apos;re all set to continue
            </Text>
          </View>
        )}
      </View>

      {/* Community Support Section */}
      <View className="bg-app-surface rounded-lg p-lg mb-lg border border-app-border">
        <Text className="typography-copy-bold text-app-primary text-center mb-sm">
          💙 Community Supported
        </Text>
        <Text className="typography-caption text-app-secondary text-center mb-md leading-5">
          Poké Pages is a passion project that runs entirely on community support. 
          Your donations help keep the servers running and the app free for everyone!
        </Text>
        <PayPal />
      </View>
      
      <View className="py-lg">
        <Button 
          title="Continue"
          disabled={!canContinue}
          onPress={() => {
            router.push('/final');
          }}
          style={{ 
            backgroundColor: !canContinue ? '#ccc' : '#582a5a'
          }}
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





