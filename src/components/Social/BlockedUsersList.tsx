import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as socialApi from '~/utils/socialApi';

interface BlockedUser {
  id: string;
  blockedId: string;
  blocked?: {
    id: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
  };
}

interface BlockedUsersListProps {
  userId: string;
}

export function BlockedUsersList({ userId }: BlockedUsersListProps) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlockedUsers = async () => {
      try {
        setLoading(true);
        const data = await socialApi.getBlockedUsers(userId);
        setBlockedUsers(data);
      } catch (error) {
        console.error('Error loading blocked users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlockedUsers();
  }, [userId]);

  const loadBlockedUsersData = async () => {
    try {
      const data = await socialApi.getBlockedUsers(userId);
      setBlockedUsers(data);
    } catch (error) {
      console.error('Error loading blocked users:', error);
    }
  };

  const handleUnblock = async (blockedId: string, username: string) => {
    const confirmUnblock = () => {
      socialApi.unblockUser(userId, blockedId)
        .then(() => {
          loadBlockedUsersData();
        })
        .catch((error) => {
          console.error('Error unblocking user:', error);
          if (Platform.OS === 'web') {
            window.alert('Failed to unblock user. Please try again.');
          } else {
            Alert.alert('Error', 'Failed to unblock user. Please try again.');
          }
        });
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Unblock ${username}?`)) {
        confirmUnblock();
      }
    } else {
      Alert.alert(
        'Unblock User',
        `Are you sure you want to unblock ${username}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Unblock', onPress: confirmUnblock, style: 'destructive' },
        ]
      );
    }
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 flex-row items-center shadow">
      {item.blocked?.avatarUrl ? (
        <Image
          source={{ uri: item.blocked.avatarUrl }}
          className="w-12 h-12 rounded-full bg-gray-200"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 items-center justify-center">
          <Ionicons name="person" size={24} color="white" />
        </View>
      )}
    
      <View className="flex-1 ml-3">
        <Text className="typography-label text-gray-900 dark:text-white font-semibold">
          {item.blocked?.username || 'Unknown User'}
        </Text>
        {item.blocked?.bio && (
          <Text className="typography-caption text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {item.blocked.bio}
          </Text>
        )}
      </View>

      {/* Unblock Button */}
      <TouchableOpacity
        onPress={() => handleUnblock(item.blockedId, item.blocked?.username || 'this user')}
        className="bg-blue-500 px-4 py-2 rounded-lg"
      >
        <Text className="typography-label text-white font-semibold">
          Unblock
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (blockedUsers.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        <Text className="typography-title text-gray-900 dark:text-white font-semibold mt-4 text-center">
          No Blocked Users
        </Text>
        <Text className="typography-body text-gray-500 dark:text-gray-400 mt-2 text-center">
          You haven&apos;t blocked anyone yet.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={blockedUsers}
        renderItem={renderBlockedUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}
