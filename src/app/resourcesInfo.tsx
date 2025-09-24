import { Stack, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View, Pressable, Linking } from 'react-native';
import { useState } from 'react';

import { ScreenContent } from 'components/UI/ScreenContent';
import { ShowAgreement } from 'components/Docs/ShowAgreement';
import { useAuthStore } from '~/store/authStore';
import { useOnboardingStore } from '~/store/onboardingStore';

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
        <View className="p-lg gap-6">
          <Text className="text-base text-app-text text-center mb-sm">
            Hello fellow trainers, I appreciate you using my app! This is and always will be free to use and free from ads. Consider it my gift to the community. If you&apos;d like to support then please follow my social media pages or view my portfolio website for more of my work and contact info. Go catch &apos;em all!
          </Text>
          
          <Text className="text-lg font-semibold text-app-text text-center mb-sm">Follow me on:</Text>
          
          <View className="flex-row flex-wrap justify-center gap-3">
            <Pressable 
              className="py-3 px-5 rounded-3xl min-w-[120px] items-center shadow-app-small bg-[#1DA1F2]"
              onPress={() => handleLinkPress('https://twitter.com/MrDJ2U26')}
            >
              <Text className="text-white text-base font-semibold">🐦 Twitter</Text>
            </Pressable>
            
            <Pressable 
              className="py-3 px-5 rounded-3xl min-w-[120px] items-center shadow-app-small bg-[#E4405F]"
              onPress={() => handleLinkPress('https://instagram.com/OfficialMrDJ')}
            >
              <Text className="text-white text-base font-semibold">📸 Instagram</Text>
            </Pressable>
            
            <Pressable 
              className="py-3 px-5 rounded-3xl min-w-[120px] items-center shadow-app-small bg-[#FF0000]"
              onPress={() => handleLinkPress('https://youtube.com/@MrDJsArcade')}
            >
              <Text className="text-white text-base font-semibold">🎥 YouTube</Text>
            </Pressable>
          </View>
          
          <Pressable 
            className="bg-app-accent py-4 px-6 rounded-xl items-center shadow-app-large mt-sm"
            onPress={() => handleLinkPress('https://www.DavidJGrimsley.com')}
          >
            <Text className="text-white text-lg font-bold mb-1">🌐 Visit My Portfolio</Text>
            <Text className="text-app-secondary text-sm font-medium">www.DavidJGrimsley.com</Text>
          </Pressable>
          
          <View className="flex-row justify-between gap-3 mt-sm">
            <Pressable 
              className="flex-1 bg-app-secondary py-3 px-4 rounded-lg items-center shadow-app-small"
              onPress={() => openAgreement('termsOfService')}
            >
              <Text className="text-white text-sm font-semibold text-center">📄 Terms of Service</Text>
            </Pressable>
            
            <Pressable 
              className="flex-1 bg-app-secondary py-3 px-4 rounded-lg items-center shadow-app-small"
              onPress={() => openAgreement('privacyPolicy')}
            >
              <Text className="text-white text-sm font-semibold text-center">🔒 Privacy Policy</Text>
            </Pressable>
          </View>
          
          {/* Development Helper */}
          <Pressable 
            className="bg-red-500 py-2.5 px-4 rounded-md items-center mt-3"
            onPress={resetOnboarding}
          >
            <Text className="text-white text-xs font-medium">🔄 Reset Onboarding (Dev)</Text>
          </Pressable>

          <Link href="/sign-in" asChild push>
            <Pressable className="bg-red-500 py-2.5 px-4 rounded-md items-center">
              <Text className="text-white text-xs font-medium">🔄 Create Account or Sign up(Dev-supabase)</Text>
            </Pressable>
          </Link>

          <Pressable 
            onPress={logIn}
            className="bg-red-500 py-2.5 px-4 rounded-md items-center"
          >
            <Text className="text-white text-xs font-medium">🔄 Log In (Dev)</Text>
          </Pressable>
        
          <Pressable 
            onPress={logOut}
            className="bg-red-500 py-2.5 px-4 rounded-md items-center"
          >
            <Text className="text-white text-xs font-medium">🔄 Log Out (Dev)</Text>
          </Pressable>
          
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


