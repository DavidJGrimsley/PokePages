import React, { useState, useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Container } from 'components/UI/Container';
import { PostCard } from 'components/Social/PostCard';
import { useAuthStore } from '~/store/authStore';
import * as socialApi from '~/utils/socialApi';

type FeedMode = 'explore' | 'friends';

export default function FeedTab() {
  const { user } = useAuthStore();
  const [feedMode, setFeedMode] = useState<FeedMode>('explore');
  const [posts, setPosts] = useState<socialApi.Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (refresh = false) => {
    if (!user?.id) return;

    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const fetchedPosts =
        feedMode === 'explore'
          ? await socialApi.getExploreFeed(user.id)
          : await socialApi.getFriendsFeed(user.id);

      setPosts(fetchedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, feedMode]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user?.id) return;

    try {
      if (currentlyLiked) {
        await socialApi.unlikePost(postId, user.id);
      } else {
        await socialApi.likePost(postId, user.id);
      }

      // Update local state optimistically
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLikedByUser: !currentlyLiked,
                likesCount: post.likesCount + (currentlyLiked ? -1 : 1),
              }
            : post
        )
      );
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user?.id) return;

    try {
      await socialApi.deletePost(postId, user.id);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (!user?.id) {
    return (
      <Container>
        <View className="flex-1 justify-center items-center">
          <Text className="typography-copy text-gray-500">Please sign in to view the feed</Text>
        </View>
      </Container>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Feed' }} />
      <Container>
        {/* Feed Mode Toggle */}
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-full p-1 mx-4 mt-4 mb-2">
          <TouchableOpacity
            onPress={() => setFeedMode('explore')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 9999,
              alignItems: 'center',
              backgroundColor: feedMode === 'explore' ? '#F59E0B' : 'transparent',
              shadowColor: feedMode === 'explore' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: feedMode === 'explore' ? 0.25 : 0,
              shadowRadius: feedMode === 'explore' ? 3.84 : 0,
              elevation: feedMode === 'explore' ? 5 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: feedMode === 'explore' ? '#FFFFFF' : '#9CA3AF',
              }}
            >
              🌍 Explore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFeedMode('friends')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 9999,
              alignItems: 'center',
              backgroundColor: feedMode === 'friends' ? '#F59E0B' : 'transparent',
              shadowColor: feedMode === 'friends' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: feedMode === 'friends' ? 0.25 : 0,
              shadowRadius: feedMode === 'friends' ? 3.84 : 0,
              elevation: feedMode === 'friends' ? 5 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: feedMode === 'friends' ? '#FFFFFF' : '#9CA3AF',
              }}
            >
              👥 Friends
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts List */}
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text className="typography-copy text-gray-500 mt-4">Loading posts...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="typography-copy text-red-500 text-center mb-4">{error}</Text>
            <TouchableOpacity
              onPress={() => loadPosts()}
              className="bg-amber-500 px-6 py-3 rounded-full"
            >
              <Text className="typography-label text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="typography-header text-gray-700 dark:text-gray-300 text-center mb-2">
              {feedMode === 'explore' ? '🌟 No posts yet!' : '👥 No friend posts yet!'}
            </Text>
            <Text className="typography-copy text-gray-500 text-center">
              {feedMode === 'explore'
                ? 'Be the first to share something amazing!'
                : 'Add some friends to see their posts here!'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                currentUserId={user.id}
                onLike={() => handleLike(item.id, item.isLikedByUser || false)}
                onComment={() => {
                  // TODO: Navigate to post details/comments
                  console.log('Open comments for', item.id);
                }}
                onDelete={
                  item.authorId === user.id ? () => handleDelete(item.id) : undefined
                }
                onUserPress={() => {
                  // TODO: Navigate to user profile
                  console.log('Open profile for', item.authorId);
                }}
              />
            )}
            contentContainerClassName="px-4 pb-4"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadPosts(true)}
                tintColor="#F59E0B"
              />
            }
          />
        )}
      </Container>
    </>
  );
}
