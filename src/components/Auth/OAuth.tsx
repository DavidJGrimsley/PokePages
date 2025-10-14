import React, { useEffect, useState } from "react";
import { Button, View, Text, Alert, Platform, NativeModules } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from "~/utils/supabaseClient";
import { router } from "expo-router";
import { debugLinking } from "~/utils/linkingConfig";

// Required for web only
WebBrowser.maybeCompleteAuthSession();

// Google Web Client ID (from your Google Cloud Console)
// This is the Web client ID, not iOS or Android
const GOOGLE_WEB_CLIENT_ID = "970928478495-o8j6evk7kp0hfaqvlucr01r3ahm94m46.apps.googleusercontent.com";

// Configure Google Sign-In for native
const hasNativeGoogleSignin =
  Platform.OS !== 'web' && !!(NativeModules as any).RNGoogleSignin;

if (hasNativeGoogleSignin) {
  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: "970928478495-55ufo85eolgh0f43p4j88b7cpjdkvvk7.apps.googleusercontent.com", // Your iOS client ID
    offlineAccess: true, // To get refresh token
    forceCodeForRefreshToken: true, // Force refresh token for better session management
  });
  console.log('🔧 GoogleSignin configured with webClientId:', GOOGLE_WEB_CLIENT_ID);
} else {
  console.log('ℹ️ RNGoogleSignin native module not available; will use browser OAuth.');
}

// Create redirect URI - different for web vs native
const getRedirectUri = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  return makeRedirectUri({
    scheme: "pokepages",
    path: "/auth/callback",
  });
};

const redirectTo = getRedirectUri();

// Cross-platform alert function
const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};

const createSessionFromUrl = async (url: string) => {
  try {
    console.log("📥 Creating session from URL:", url);
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) throw new Error(errorCode);
    const { access_token, refresh_token } = params;

    if (!access_token) {
      console.log("⚠️ No access token in URL");
      return;
    }

    console.log("🔐 Setting session with tokens...");
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    
    if (error) throw error;
    
    console.log("✅ Session set successfully:", data.session?.user?.email);
    showAlert("Success", "Successfully signed in!");
    
    // Wait a moment for the auth state to propagate
    setTimeout(() => {
      console.log("🏠 Redirecting to home...");
      router.replace("/(drawer)");
    }, 500);
    
    return data.session;
  } catch (error) {
    console.error("❌ Error creating session from URL:", error);
    showAlert("Authentication Error", error instanceof Error ? error.message : "Failed to authenticate");
  }
};

const performOAuth = async (provider: 'github' | 'google' | 'discord') => {
  try {
    console.log(`Starting ${provider} OAuth`);
    
    // Use native Google Sign-In for Google on native platforms
    if (provider === 'google' && hasNativeGoogleSignin) {
      return await performNativeGoogleSignIn();
    }
    
    // For web or other providers, use browser OAuth
    const redirectUri = getRedirectUri();
    console.log(`Using redirect URI:`, redirectUri);
    
    // For web, use simple redirect (no WebBrowser needed)
    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUri,
        },
      });
      
      if (error) throw error;
      // On web, this will redirect the page automatically
      return;
    }
    
    // For native (iOS/Android) - other providers use WebBrowser
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });
    
    if (error) throw error;

    if (!data?.url) {
      throw new Error("No OAuth URL returned from Supabase");
    }

    console.log("Opening OAuth URL:", data.url);

    const res = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUri
    );

    if (res.type === "success" && res.url) {
      await createSessionFromUrl(res.url);
    } else if (res.type === "cancel") {
      showAlert("Authentication Cancelled", "You cancelled the authentication process.");
    } else {
      showAlert("Authentication Failed", "Something went wrong during authentication.");
    }
  } catch (error) {
    console.error(`${provider} OAuth error:`, error);
    showAlert("OAuth Error", error instanceof Error ? error.message : `Failed to sign in with ${provider}`);
  }
};

