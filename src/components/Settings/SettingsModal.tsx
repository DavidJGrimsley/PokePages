import React, { useState } from 'react';
import { View, Text, Modal } from 'react-native';
import { Button } from 'components/UI/Button';
import { BlockedUsersList } from '@/src/components/Social/BlockedUsersList';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  onSignOut: () => void;
}

export function SettingsModal({ visible, onClose, userId, onSignOut }: SettingsModalProps) {
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);

  const handleSignOut = () => {
    onClose();
    onSignOut();
  };

  return (
    <>
      {/* Settings Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
          {/* Modal Header */}
          <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center justify-between">
              <Text className="typography-title text-gray-900 dark:text-white font-bold">
                Settings
              </Text>
              <Button
                title="Done"
                onPress={onClose}
              />
            </View>
          </View>

          {/* Modal Content */}
          <View className="flex-1 p-4">
            <View className="space-y-4">
              {/* Privacy Section */}
              <View>
                <Text className="typography-label text-gray-900 dark:text-white font-semibold mb-3">
                  Privacy
                </Text>
                
                {/* Blocked Users Button */}
                <View className="bg-white dark:bg-gray-800 rounded-xl shadow mb-3">
                  <Button
                    title="Blocked Users"
                    onPress={() => {
                      onClose();
                      setShowBlockedUsers(true);
                    }}
                  />
                </View>
              </View>

              {/* Account Section */}
              <View>
                <Text className="typography-label text-gray-900 dark:text-white font-semibold mb-3">
                  Account
                </Text>
                
                {/* Sign Out Button */}
                <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                  <Button
                    title="Sign Out"
                    onPress={handleSignOut}
                    className="bg-red-500 hover:bg-red-600"
                  />
                </View>
              </View>

              {/* Future sections can be added here */}
              <View>
                <Text className="typography-caption text-gray-500 text-center mt-8">
                  More settings coming soon...
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Blocked Users Modal */}
      <Modal
        visible={showBlockedUsers}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBlockedUsers(false)}
      >
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
          {/* Modal Header */}
          <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center justify-between">
              <Text className="typography-title text-gray-900 dark:text-white font-bold">
                Blocked Users
              </Text>
              <Button
                title="Done"
                onPress={() => setShowBlockedUsers(false)}
              />
            </View>
          </View>

          {/* Blocked Users List */}
          <BlockedUsersList userId={userId} />
        </View>
      </Modal>
    </>
  );
}
