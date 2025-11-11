import React, { useState, useEffect, useCallback } from 'react';
import { Stack, router } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from 'components/UI/Container';
import { useAuthStore } from '~/store/authStore';
import * as socialApi from '~/utils/socialApi';
import { formatDistanceToNow } from 'date-fns';
import { NewConversationModal } from '~/components/Social/NewConversationModal';
import { Footer } from '@/src/components/Meta/Footer';

type TabType = 'conversations' | 'alerts';

export default function MessagesTab() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('conversations');
  const [conversations, setConversations] = useState<socialApi.Conversation[]>([]);
  const [friendRequests, setFriendRequests] = useState<socialApi.FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  const loadConversations = useCallback(async (refresh = false) => {
    if (!user?.id) return;

    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const convos = await socialApi.getRecentConversations(user.id);
      setConversations(convos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const loadFriendRequests = useCallback(async (refresh = false) => {
    if (!user?.id) return;

    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const requests = await socialApi.getFriendRequests(user.id);
      setFriendRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friend requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'conversations') {
      loadConversations();
    } else {
      loadFriendRequests();
    }
  }, [activeTab, loadConversations, loadFriendRequests]);

  const handleAcceptRequest = async (requestId: string) => {
    if (!user?.id) return;
    try {
      await socialApi.acceptFriendRequest(requestId, user.id);
      setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    if (!user?.id) return;
    try {
      await socialApi.rejectFriendRequest(requestId, user.id);
      setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      console.error('Failed to decline friend request:', err);
    }
  };

  const handleConversationPress = (conversation: socialApi.Conversation) => {
    if (conversation.conversationId) {
      router.push(`/social/conversations/${conversation.conversationId}`);
    }
  };

  if (!user?.id) {
    return (
      <>
        <Stack.Screen options={{ title: 'Messages' }} />
        <Container>
          <View className="flex-1 justify-center items-center p-4">
            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
            <Text className="typography-copy text-gray-500 mt-4 text-center">
              Please sign in to view your messages
            </Text>
          </View>
          <Footer />
        </Container>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Messages' }} />
      <Container>
        {/* Tab Toggle */}
        <View className="flex-row border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <TouchableOpacity
            onPress={() => setActiveTab('conversations')}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === 'conversations'
                ? 'border-amber-500'
                : 'border-transparent'
            }`}
          >
            <Text
              className={`typography-label font-semibold ${
                activeTab === 'conversations'
                  ? 'text-amber-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Conversations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('alerts')}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === 'alerts'
                ? 'border-amber-500'
                : 'border-transparent'
            }`}
          >
            <Text
              className={`typography-label font-semibold ${
                activeTab === 'alerts'
                  ? 'text-amber-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Alerts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center p-4">
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
            <Text className="typography-copy text-red-500 mt-4 text-center">{error}</Text>
            <TouchableOpacity
              onPress={() => activeTab === 'conversations' ? loadConversations() : loadFriendRequests()}
              className="mt-4 bg-amber-500 px-6 py-3 rounded-full"
            >
              <Text className="typography-label text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === 'conversations' ? (
          conversations.length === 0 ? (
            <View className="flex-1 justify-center items-center p-4">
              <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
              <Text className="typography-header text-gray-900 dark:text-white mt-4">
                No Messages Yet
              </Text>
              <Text className="typography-copy text-gray-500 mt-2 text-center">
                Start a conversation by sending a friend request or visiting a user&apos;s profile
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.conversationId || item.lastMessageId}
              contentContainerClassName="p-4"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => loadConversations(true)}
                  tintColor="#F59E0B"
                />
              }
              renderItem={({ item }) => {
                const timeAgo = formatDistanceToNow(new Date(item.lastMessageTime), {
                  addSuffix: true,
                });

                return (
                  <TouchableOpacity
                    onPress={() => handleConversationPress(item)}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-md border border-gray-100 dark:border-gray-700 flex-row items-center"
                  >
                    {/* Avatar */}
                    {item.otherUser?.avatarUrl ? (
                      <Image
                        source={{ uri: item.otherUser.avatarUrl }}
                        className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700"
                      />
                    ) : (
                      <View className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 items-center justify-center">
                        <Ionicons name="person" size={28} color="white" />
                      </View>
                    )}

                    {/* Message Info */}
                    <View className="flex-1 ml-4">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="typography-label text-gray-900 dark:text-white font-semibold">
                          {item.otherUser?.username || 'Unknown User'}
                        </Text>
                        <Text className="typography-caption text-gray-400">{timeAgo}</Text>
                      </View>
                      <Text
                        className={`typography-copy ${
                          item.unreadCount > 0
                            ? 'text-gray-900 dark:text-white font-semibold'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                        numberOfLines={1}
                      >
                        {item.lastMessageContent}
                      </Text>
                    </View>

                    {/* Unread Badge */}
                    {item.unreadCount > 0 && (
                      <View className="bg-amber-500 rounded-full w-6 h-6 items-center justify-center ml-2">
                        <Text className="typography-caption text-white font-bold text-xs">
                          {item.unreadCount > 9 ? '9+' : item.unreadCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )
        ) : (
          /* Alerts Tab - Friend Requests */
          friendRequests.length === 0 ? (
            <View className="flex-1 justify-center items-center p-4">
              <Ionicons name="people-outline" size={64} color="#9CA3AF" />
              <Text className="typography-header text-gray-900 dark:text-white mt-4">
                No Friend Requests
              </Text>
              <Text className="typography-copy text-gray-500 mt-2 text-center">
                You&apos;re all caught up! New friend requests will appear here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={friendRequests}
              keyExtractor={(item) => item.id}
              contentContainerClassName="p-4"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => loadFriendRequests(true)}
                  tintColor="#F59E0B"
                />
              }
              renderItem={({ item }) => {
                const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                });

                return (
                  <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-md border border-gray-100 dark:border-gray-700">
                    <View className="flex-row items-center mb-3">
                      {/* Avatar */}
                      {item.requester?.avatarUrl ? (
                        <Image
                          source={{ uri: item.requester.avatarUrl }}
                          className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"
                        />
                      ) : (
                        <View className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 items-center justify-center">
                          <Ionicons name="person" size={24} color="white" />
                        </View>
                      )}

                      {/* User Info */}
                      <View className="flex-1 ml-3">
                        <Text className="typography-label text-gray-900 dark:text-white font-semibold">
                          {item.requester?.username || 'Unknown User'}
                        </Text>
                        <Text className="typography-caption text-gray-500">{timeAgo}</Text>
                      </View>
                    </View>

                    {/* Optional Message */}
                    {item.message && (
                      <Text className="typography-copy text-gray-700 dark:text-gray-300 mb-3 italic">
                        &quot;{item.message}&quot;
                      </Text>
                    )}

                    {/* Action Buttons */}
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => handleAcceptRequest(item.id)}
                        className="flex-1 bg-amber-500 py-3 rounded-full items-center"
                      >
                        <Text className="typography-label text-white font-semibold">Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeclineRequest(item.id)}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-full items-center"
                      >
                        <Text className="typography-label text-gray-700 dark:text-gray-300 font-semibold">
                          Decline
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )
        )}

        {/* Floating Action Button - only show on conversations tab */}
        {activeTab === 'conversations' && (
          <TouchableOpacity
            onPress={() => setShowNewConversationModal(true)}
            className="absolute bottom-6 right-6 w-14 h-14 bg-amber-500 rounded-full items-center justify-center shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        )}
      </Container>

      {/* New Conversation Modal */}
      <NewConversationModal
        visible={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
      />
    </>
  );
}
