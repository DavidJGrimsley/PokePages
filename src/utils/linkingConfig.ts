import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';

export const linkingConfig = {
  prefixes: [
    'pokepages://',
    // Add your production URLs here when you have them
    // 'https://yourapp.com',
    // 'https://*.yourapp.com'
  ],
};

export const debugLinking = (currentUrl?: string) => {
  const redirectUri = makeRedirectUri({
    scheme: 'pokepages',
    path: '/auth/callback',
  });
  
  const nativeRedirectUri = makeRedirectUri({
    scheme: 'pokepages',
    path: '/auth/callback',
    isTripleSlashed: true, // For some OAuth providers
  });
  
  console.log('=== Deep Linking Debug Info ===');
  console.log('App scheme: pokepages://');
  console.log('Standard redirect URI:', redirectUri);
  console.log('Native redirect URI:', nativeRedirectUri);
  console.log('Current URL:', currentUrl ?? 'none');

  // Note: Linking.canOpenURL() is async; callers should invoke it if they need a runtime check.
  // Example: await Linking.canOpenURL('pokepages://test')
  
  return {
    redirectUri,
    nativeRedirectUri,
    scheme: 'pokepages',
  };
};

// Test deep link function
export const testDeepLink = async () => {
  try {
    const testUrl = 'pokepages://auth/callback?test=true';
    const canOpen = await Linking.canOpenURL(testUrl);
    console.log('Can open test URL:', canOpen);
    
    if (canOpen) {
      await Linking.openURL(testUrl);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Deep link test failed:', error);
    return false;
  }
};

// Parse URL parameters helper
export const parseUrlParams = (url: string) => {
  try {
    const parsed = Linking.parse(url);
    console.log('Parsed URL:', {
      scheme: parsed.scheme,
      hostname: parsed.hostname,
      path: parsed.path,
      queryParams: parsed.queryParams,
    });
    return parsed;
  } catch (error) {
    console.error('Failed to parse URL:', error);
    return null;
  }
};