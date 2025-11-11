import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '~/store/authStore';
import * as socialApi from '~/utils/socialApi';
import type { Friend } from '~/utils/socialApi';

interface NewConversationModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NewConversationModal({ visible, onClose }: NewConversationModalProps) {
  const { user } = useAuthStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFriends = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const friendsData = await socialApi.getFriends(user.id);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (visible && user?.id) {
      loadFriends();
    }
  }, [visible, user?.id, loadFriends]);

  const handleSelectFriend = (friend: Friend) => {
    onClose();
    // Navigate to the friend's profile to start a conversation
    router.push(`/(profile)/${friend.friend?.username}`);
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      onPress={() => handleSelectFriend(item)}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 flex-row items-center shadow"
    >
      {item.friend?.avatarUrl ? (
        <Image
          source={{ uri: item.friend.avatarUrl }}
          className="w-12 h-12 rounded-full bg-gray-200"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 items-center justify-center">
          <Ionicons name="person" size={24} color="white" />
        </View>
      )}
      
      <View className="flex-1 ml-3">
        <Text className="typography-label text-gray-900 dark:text-white font-semibold">
          {item.friend?.username || 'Unknown Trainer'}
        </Text>
        {item.friend?.bio && (
          <Text className="typography-caption text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {item.friend.bio}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between">
            <Text className="typography-title text-gray-900 dark:text-white font-bold">
              New Conversation
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <Text className="typography-caption text-gray-500 mt-1">
            Select a friend to start a conversation
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 p-4">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#F59E0B" />
              <Text className="typography-copy text-gray-500 mt-4">Loading friends...</Text>
            </View>
          ) : friends.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="people-outline" size={64} color="#9CA3AF" />
              <Text className="typography-header text-gray-900 dark:text-white mt-4">
                No Friends Yet
              </Text>
              <Text className="typography-copy text-gray-500 mt-2 text-center">
                Add some friends first to start conversations with them
              </Text>
            </View>
          ) : (
            <FlatList
              data={friends}
              keyExtractor={(item) => item.friendshipId}
              renderItem={renderFriendItem}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}