import { Stack, router } from 'expo-router';
import { View, Text, Image, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState, useCallback } from 'react';

import { Button } from 'components/UI/Button';
import { useOnboardingStore } from '~/store/onboardingStore';
import { useAuthStore } from '~/store/authStore';

import { PrettyText } from 'components/TextTheme/PrettyText';
export default function OnboardingFinalScreen() {
  const { completeOnboarding, hasCompletedOnboarding, returnUrl, setReturnUrl } = useOnboardingStore();
  const { isLoggedIn } = useAuthStore();
  const exploreBtnRef = useRef<View>(null); // ref to the Start Exploring button
  const signInButtonRef = useRef<View>(null); // ref to the Sign In button



  const handleCompleteOnboarding = useCallback(() => {
    // setConfettiVisible(false);
   
    completeOnboarding();
    // If there's a return URL, go there, otherwise go to drawer
    const destination = returnUrl || '/(drawer)';
    setReturnUrl(null); // Clear the return URL after using it
    router.replace(destination as any);
  }, [completeOnboarding, returnUrl, setReturnUrl]);

  const handleSignInCompleteOnboarding = useCallback(() => {
    // setConfettiVisible(false);
    completeOnboarding();
    router.replace('/sign-in' as any);
  }, [completeOnboarding]);


  return (
    <View className="flex-1 bg-app-background p-lg">
      <Stack.Screen options={{ title: '' }} />
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{ 
          flexGrow: 1, 
          alignItems: 'center', 
          justifyContent: 'space-around', 
          paddingVertical: 32, // xl spacing
          width: '100%' 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* <Image 
          source={require('@/assets/icon.png')} 
          className="w-[100px] h-[100px] mb-lg shadow-app-large"
          resizeMode="contain"
        /> */}
        {/* <PrettyText text="Poké Pages" /> */}
        <Text className="typography-header text-app-text text-center mb-sm">You&apos;re All Set!</Text>
        <Text className="typography-subheader text-app-secondary text-center mb-xl leading-tight">
          Welcome to the Poké Pages community, trainer!
          {'\n'}
          Here you will find all sorts of helpful tools for your Pokémon journey including: 
        </Text>
        <View className="w-full mb-xl">
          <View className="flex-row items-start mb-md px-lg">
            <Text className="typography-header mr-md w-8 text-center mt-0.5">🎯</Text>
            <Text className="flex-1 typography-copy text-app-primary leading-tight">
              <Text className="typography-copy-bold text-app-text">Raid Builds</Text>
              {'\n'}Access counter strategies for tough raids
            </Text>
          </View>
          
          <View className="flex-row items-start mb-md px-lg">
            <Text className="typography-header mr-md w-8 text-center mt-0.5">📊</Text>
            <Text className="flex-1 typography-copy text-app-primary leading-tight">
              <Text className="typography-copy-bold text-app-text">Event Counters</Text>
              {'\n'}Track community progress on special events
            </Text>
          </View>
          
          <View className="flex-row items-start mb-md px-lg">
            <Text className="typography-header mr-md w-8 text-center mt-0.5">📚</Text>
            <Text className="flex-1 typography-copy text-app-primary leading-tight">
              <Text className="typography-copy-bold text-app-text">Resources</Text>
              {'\n'}Find maps, guides, tips, and battle strategies
            </Text>
          </View>
          
          <View className="flex-row items-start mb-md px-lg">
            <Text className="typography-header mr-md w-8 text-center mt-0.5">🧠</Text>
            <Text className="flex-1 typography-copy text-app-primary leading-tight">
              <Text className="typography-copy-bold text-app-text">In the know</Text>
              {'\n'}Avoid FOMO by getting notified of events and promo codes
            </Text>
          </View>
        </View>
        
        {!isLoggedIn && (<View className="bg-app-accent rounded-xl p-md w-full mb-md">
          <Text className="typography-copy-bold text-app-primary mb-sm">💡 Tip</Text>
          <Text className="typography-copy text-app-primary leading-tight">
            Some features like social interactions will require creating an account, 
            but you can explore most of the app without signing up!
          </Text>
          
            <Button 
            ref={signInButtonRef}
            title="Sign In" 
            onPress={handleSignInCompleteOnboarding}
            />
        </View>)}
      </ScrollView>
      <View className="w-full items-center py-lg">
        <Button
          ref={exploreBtnRef}
          title="Start Exploring"
          onPress={handleCompleteOnboarding}
          style={{ backgroundColor: '#582a5a', width: '100%', borderRadius: 12, marginTop: 16 }}
        />
      </View>
    </View>
  );
}


