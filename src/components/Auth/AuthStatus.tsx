import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuthStore } from '~/store/authStore';
import { router } from 'expo-router';

export default function AuthStatus() {
  const { user, isLoggedIn, profile, signOut } = useAuthStore();

  if (!isLoggedIn || !user) {
    return (
      <View className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg m-4">
        <Text className="text-yellow-800 font-bold mb-2">Not Logged In</Text>
        <Button title="Go to Sign In" onPress={() => router.push('/oAuth')} />
      </View>
    );
  }

  return (
    <View className="p-4 bg-green-100 border border-green-300 rounded-lg m-4">
      <Text className="text-green-800 font-bold mb-2">✅ Logged In!</Text>
      <Text className="text-green-700 mb-1">Email: {user.email}</Text>
      <Text className="text-green-700 mb-1">User ID: {user.id}</Text>
      {profile?.username && (
        <Text className="text-green-700 mb-1">Username: {profile.username}</Text>
      )}
      <View className="mt-3">
        <Button title="Sign Out" onPress={signOut} />
      </View>
    </View>
  );
}
