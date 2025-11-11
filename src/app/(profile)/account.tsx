import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View, Modal } from 'react-native';
import { Redirect, router } from 'expo-router';

import { useAuthStore } from '~/store/authStore';
import { ScreenContent } from 'components/UI/ScreenContent';
import EditProfile from 'components/Auth/EditProfile';
import { Button } from 'components/UI/Button';
import { FriendsList } from '@/src/components/Social/FriendsList';
import { SettingsModal } from '@/src/components/Settings/SettingsModal';
import { useState } from 'react';



export default function EditProfileScreen() {
  const { user, session, isLoggedIn, signOut } = useAuthStore();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // If absolutely no user object, redirect. Allow session to be null on initial load.
  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  const canEditProfile = !!session; // EditProfile requires a non-null session prop.

  return (
    <>
      <ScreenContent path="app/modal.tsx" title="Account">
        <View className="flex-row justify-end mb-md space-x-2">
          <Button
            title="Preview Profile"
            onPress={() => router.push({ pathname: '/(profile)/preview', params: { from: 'account' } })}
          />
          <Button
            title="Edit Profile"
            onPress={() => canEditProfile && setShowEditProfile(true)}
            disabled={!canEditProfile}
          />
          <Button
            title="Settings"
            onPress={() => setShowSettings(true)}
          />
        </View>
        <View className="flex-1 w-full px-4">
          <View className="flex-1 w-full max-w-4xl mx-auto">
            {isLoggedIn && !session && (
              <Text className="typography-caption text-gray-500 text-center mb-3">Session not yet restored; some features are temporarily disabled.</Text>
            )}
            <FriendsList userId={user.id} />
          </View>
        </View>
      </ScreenContent>

      {/* Edit Profile Modal */}
      {/* Edit Profile Modal - only render if we have a session */}
      {canEditProfile && (
        <Modal
          visible={showEditProfile}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowEditProfile(false)}
        >
          <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center justify-between">
                <Text className="typography-title text-gray-900 dark:text-white font-bold">Edit Profile</Text>
                <Button title="Done" onPress={() => setShowEditProfile(false)} />
              </View>
            </View>
            <View className="flex-1 p-4">
              <EditProfile session={session} />
            </View>
          </View>
        </Modal>
      )}

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        userId={user.id}
        onSignOut={signOut}
      />

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
