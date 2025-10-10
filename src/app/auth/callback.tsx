import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '~/utils/supabaseClient';
import { useAuthStore } from '~/store/authStore';

export default function AuthCallback() {
  const params = useLocalSearchParams();
  const { setSession, setUser } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = typeof params === 'string' ? params : JSON.stringify(params);
        console.log('Auth callback received params:', urlParams);

        // Check for error
        if (params.error) {
          console.error('OAuth error:', params.error, params.error_description);
          router.replace('/sign-in');
          return;
        }

        // Check for access token
        if (params.access_token && params.refresh_token) {
          console.log('Setting session with tokens from callback');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: params.access_token as string,
            refresh_token: params.refresh_token as string,
          });

          if (error) {
            console.error('Error setting session:', error);
            router.replace('/sign-in');
            return;
          }

          if (data.session && data.user) {
            setSession(data.session);
            setUser(data.user);
            console.log('Successfully authenticated user:', data.user.email);
            
            // Redirect to main app
            router.replace('/(drawer)');
            return;
          }
        }

        // If we get here, something went wrong
        console.log('No valid auth data received, redirecting to sign-in');
        router.replace('/sign-in');
        
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/sign-in');
      }
    };

    handleAuthCallback();
  }, [params, setSession, setUser]);

  return (
    <View className="flex-1 justify-center items-center bg-app-background">
      <Text className="text-lg text-gray-600">Processing authentication...</Text>
    </View>
  );
}