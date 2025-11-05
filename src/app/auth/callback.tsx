import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '~/utils/supabaseClient';
import { useOnboardingStore } from '~/store/onboardingStore';

export default function AuthCallback() {
  const { hasCompletedOnboarding } = useOnboardingStore();

  useEffect(() => {
    console.log('🔍 OAuth callback page loaded, waiting for auth state change...');
    
    // Listen for auth state change instead of manually checking
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('🎉 User signed in via OAuth:', session.user.email);
        // Give a moment for state to propagate
        setTimeout(() => {
          console.log('🏠 Checking onboarding status before redirect...');
          // If onboarding is not complete, the _layout will handle showing it
          // Otherwise, redirect to home
          if (hasCompletedOnboarding) {
            console.log('✅ Onboarding complete, redirecting to home...');
            router.replace('/(drawer)');
          } else {
            console.log('⏳ Onboarding not complete, will be shown by _layout...');
            // On web, the _layout automatically shows onboarding for logged-in users
            // The returnUrl will be used after onboarding completes
            router.replace('/(drawer)');
          }
        }, 500);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed, redirecting to home...');
        router.replace('/(drawer)');
      }
    });

    // Fallback timeout if no auth event fires within 10 seconds
    const fallbackTimeout = setTimeout(() => {
      console.log('⏰ Fallback timeout reached, redirecting to home anyway...');
      router.replace('/(drawer)');
    }, 10000);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, [hasCompletedOnboarding]);

  return (
    <View className="flex-1 justify-center items-center bg-app-background">
      <ActivityIndicator size="large" />
      <Text className="text-lg text-gray-600 mt-4">Processing authentication...</Text>
    </View>
  );
}
