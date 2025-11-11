import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as sharing from '~/utils/sharing';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
  url?: string;
  title?: string;
}

export function ShareModal({ visible, onClose, message, url, title }: ShareModalProps) {
  const shareOptions: sharing.ShareOptions = { message, url, title };

  const handleShare = async (method: sharing.ShareMethod) => {
    try {
      await sharing.shareWith(method, shareOptions);
      onClose();
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const shareButtons: { method: sharing.ShareMethod; icon: keyof typeof Ionicons.glyphMap; label: string; color: string }[] = [
    { method: 'twitter', icon: 'logo-twitter', label: 'Twitter', color: '#1DA1F2' },
    { method: 'facebook', icon: 'logo-facebook', label: 'Facebook', color: '#4267B2' },
    { method: 'whatsapp', icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366' },
    { method: 'sms', icon: 'chatbubble-ellipses', label: 'SMS', color: '#34C759' },
    { method: 'generic', icon: 'share-social', label: 'More', color: '#F59E0B' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50 justify-end"
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 border-t-4 border-amber-500"
        >
          <View className="flex-row items-center justify-between mb-6">
            <Text className="typography-header text-gray-900 dark:text-white">
              Share Post
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-around">
            {shareButtons.map((button) => (
              <TouchableOpacity
                key={button.method}
                onPress={() => handleShare(button.method)}
                className="items-center m-3 min-w-[70px]"
              >
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: button.color }}
                >
                  <Ionicons name={button.icon} size={28} color="white" />
                </View>
                <Text className="typography-caption text-gray-700 dark:text-gray-300 text-center">
                  {button.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