// Native Google Sign-In implementation
const performNativeGoogleSignIn = async () => {
  try {
    console.log("🔐 Starting native Google Sign-In...");
    
    // Check if Google Play Services are available (Android)
    if (!hasNativeGoogleSignin) {
      throw new Error('RNGoogleSignin native module not available');
    }
    await GoogleSignin.hasPlayServices();
    
    // Sign in with Google
    const response = await GoogleSignin.signIn();
    console.log("✅ Google Sign-In successful:", response.data?.user.email);
    
    // Get the ID token
    const idToken = response.data?.idToken;
    
    if (!idToken) {
      throw new Error("No ID token received from Google Sign-In");
    }
    
    console.log("🔑 Got ID token, signing in with Supabase...");
    
    // Sign in to Supabase with the Google ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    
    if (error) throw error;
    
    console.log("🎉 Supabase session created:", data.user?.email);
    showAlert("Success", "Successfully signed in with Google!");
    
    // Wait a moment for the auth state to propagate
    setTimeout(() => {
      console.log("🏠 Redirecting to home...");
      router.replace("/(drawer)");
    }, 500);
    
  } catch (error: any) {
    console.error("❌ Native Google Sign-In error:", error);
    
    if (error.code === 'SIGN_IN_CANCELLED') {
      showAlert("Sign-In Cancelled", "You cancelled the Google sign-in process.");
    } else if (error.code === 'IN_PROGRESS') {
      showAlert("Sign-In In Progress", "A sign-in is already in progress.");
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      showAlert("Google Play Services Required", "Google Play Services are not available on this device.");
    } else {
      showAlert("Google Sign-In Error", error.message || "Failed to sign in with Google");
    }
  }
};

const sendMagicLink = async (email: string) => {
  try {
    if (!email.trim()) {
      showAlert("Email Required", "Please enter a valid email address.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) throw error;
    
    showAlert("Magic Link Sent", `Check your email (${email}) for the magic link!`);
  } catch (error) {
    console.error("Magic link error:", error);
    showAlert("Magic Link Error", error instanceof Error ? error.message : "Failed to send magic link");
  }
};

export default function OAuth() {
  const [debugInfo, setDebugInfo] = useState(false);
  
  // Handle linking into app from email app or OAuth redirect
  const url = Linking.useURL();
  
  useEffect(() => {
    if (url) {
      console.log("Received deep link:", url);
      createSessionFromUrl(url);
    }
  }, [url]);
  
  const showDebugInfo = () => {
  const info = debugLinking(url ?? undefined);
    setDebugInfo(!debugInfo);
    console.log("Debug info toggled", info);
  };

  return (
    <View className="flex-1 justify-center p-6 bg-app-background">
      <Text className="text-2xl font-bold text-center mb-8 text-gray-800">
        Choose Sign In Method
      </Text>
      
      <View className="space-y-4">
        {/* OAuth Providers */}
        <View className="mb-4">
          <Button 
            onPress={() => performOAuth('github')} 
            title="Sign in with GitHub" 
          />
        </View>
        
        <View className="mb-4">
          <Button 
            onPress={() => performOAuth('google')} 
            title="Sign in with Google" 
          />
        </View>
        
        <View className="mb-4">
          <Button 
            onPress={() => performOAuth('discord')} 
            title="Sign in with Discord" 
          />
        </View>

        {/* Magic Link - for demo purposes, using a placeholder email */}
        {/* In a real app, you'd want an input field for the email */}
        <View className="mt-8 pt-4 border-t border-gray-300">
          <Text className="text-center text-gray-600 mb-4">
            Or use magic link (demo)
          </Text>
          <Button 
            onPress={() => sendMagicLink("valid.email@supabase.io")} 
            title="Send Magic Link to Demo Email" 
          />
        </View>
        
        {/* Navigation to traditional auth */}
        <View className="mt-8 pt-4 border-t border-gray-300">
          <Text className="text-center text-gray-600 mb-4">
            Prefer email and password?
          </Text>
          <View className="flex-row justify-around">
            <Button 
              onPress={() => router.push('/sign-in')} 
              title="Sign In" 
            />
            <Button 
              onPress={() => router.push('/sign-up')} 
              title="Sign Up" 
            />
          </View>
        </View>
      </View>
      
      <View className="mt-8 pt-4 border-t border-gray-300">
        <Button 
          onPress={showDebugInfo} 
          title={debugInfo ? "Hide Debug Info" : "Show Debug Info"} 
        />
      </View>
      
      {debugInfo && (
        <View className="mt-4 p-3 bg-gray-100 rounded">
          <Text className="text-xs text-gray-700 font-mono">
            Redirect URI: {redirectTo}
          </Text>
          <Text className="text-xs text-gray-700 font-mono mt-2">
            Scheme: pokepages://
          </Text>
          <Text className="text-xs text-gray-700 font-mono mt-2">
            Current URL: {url || 'none'}
          </Text>
        </View>
      )}
    </View>
  );
}