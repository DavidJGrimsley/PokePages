import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import Head from 'expo-router/head';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from 'components/UI/Container';
import { PostCard } from 'components/Social/PostCard';
import { CommentsModal } from 'components/Social/CommentsModal';
import { FriendRequestsModal } from 'components/Social/FriendRequestsModal';
import { useAuthStore } from '~/store/authStore';
import * as socialApi from '~/utils/socialApi';
import type { ReactionType } from '~/utils/socialApi';
import { InProgressDisclaimer } from '@/src/components/Meta/InProgressDisclaimer';
import { Footer } from '@/src/components/Meta/Footer';
import { AdBannerWithModal } from '@/src/components/Ads';

type FeedMode = 'explore' | 'friends';

interface PostWithReactions extends socialApi.Post {
  reactions?: { emojiCode: ReactionType; count: number }[];
  currentUserReaction?: ReactionType | null;
}

// Type for feed items (posts + ads)
type FeedItem = 
  | { type: 'post'; data: PostWithReactions }
  | { type: 'ad'; id: string };

export default function FeedTab() {
  const { user } = useAuthStore();
  const [feedMode, setFeedMode] = useState<FeedMode>('explore');
  const [posts, setPosts] = useState<PostWithReactions[]>([]);
  const [loading, setLoading] = useState(true);

  // Inject ads into feed items
  // Show ad between every 15-20 posts, at least once if there are posts, not at top or bottom
  const feedItems: FeedItem[] = React.useMemo(() => {
    if (posts.length === 0) return [];
    
    const items: FeedItem[] = [];
    const adInterval = 17; // Middle of 15-20 range
    
    posts.forEach((post, index) => {
      items.push({ type: 'post', data: post });
      
      // Insert ad after every adInterval posts, but not after the last post
      // Also ensure at least one ad if we have enough posts (> 3)
      const shouldShowAd = (index + 1) % adInterval === 0 && index < posts.length - 1;
      const shouldShowFirstAd = index === Math.floor(posts.length / 2) && posts.length > 3 && items.filter(i => i.type === 'ad').length === 0;
      
      if (shouldShowAd || shouldShowFirstAd) {
        items.push({ type: 'ad', id: `ad-${index}` });
      }
    });
    
    return items;
  }, [posts]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

      // Load reactions for each post
      const postsWithReactions = await Promise.all(
        fetchedPosts.map(async (post) => {
          try {
            const reactions = await socialApi.getPostReactions(post.id);
            // TODO: Track current user's reaction
            return { ...post, reactions, currentUserReaction: null };
          } catch (err) {
            console.error('Failed to load reactions for post', post.id, err);
            return { ...post, reactions: [], currentUserReaction: null };
          }
        })
      );

      setPosts(postsWithReactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, feedMode]);

  const loadHashtagPosts = useCallback(async (hashtag: string) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const fetchedPosts = await socialApi.getPostsByHashtag(hashtag, user.id);

      // Load reactions for each post
      const postsWithReactions = await Promise.all(
        fetchedPosts.map(async (post) => {
          try {
            const reactions = await socialApi.getPostReactions(post.id);
            return { ...post, reactions, currentUserReaction: null };
          } catch (err) {
            console.error('Failed to load reactions for post', post.id, err);
            return { ...post, reactions: [], currentUserReaction: null };
          }
        })
      );

      setPosts(postsWithReactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search posts');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (searchQuery.trim()) {
      loadHashtagPosts(searchQuery);
    } else {
      loadPosts();
    }
  }, [searchQuery, loadPosts, loadHashtagPosts]);

  const handleHashtagPress = (hashtagName: string) => {
    setSearchQuery(hashtagName);
  };

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Refresh the feed whenever this screen gains focus (e.g., after navigating from composer)
  useFocusEffect(
    useCallback(() => {
      loadPosts(true);
    }, [loadPosts])
  );

  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    if (!user?.id) return;

    console.log('🎯 handleReaction called:', { postId, reactionType, userId: user.id });

    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) {
        console.log('⚠️ Post not found:', postId);
        return;
      }

      console.log('📊 Current post state:', {
        id: post.id,
        currentUserReaction: post.currentUserReaction,
        reactionsCount: post.reactions?.length || 0,
      });

      // If same reaction, remove it; otherwise replace/add
      if (post.currentUserReaction === reactionType) {
        console.log('🗑️ Removing reaction...');
        await socialApi.removeReaction(postId, user.id, reactionType);
        console.log('✅ Reaction removed');
        // Update local state
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              const newReactions = p.reactions?.map((r) =>
                r.emojiCode === reactionType ? { ...r, count: Math.max(0, r.count - 1) } : r
              ).filter((r) => r.count > 0) || [];
              return { ...p, reactions: newReactions, currentUserReaction: null };
            }
            return p;
          })
        );
      } else {
        // Remove old reaction if exists
        if (post.currentUserReaction) {
          console.log('🔄 Removing old reaction:', post.currentUserReaction);
          await socialApi.removeReaction(postId, user.id, post.currentUserReaction);
          console.log('✅ Old reaction removed');
        }
        // Add new reaction
        console.log('➕ Adding new reaction:', reactionType);
        await socialApi.addReaction(postId, user.id, reactionType);
        console.log('✅ New reaction added');
        
        // Update local state
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              let newReactions = p.reactions || [];
              
              // Remove old reaction count
              if (post.currentUserReaction) {
                newReactions = newReactions.map((r) =>
                  r.emojiCode === post.currentUserReaction
                    ? { ...r, count: Math.max(0, r.count - 1) }
                    : r
                ).filter((r) => r.count > 0);
              }
              
              // Add new reaction count
              const existing = newReactions.find((r) => r.emojiCode === reactionType);
              if (existing) {
                newReactions = newReactions.map((r) =>
                  r.emojiCode === reactionType ? { ...r, count: r.count + 1 } : r
                );
              } else {
                newReactions = [...newReactions, { emojiCode: reactionType, count: 1 }];
              }
              
              return { ...p, reactions: newReactions, currentUserReaction: reactionType };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error('Reaction error:', err);
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

  // SEO meta content
  const title = 'Social Feed | Pokémon Trainer Community | PokePages';
  const description = 'Explore posts from the Pokémon trainer community. Share your adventures, strategies, and connect with fellow trainers worldwide.';
  const keywords = 'pokemon feed, trainer posts, pokemon community, social pokemon, trainer network';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Poké Pages" />
        <meta property="og:url" content="https://pokepages.app/social/feed" />
        <meta property="og:image" content="https://pokepages.app/images/home-preview.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://pokepages.app/images/home-preview.png" />
        
        {/* Additional SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Poké Pages" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://pokepages.app/social/feed" />
      </Head>
      <Stack.Screen 
        options={{ 
          title: 'Feed',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowFriendRequests(true)}
              className="mr-4"
            >
              <Ionicons name="people-outline" size={24} color="#F59E0B" />
            </TouchableOpacity>
          ),
        }} 
      />
      <Container>
        {/* Feed Mode Toggle */}
        <View className="flex-row border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <TouchableOpacity
            onPress={() => setFeedMode('explore')}
            className={`flex-1 py-3 items-center border-b-2 ${
              feedMode === 'explore'
                ? 'border-amber-500'
                : 'border-transparent'
            }`}
          >
            <Text
              className={`typography-label font-semibold ${
                feedMode === 'explore'
                  ? 'text-amber-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              🌍 Explore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFeedMode('friends')}
            className={`flex-1 py-3 items-center border-b-2 ${
              feedMode === 'friends'
                ? 'border-amber-500'
                : 'border-transparent'
            }`}
          >
            <Text
              className={`typography-label font-semibold ${
                feedMode === 'friends'
                  ? 'text-amber-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              👥 Friends
            </Text>
          </TouchableOpacity>
        </View>

        <InProgressDisclaimer />

        {/* Search Bar */}
        <View className="mx-4 my-2 flex-row items-center bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by #hashtag..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 typography-copy text-gray-900 dark:text-white"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
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
            data={feedItems}
            keyExtractor={(item) => item.type === 'post' ? item.data.id : item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              if (item.type === 'ad') {
                return <AdBannerWithModal key={item.id} />;
              }
              
              const post = item.data;
              return (
                <PostCard
                  post={post}
                  currentUserId={user.id}
                  onReaction={(reactionType) => handleReaction(post.id, reactionType)}
                  onComment={() => {
                    console.log('💬 onComment clicked for postId:', post.id);
                    console.log('💬 Current selectedPostId:', selectedPostId);
                    console.log('💬 Setting selectedPostId to:', post.id);
                    
                    // Use setTimeout to see if the freeze is from a blocking operation
                    setTimeout(() => {
                      console.log('💬 Timeout executing setSelectedPostId');
                      setSelectedPostId(post.id);
                      console.log('💬 selectedPostId set complete');
                    }, 0);
                  }}
                  onHashtagPress={handleHashtagPress}
                  onDelete={
                    post.authorId === user.id ? () => handleDelete(post.id) : undefined
                  }
                  onUserPress={() => {
                    const username = post.author?.username;
                    if (username) {
                      console.log('👤 onUserPress called for username:', username);
                      console.log('👤 Navigating to /(profile)/' + username);
                      router.push(`/(profile)/${username}`);
                    } else {
                      console.warn('⚠️ No username available for author:', post.authorId);
                    }
                  }}
                  onPress={() => {
                    // Navigate to individual post page
                    router.push(`/social/posts/${post.id}`);
                  }}
                  reactions={post.reactions}
                  currentUserReaction={post.currentUserReaction}
                />
              );
            }}
            contentContainerClassName="pb-4"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadPosts(true)}
                tintColor="#F59E0B"
              />
            }
            ListFooterComponent={
              <Footer />
            }
          />
        )}
      </Container>

      {/* Modals */}
      <CommentsModal
        visible={selectedPostId !== null}
        onClose={() => {
          console.log('🚪 Closing comments modal, selectedPostId was:', selectedPostId);
          setSelectedPostId(null);
          console.log('🚪 selectedPostId set to null');
        }}
        postId={selectedPostId || ''}
        userId={user.id}
      />

      <FriendRequestsModal
        visible={showFriendRequests}
        onClose={() => setShowFriendRequests(false)}
        userId={user.id}
        onUpdate={() => loadPosts(true)}
      />
    </>
  );
}
