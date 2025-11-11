import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as socialApi from '~/utils/socialApi';
import type { Friend, FriendRequest } from '~/utils/socialApi';

interface FriendsListProps {
  userId: string;
  onFriendPress?: (friendId: string) => void;
}

export function FriendsList({ userId, onFriendPress }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsData, requestsData] = await Promise.all([
        socialApi.getFriends(userId),
        socialApi.getFriendRequests(userId),
      ]);
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await socialApi.acceptFriendRequest(requestId, userId);
      loadData(); // Refresh
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await socialApi.rejectFriendRequest(requestId, userId);
      loadData(); // Refresh
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleRemoveFriend = async (friendshipId: string, friendUsername: string, friendId: string) => {
    if (!userId || !friendId) return;

    // Web fallback since Alert.alert is a no-op in some web builds
    if (Platform.OS === 'web') {
      const ok = window.confirm(`Remove ${friendUsername || 'this user'} from your friends?`);
      if (!ok) return;
      try {
        await socialApi.unfriend(userId, friendId);
        loadData(); // Refresh
      } catch (error) {
        console.error('Error unfriending:', error);
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to unfriend');
      }
      return;
    }

    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friendUsername || 'this person'} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await socialApi.unfriend(userId, friendId);
              loadData(); // Refresh
            } catch (error) {
              console.error('Error unfriending:', error);
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to unfriend');
            }
          },
        },
      ]
    );
  };

  const handleSendMessage = async (friendId: string, friendUsername: string) => {
    if (!userId) return;
    try {
      // Send a lightweight starter message to create conversation
      const starter = await socialApi.sendMessage(userId, friendId, '👋');
      const conversationId = (starter as any).conversationId;
      if (conversationId) {
        router.push(`/social/conversations/${conversationId}` as any);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      onPress={() => router.navigate(`/(profile)/${item.friend?.username}` as any)}
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
        {/* Action Buttons */}
        <View className="flex-row items-center">
          {/* Message Button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // Prevent profile navigation
              handleSendMessage(item.friendId, item.friend?.username || 'Unknown');
            }}
            className="p-3 mr-2"
          >
            <Ionicons name="paper-plane" size={28} color="#3B82F6" />
          </TouchableOpacity>
          {/* Remove Friend Button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // Prevent profile navigation
              handleRemoveFriend(item.friendshipId, item.friend?.username || 'Unknown', item.friendId);
            }}
            className="p-3"
          >
            <Ionicons name="close-circle" size={32} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
  );

  const renderRequestItem = ({ item }: { item: FriendRequest }) => (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 shadow">
      <View className="flex-row items-center mb-3">
        {item.requester?.avatarUrl ? (
          <Image
            source={{ uri: item.requester.avatarUrl }}
            className="w-12 h-12 rounded-full bg-gray-200"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 items-center justify-center">
            <Ionicons name="person" size={24} color="white" />
          </View>
        )}
        
        <View className="flex-1 ml-3">
          <Text className="typography-label text-gray-900 dark:text-white font-semibold">
            {item.requester?.username || 'Unknown Trainer'}
          </Text>
          <Text className="typography-caption text-gray-500 dark:text-gray-400">
            Wants to be friends
          </Text>
        </View>
      </View>

      {item.message && (
        <Text className="typography-copy text-gray-700 dark:text-gray-300 mb-3 italic">
          &quot;{item.message}&quot;
        </Text>
      )}

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => handleAcceptRequest(item.id)}
          className="flex-1 bg-green-500 py-3 rounded-lg items-center"
        >
          <Text className="typography-label text-white font-semibold">Accept</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleRejectRequest(item.id)}
          className="flex-1 bg-red-500 py-3 rounded-lg items-center"
        >
          <Text className="typography-label text-white font-semibold">Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-8">
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Tabs */}
      <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-full p-1 mx-4 mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab('friends')}
          className={`flex-1 py-2 rounded-full items-center ${
            activeTab === 'friends' ? 'bg-amber-500' : 'bg-transparent'
          }`}
        >
          <Text
            className={`typography-label ${
              activeTab === 'friends' ? 'text-white font-semibold' : 'text-gray-600'
            }`}
          >
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('requests')}
          className={`flex-1 py-2 rounded-full items-center relative ${
            activeTab === 'requests' ? 'bg-amber-500' : 'bg-transparent'
          }`}
        >
          <Text
            className={`typography-label ${
              activeTab === 'requests' ? 'text-white font-semibold' : 'text-gray-600'
            }`}
          >
            Requests ({requests.length})
          </Text>
          {requests.length > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">{requests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'friends' ? (
        friends.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text className="typography-copy text-gray-500 mt-4 text-center">
              No friends yet. Start connecting with other trainers!
            </Text>
          </View>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.friendshipId}
            renderItem={renderFriendItem}
            contentContainerClassName="px-4"
          />
        )
      ) : requests.length === 0 ? (
        <View className="flex-1 justify-center items-center py-8">
          <Ionicons name="mail-outline" size={64} color="#9CA3AF" />
          <Text className="typography-copy text-gray-500 mt-4 text-center">
            No pending friend requests
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestItem}
          contentContainerClassName="px-4"
        />
      )}
    </View>
  );
}
