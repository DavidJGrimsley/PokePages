import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '~/store/authStore';

export default function AuthCallback() {
  const [hasRedirected, setHasRedirected] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    console.log('🔍 OAuth callback page loaded');
    console.log('📊 Current auth state - isLoggedIn:', isLoggedIn, 'user:', user?.email);
    
    // Don't redirect immediately - wait for Supabase to process the URL hash
    // The global onAuthStateChange listener in authStore will update the state
    
    const checkTimer = setTimeout(() => {
      const currentIsLoggedIn = useAuthStore.getState().isLoggedIn;
      const currentUser = useAuthStore.getState().user;
      
      console.log('✅ Checking auth after 2s delay - isLoggedIn:', currentIsLoggedIn, 'user:', currentUser?.email);
      
      if (currentIsLoggedIn && currentUser && !hasRedirected) {
        console.log('🎉 User authenticated! Checking onboarding status...');
        setHasRedirected(true);
        // Let _layout handle onboarding flow, just redirect to drawer
        router.replace('/(drawer)');
      } else if (!hasRedirected) {
        console.log('⚠️ No authentication detected, trying one more time...');
        // One more check after longer delay
        setTimeout(() => {
          const finalIsLoggedIn = useAuthStore.getState().isLoggedIn;
          const finalUser = useAuthStore.getState().user;
          
          if (finalIsLoggedIn && finalUser && !hasRedirected) {
            console.log('🎉 Authenticated on retry! Redirecting...');
            setHasRedirected(true);
            router.replace('/(drawer)');
          } else if (!hasRedirected) {
            console.log('❌ Still not authenticated, redirecting to sign-in...');
            setHasRedirected(true);
            router.replace('/sign-in');
          }
        }, 3000);
      }
    }, 2000);

    return () => {
      clearTimeout(checkTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View className="flex-1 justify-center items-center bg-app-background">
      <ActivityIndicator size="large" />
      <Text className="text-lg text-gray-600 mt-4">Processing authentication...</Text>
      <Text className="text-sm text-gray-500 mt-2">Waiting for session...</Text>
    </View>
  );
}
