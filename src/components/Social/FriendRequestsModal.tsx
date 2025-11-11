import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as socialApi from '~/utils/socialApi';
import { formatDistanceToNow } from 'date-fns';

interface FriendRequestsModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  onUpdate?: () => void;
}

export function FriendRequestsModal({
  visible,
  onClose,
  userId,
  onUpdate,
}: FriendRequestsModalProps) {
  const [requests, setRequests] = useState<socialApi.FriendRequest[]>([]);
  // Start not loading until actually fetching
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await socialApi.getFriendRequests(userId);
      setRequests(data);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (visible && userId) {
      loadRequests();
    }
  }, [visible, userId, loadRequests]);

  const handleAccept = async (friendshipId: string) => {
    try {
      setProcessing(friendshipId);
      await socialApi.acceptFriendRequest(friendshipId, userId);
      setRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      onUpdate?.();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (friendshipId: string) => {
    try {
      setProcessing(friendshipId);
      await socialApi.rejectFriendRequest(friendshipId, userId);
      setRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      onUpdate?.();
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (!visible) {
    // Avoid mounting Modal when not visible to prevent pointer-event issues on web
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <Text className="typography-header text-gray-900 dark:text-white">
              Friend Requests
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View className="flex-1 justify-center items-center p-8">
              <ActivityIndicator size="large" color="#F59E0B" />
            </View>
          ) : requests.length === 0 ? (
            <View className="flex-1 justify-center items-center p-8">
              <Ionicons name="people-outline" size={64} color="#9CA3AF" />
              <Text className="typography-copy text-gray-500 mt-4 text-center">
                No pending friend requests
              </Text>
            </View>
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item) => item.id}
              contentContainerClassName="p-4"
              renderItem={({ item }) => {
                const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                });

                return (
                  <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-3">
                    <View className="flex-row items-center mb-3">
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
                      <View className="flex-1 ml-3">
                        <Text className="typography-label text-gray-900 dark:text-white font-semibold">
                          {item.requester?.username || 'Unknown User'}
                        </Text>
                        <Text className="typography-caption text-gray-500">{timeAgo}</Text>
                      </View>
                    </View>

                    {item.message && (
                      <Text className="typography-copy text-gray-700 dark:text-gray-300 mb-3">
                        &quot;{item.message}&quot;
                      </Text>
                    )}

                    <View className="flex-row space-x-2">
                      <TouchableOpacity
                        onPress={() => handleAccept(item.id)}
                        disabled={processing === item.id}
                        className="flex-1 bg-green-500 py-3 rounded-full items-center"
                      >
                        {processing === item.id ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text className="typography-label text-white font-semibold">
                            Accept
                          </Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleReject(item.id)}
                        disabled={processing === item.id}
                        className="flex-1 bg-gray-300 dark:bg-gray-700 py-3 rounded-full items-center"
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
          )}
        </View>
      </View>
    </Modal>
  );
}
