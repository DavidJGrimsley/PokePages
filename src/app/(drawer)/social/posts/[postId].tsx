import React, { useState, useEffect, useCallback } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from 'components/UI/Container';
import { ReactionPicker, REACTIONS } from 'components/Social/ReactionPicker';
import { ShareModal } from 'components/Social/ShareModal';
import { ParsedContent } from 'components/Social/ParsedContent';
import { CommentInput } from 'components/Social/CommentInput';
import { CommentItem } from 'components/Social/CommentItem';
import { MediaGallery } from 'components/Social/MediaGallery';
import { PostHeader } from 'components/Social/PostHeader';
import { useAuthStore } from '~/store/authStore';
import * as socialApi from '~/utils/socialApi';
import { 
  loadPostComments, 
  createPostComment, 
  deleteComment, 
  handleCommentReaction as utilHandleCommentReaction 
} from '~/utils/socialUtils';
import type { ReactionType, Comment } from '~/utils/socialApi';
import { formatDistanceToNow } from 'date-fns';
import { theme } from '~/constants/style/theme';

interface PostWithReactions extends socialApi.Post {
  reactions?: { emojiCode: ReactionType; count: number }[];
  currentUserReaction?: ReactionType | null;
}

export default function PostDetailPage() {
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 768; // 100% width on small screens
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user } = useAuthStore();
  const [post, setPost] = useState<PostWithReactions | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadPost = useCallback(async (refresh = false) => {
    if (!postId || !user?.id) return;

    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      // Fetch the post
      const fetchedPost = await socialApi.getPost(postId);
      
      if (!fetchedPost) {
        setError('Post not found');
        return;
      }

      // Load reactions
      const reactions = await socialApi.getPostReactions(postId);
      
      setPost({ ...fetchedPost, reactions, currentUserReaction: null });
    } catch (err) {
      console.error('Failed to load post:', err);
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [postId, user?.id]);

  const loadComments = useCallback(async () => {
    if (!postId || !user?.id) return;

    try {
      setLoadingComments(true);
      const fetchedComments = await loadPostComments(postId, user.id);
      setComments(fetchedComments);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  }, [postId, user?.id]);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [loadPost, loadComments]);

  const handleReaction = async (reactionType: ReactionType) => {
    if (!user?.id || !post) return;

    try {
      // If same reaction, remove it; otherwise replace/add
      if (post.currentUserReaction === reactionType) {
        await socialApi.removeReaction(post.id, user.id, reactionType);
        // Update local state
        setPost((prev) => {
          if (!prev) return prev;
          const newReactions = prev.reactions?.map((r) =>
            r.emojiCode === reactionType ? { ...r, count: Math.max(0, r.count - 1) } : r
          ).filter((r) => r.count > 0) || [];
          return { ...prev, reactions: newReactions, currentUserReaction: null };
        });
      } else {
        // Remove old reaction if exists
        if (post.currentUserReaction) {
          await socialApi.removeReaction(post.id, user.id, post.currentUserReaction);
        }
        // Add new reaction
        await socialApi.addReaction(post.id, user.id, reactionType);
        
        // Update local state
        setPost((prev) => {
          if (!prev) return prev;
          let newReactions = prev.reactions || [];
          
          // Remove old reaction count
          if (prev.currentUserReaction) {
            newReactions = newReactions.map((r) =>
              r.emojiCode === prev.currentUserReaction
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
          
          return { ...prev, reactions: newReactions, currentUserReaction: reactionType };
        });
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  const handleCommentReaction = async (commentId: string, reactionType: ReactionType) => {
    if (!user?.id) return;

    try {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      const result = await utilHandleCommentReaction(
        commentId,
        user.id,
        reactionType,
        comment.userReaction || null
      );

      // Update local state based on action
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          let newReactions = c.reactions || [];
          
          if (result.action === 'remove') {
            // Remove reaction
            newReactions = newReactions
              .map((r) => (r.emojiCode === reactionType ? { ...r, count: Math.max(0, r.count - 1) } : r))
              .filter((r) => r.count > 0);
            return { ...c, userReaction: null, reactions: newReactions };
          } else {
            // Add or change reaction
            if (result.oldReaction) {
              newReactions = newReactions
                .map((r) => (r.emojiCode === result.oldReaction ? { ...r, count: Math.max(0, r.count - 1) } : r))
                .filter((r) => r.count > 0);
            }
            
            const existing = newReactions.find((r) => r.emojiCode === reactionType);
            if (existing) {
              newReactions = newReactions.map((r) =>
                r.emojiCode === reactionType ? { ...r, count: r.count + 1 } : r
              );
            } else {
              newReactions = [...newReactions, { emojiCode: reactionType, count: 1 }];
            }
            
            return { ...c, userReaction: reactionType, reactions: newReactions };
          }
        })
      );
    } catch (err) {
      console.error('Comment reaction error:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user?.id) return;

    try {
      await deleteComment(commentId, user.id);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount - 1 } : prev);
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !post) return;

    try {
      await socialApi.deletePost(post.id, user.id);
      router.back();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user?.id || !post) return;

    try {
      setSubmittingComment(true);
      await createPostComment(post.id, user.id, commentText.trim());
      setCommentText('');
      // Reload comments
      await loadComments();
      // Update comment count
      setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev);
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!user?.id) {
    return (
      <Container>
        <View className="flex-1 justify-center items-center">
          <Text className="typography-copy text-gray-500">Please sign in to view this post</Text>
        </View>
      </Container>
    );
  }

  // SEO meta content
  const title = post 
    ? `Post by ${post.author?.username || 'Unknown'} | PokePages`
    : 'Post | PokePages';
  const description = post?.content 
    ? post.content.substring(0, 160) 
    : 'Check out this post from the Pokémon trainer community on PokePages';
  const imageUrl = post?.imageUrls?.[0] || post?.imageUrl || 'https://pokepages.app/images/home-preview.png';

  const totalReactions = post?.reactions?.reduce((sum, r) => sum + r.count, 0) || 0;
  const currentReactionEmoji = post?.currentUserReaction
    ? REACTIONS.find((r) => r.type === post.currentUserReaction)?.emoji
    : null;
  const timeAgo = post ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : '';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="pokemon post, trainer community, pokemon social" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Poké Pages" />
        <meta property="og:url" content={`https://pokepages.app/social/posts/${postId}`} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        
        {/* Additional SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Poké Pages" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://pokepages.app/social/posts/${postId}`} />
      </Head>

      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={() => router.push('/(drawer)/social/(tabs)/feed')}
              style={{
                marginLeft: theme.spacing.sm,
                padding: theme.spacing.sm,
              }}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.light.primary} />
            </Pressable>
          ),
        }}
      />

      <Container>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#F59E0B" />
              <Text className="typography-copy text-gray-500 mt-4">Loading post...</Text>
            </View>
          ) : error || !post ? (
            <View className="flex-1 justify-center items-center px-6">
              <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
              <Text className="typography-header text-gray-700 dark:text-gray-300 text-center mb-2 mt-4">
                {error || 'Post not found'}
              </Text>
              <Text className="typography-copy text-gray-500 text-center mb-6">
                This post may have been deleted or you don&apos;t have permission to view it.
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-amber-500 px-6 py-3 rounded-full"
              >
                <Text className="typography-label text-white font-semibold">Go Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-24"
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      loadPost(true);
                      loadComments();
                    }}
                    tintColor="#F59E0B"
                  />
                }
              >
                {/* Post Content - 100% width on small screens; 90% on larger screens */}
                <View style={{ width: isSmallScreen ? '100%' : '90%', alignSelf: 'center' }}>
                  <View className="p-4 m-3 rounded-3xl border-t border-r-2 border-app-flag">
                    {/* Author Header */}
                    <PostHeader
                      author={post.author}
                      authorId={post.authorId}
                      currentUserId={user.id}
                      timeAgo={timeAgo}
                      onDelete={handleDelete}
                      stopPropagation={false}
                    />

                    {/* Content and Media Container - Row layout on extra wide screens (1920px+) */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {/* Text Content */}
                      <View style={isSmallScreen ? { width: '100%' } : { flex: 1, minWidth: 600 }}>
                        <ParsedContent 
                          content={post.content}
                          className="typography-copy text-gray-800 dark:text-gray-100 mb-4 text-lg leading-7"
                        />
                      </View>

                      {/* Media - Side by side on extra wide screens */}
                      {(post.imageUrls || post.videoUrl) && (
                        <View style={
                          isSmallScreen
                            ? {
                                width: '100%',
                                maxWidth: '100%',
                                marginBottom: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }
                            : {
                                flex: 1,
                                minWidth: 600,
                                maxWidth: '100%',
                                marginBottom: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }
                        }>
                          <MediaGallery
                            imageUrls={post.imageUrls}
                            videoUrl={post.videoUrl}
                          />
                        </View>
                      )}
                    </View>

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <View className="flex-row flex-wrap gap-2 mb-4">
                        {post.hashtags.map(hashtag => (
                          <TouchableOpacity
                            key={hashtag.id}
                            onPress={() => {
                              router.push({
                                pathname: '/(drawer)/social/(tabs)/feed',
                                params: { hashtag: hashtag.name }
                              });
                            }}
                            className="bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full"
                          >
                            <Text className="text-amber-600 dark:text-amber-400 text-sm font-semibold">
                              #{hashtag.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Visibility Badge */}
                    {post.visibility === 'friends_only' && (
                      <View className="flex-row items-center mb-4 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-full self-start">
                        <Ionicons name="people" size={14} color="#F59E0B" />
                        <Text className="typography-caption text-amber-600 dark:text-amber-400 ml-1 font-semibold">
                          Friends Only
                        </Text>
                      </View>
                    )}

                    {/* Reactions Summary */}
                    {totalReactions > 0 && (
                      <View className="flex-row flex-wrap gap-2 mb-4">
                        {post.reactions?.map((reaction) => {
                          const emoji = REACTIONS.find((r) => r.type === reaction.emojiCode)?.emoji;
                          return (
                            <View
                              key={reaction.emojiCode}
                              className="flex-row items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full border border-amber-300"
                            >
                              <Text className="text-base">{emoji}</Text>
                              <Text className="typography-caption text-gray-700 dark:text-gray-300 ml-1 font-semibold">
                                {reaction.count}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View className="flex-row items-center justify-around pt-4 border-t-2 border-amber-200 dark:border-amber-800">
                    <TouchableOpacity
                      onPress={() => setShowReactionPicker(true)}
                      className={`flex-row items-center px-6 py-2 rounded-full border-2 ${
                        post.currentUserReaction
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      {currentReactionEmoji ? (
                        <Text className="text-2xl">{currentReactionEmoji}</Text>
                      ) : (
                        <Ionicons name="heart-outline" size={24} color="#6B7280" />
                      )}
                      <Text
                        className={`typography-label ml-2 font-semibold ${
                          post.currentUserReaction
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {totalReactions}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setShowShareModal(true)}
                      className="flex-row items-center px-6 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700"
                    >
                      <Ionicons name="share-outline" size={24} color="#6B7280" />
                      <Text className="typography-label text-gray-600 dark:text-gray-300 ml-2 font-semibold">
                        Share
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Comments Section */}
                <View className="w-full max-w-6xl mx-auto px-3 mb-3">
                  <View className="flex-row items-center mb-3 ml-1">
                    <Ionicons name="chatbubble" size={20} color="#F59E0B" />
                    <Text className="typography-header text-gray-900 dark:text-white font-bold ml-2">
                      Comments ({post.commentsCount})
                    </Text>
                  </View>

                  {loadingComments ? (
                    <View className="py-10">
                      <ActivityIndicator size="small" color="#F59E0B" />
                    </View>
                  ) : comments.length === 0 ? (
                    <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6">
                      <Text className="typography-copy text-gray-500 text-center">
                        No comments yet. Be the first to comment!
                      </Text>
                    </View>
                  ) : (
                    comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentUserId={user.id}
                        onDelete={handleDeleteComment}
                        onReaction={handleCommentReaction}
                        onAuthorPress={() => {
                          const username = comment.author?.username;
                          if (username) {
                            router.push(`/(profile)/${username}`);
                          }
                        }}
                        showReactionButtons={true}
                      />
                    ))
                  )}
                </View>
                </View>
              </ScrollView>

              {/* Comment Input (Fixed at Bottom) */}
              <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-amber-200 dark:border-amber-800 px-4 py-3">
                <CommentInput
                  value={commentText}
                  onChangeText={setCommentText}
                  onSubmit={handleSubmitComment}
                  placeholder="Add a comment..."
                  submitting={submittingComment}
                  maxLength={500}
                />
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </Container>

      {/* Reaction Picker */}
      <ReactionPicker
        visible={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        onSelect={handleReaction}
      />

      {/* Share Modal */}
      {post && (
        <ShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          message={`Check out this post from ${post.author?.username || 'a trainer'}: ${post.content}`}
          url={`https://pokepages.app/social/posts/${post.id}`}
          title={`Post from ${post.author?.username || 'PokePages'}`}
        />
      )}
    </>
  );
}
