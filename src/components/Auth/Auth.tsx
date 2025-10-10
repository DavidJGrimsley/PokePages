import React, { useEffect, useState } from "react";
import { Button, View, Text, Alert, Platform } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "~/utils/supabaseClient";
import { router } from "expo-router";
import { debugLinking } from "~/utils/linkingConfig";

// Required for web only
WebBrowser.maybeCompleteAuthSession();

// Create redirect URI using your custom scheme
const redirectTo = makeRedirectUri({
  scheme: "pokepages",
  path: "/auth/callback",
});

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
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) throw new Error(errorCode);
    const { access_token, refresh_token } = params;

    if (!access_token) return;

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    
    if (error) throw error;
    
    showAlert("Success", "Successfully signed in!");
    
    // Redirect to main app after successful authentication
    router.replace("/(drawer)");
    
    return data.session;
  } catch (error) {
    console.error("Error creating session from URL:", error);
    showAlert("Authentication Error", error instanceof Error ? error.message : "Failed to authenticate");
  }
};

const performOAuth = async (provider: 'github' | 'google' | 'discord') => {
  try {
    console.log(`Starting ${provider} OAuth with redirect URI:`, redirectTo);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
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
      redirectTo
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

export default function Auth() {
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