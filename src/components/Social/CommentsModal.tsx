import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as socialApi from '~/utils/socialApi';
import { useAuthStore } from '~/store/authStore';
import { formatDistanceToNow } from 'date-fns';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  userId: string;
}

export function CommentsModal({ visible, onClose, postId, userId }: CommentsModalProps) {
  const [comments, setComments] = useState<socialApi.Comment[]>([]);
  // Start as not loading; we'll flip to true only when actually fetching
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [reactingIds, setReactingIds] = useState<Set<string>>(new Set());
  const loadingRef = useRef(false);
  const { profile } = useAuthStore();
  const [inputHeight, setInputHeight] = useState(40); // dynamic height for autogrow
  const MAX_INPUT_HEIGHT = 140;

  const loadComments = useCallback(async () => {
    // Prevent overlapping loads using ref instead of state
    if (loadingRef.current || !postId) {
      console.log('⏭️ Skipping loadComments (already loading or no postId)');
      return;
    }
    
    try {
      loadingRef.current = true;
      setLoading(true);
      console.log('📥 Loading comments for postId:', postId);
      const data = await socialApi.getPostComments(postId, 50, 0, userId);
      console.log('✅ Comments loaded:', data.length);
      setComments(data);
      console.log('📝 Comments state updated');
    } catch (error) {
      console.error('❌ Failed to load comments:', error);
    } finally {
      console.log('🏁 Setting loading states to false');
      setLoading(false);
      loadingRef.current = false;
      console.log('✅ Loading complete');
    }
  }, [postId, userId]);

  useEffect(() => {
    if (visible && postId && !loadingRef.current) {
      console.log('🔄 useEffect triggering loadComments', { visible, postId });
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, postId]);

  useEffect(() => {
    if (visible) {
      console.log('🔄 Loading state changed:', { loading, commentsCount: comments.length });
    }
  }, [visible, loading, comments.length]);

  // Early return after hooks to prevent unnecessary renders
  if (!visible) {
    // Don't mount Modal at all when not visible to avoid any pointer-event blocking on web
    return null;
  }

  if (!postId && visible) {
    console.warn('⚠️ CommentsModal opened without postId');
    return null;
  }

  

  const handlePostComment = async () => {
    if (!newComment.trim() || posting) return;

    try {
      setPosting(true);
      const comment = await socialApi.createComment(postId, userId, newComment.trim());
      // Enrich with current user's profile so it doesn't show Unknown User until refresh
      const enriched: socialApi.Comment = {
        ...comment,
        author: {
          id: userId,
          username: profile?.username || null,
          avatarUrl: profile?.avatarUrl || null,
        },
      };
      setComments((prev) => [enriched, ...prev]);
      setNewComment('');
      setInputHeight(40);
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await socialApi.deleteComment(commentId, userId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleCommentReaction = async (commentId: string, emojiCode: socialApi.ReactionType) => {
    try {
      // Prevent overlapping requests on the same comment to avoid race conditions
      if (reactingIds.has(commentId)) return;
      setReactingIds((prev) => new Set(prev).add(commentId));

      console.log('🎯 handleCommentReaction called:', { commentId, emojiCode, userId });

      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      // Check if user already reacted with this emoji
      if (comment.userReaction === emojiCode) {
        console.log('❌ Removing reaction (same emoji)');
        // Remove reaction
        await socialApi.removeCommentReaction(commentId, userId, emojiCode);
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  userReaction: null,
                  reactions: c.reactions?.map((r) =>
                    r.emojiCode === emojiCode ? { ...r, count: r.count - 1 } : r
                  ).filter((r) => r.count > 0),
                }
              : c
          )
        );
      } else {
        console.log('✅ Adding/changing reaction');
        // Add or change reaction
        if (comment.userReaction) {
          console.log('🔄 Removing old reaction first:', comment.userReaction);
          // Remove old reaction first
          await socialApi.removeCommentReaction(commentId, userId, comment.userReaction);
        }
        const result = await socialApi.addCommentReaction(commentId, userId, emojiCode);
        console.log('📝 Add reaction result:', result);
        
        setComments((prev) =>
          prev.map((c) => {
            if (c.id !== commentId) return c;
            
            let newReactions = c.reactions || [];
            
            // Remove old reaction count
            if (c.userReaction) {
              newReactions = newReactions.map((r) =>
                r.emojiCode === c.userReaction ? { ...r, count: r.count - 1 } : r
              ).filter((r) => r.count > 0);
            }
            
            // Add new reaction count
            const existingReaction = newReactions.find((r) => r.emojiCode === emojiCode);
            if (existingReaction) {
              newReactions = newReactions.map((r) =>
                r.emojiCode === emojiCode ? { ...r, count: r.count + 1 } : r
              );
            } else {
              newReactions = [...newReactions, { emojiCode, count: 1 }];
            }
            
            return {
              ...c,
              userReaction: emojiCode,
              reactions: newReactions,
            };
          })
        );
      }
    } catch (error) {
      console.error('Failed to react to comment:', error);
    } finally {
      setReactingIds((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white dark:bg-gray-900"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Text className="typography-header text-gray-900 dark:text-white">Comments</Text>
          <TouchableOpacity 
            onPress={() => {
              console.log('❌ Close button pressed');
              onClose();
            }} 
            className="p-2"
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text className="typography-copy text-gray-500 mt-2">Loading comments...</Text>
          </View>
        ) : comments.length === 0 ? (
          <View className="flex-1 justify-center items-center p-4">
            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
            <Text className="typography-copy text-gray-500 mt-4 text-center">
              No comments yet. Be the first to comment!
            </Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            contentContainerClassName="p-4"
            renderItem={({ item }) => {
              const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
              const isOwnComment = item.authorId === userId;

              return (
                <View className="mb-4">
                  <View className="flex-row items-start">
                    {item.author?.avatarUrl ? (
                      <Image
                        source={{ uri: item.author.avatarUrl }}
                        className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"
                      />
                    ) : (
                      <View className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 items-center justify-center">
                        <Ionicons name="person" size={20} color="white" />
                      </View>
                    )}
                    <View className="flex-1 ml-3">
                      <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
                        <Text className="typography-label text-gray-900 dark:text-white font-semibold mb-1">
                          {item.author?.username || 'Unknown User'}
                        </Text>
                        <Text className="typography-copy text-gray-800 dark:text-gray-200">
                          {item.content}
                        </Text>
                      </View>
                      <View className="flex-row items-center mt-1 ml-3">
                        <Text className="typography-caption text-gray-500">{timeAgo}</Text>
                        {isOwnComment && (
                          <TouchableOpacity
                            onPress={() => handleDeleteComment(item.id)}
                            className="ml-4"
                          >
                            <Text className="typography-caption text-red-500">Delete</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      
                      {/* Reaction Buttons */}
                      <View className="flex-row items-center mt-2 ml-3 flex-wrap">
                        {(['heart', 'shiny', 'fire', 'meh', 'heartbreak', 'hundred'] as socialApi.ReactionType[]).map(
                          (emoji) => {
                            const reactionCount = item.reactions?.find((r) => r.emojiCode === emoji)?.count || 0;
                            const isUserReaction = item.userReaction === emoji;
                            const emojiMap: Record<socialApi.ReactionType, string> = {
                              heart: '❤️',
                              shiny: '✨',
                              fire: '🔥',
                              meh: '😑',
                              heartbreak: '💔',
                              hundred: '💯',
                            };

                            return (
                              <TouchableOpacity
                                key={emoji}
                                onPress={() => handleCommentReaction(item.id, emoji)}
                                className={`flex-row items-center mr-3 mb-2 px-2 py-1 rounded-full ${
                                  isUserReaction
                                    ? 'bg-amber-100 dark:bg-amber-900/30'
                                    : 'bg-gray-100 dark:bg-gray-800'
                                }`}
                              >
                                <Text className="text-base">{emojiMap[emoji]}</Text>
                                {reactionCount > 0 && (
                                  <Text
                                    className={`typography-caption ml-1 ${
                                      isUserReaction
                                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                  >
                                    {reactionCount}
                                  </Text>
                                )}
                              </TouchableOpacity>
                            );
                          }
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Comment Input */}
        <View className="border-t border-gray-200 dark:border-gray-700 p-4">
          <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xs px-4 py-2">
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Write a comment..."
              placeholderTextColor="#9CA3AF"
              maxLength={1000}
              multiline
              blurOnSubmit={false}
              returnKeyType="default"
              className="flex-1 text-base leading-6 text-gray-900 dark:text-white py-1"
              style={[
                { minHeight: 40, height: Math.min(inputHeight, MAX_INPUT_HEIGHT) },
                Platform.OS === 'web' ? ({ outlineWidth: 0 } as any) : null,
              ]}
              onContentSizeChange={(e) => {
                const h = e.nativeEvent.contentSize.height;
                // Guard against excessive growth
                setInputHeight(h < MAX_INPUT_HEIGHT ? h : MAX_INPUT_HEIGHT);
              }}
              onKeyPress={(e: any) => {
                // Web: Enter submits, Shift+Enter inserts newline
                if (Platform.OS === 'web') {
                  const key = e?.nativeEvent?.key || e?.key;
                  const shift = e?.nativeEvent?.shiftKey;
                  if (key === 'Enter' && !shift) {
                    if (typeof e.preventDefault === 'function') e.preventDefault();
                    handlePostComment();
                  }
                }
              }}
              scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
              accessibilityLabel="Write a comment"
              accessibilityHint="Type your comment here"
              // @ts-ignore - Web-specific prop
              id="comment-input"
              // @ts-ignore - Web-specific prop
              name="comment"
            />
            <TouchableOpacity
              onPress={handlePostComment}
              disabled={!newComment.trim() || posting}
              className={`ml-2 ${
                newComment.trim() && !posting ? 'opacity-100' : 'opacity-50'
              }`}
            >
              {posting ? (
                <ActivityIndicator size="small" color="#F59E0B" />
              ) : (
                <Ionicons name="send" size={24} color="#F59E0B" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
