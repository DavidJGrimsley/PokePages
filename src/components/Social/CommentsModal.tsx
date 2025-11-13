import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as socialApi from '~/utils/socialApi';
import { 
  loadPostComments, 
  createPostComment, 
  deleteComment, 
  handleCommentReaction as utilHandleCommentReaction 
} from '~/utils/socialUtils';
import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';
import { useAuthStore } from '~/store/authStore';

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
      const data = await loadPostComments(postId, userId);
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
      const comment = await createPostComment(postId, userId, newComment.trim());
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
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId, userId);
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

      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      const result = await utilHandleCommentReaction(
        commentId,
        userId,
        emojiCode,
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
              .map((r) => (r.emojiCode === emojiCode ? { ...r, count: r.count - 1 } : r))
              .filter((r) => r.count > 0);
            return { ...c, userReaction: null, reactions: newReactions };
          } else {
            // Add or change reaction
            if (result.oldReaction) {
              newReactions = newReactions
                .map((r) => (r.emojiCode === result.oldReaction ? { ...r, count: r.count - 1 } : r))
                .filter((r) => r.count > 0);
            }
            
            const existingReaction = newReactions.find((r) => r.emojiCode === emojiCode);
            if (existingReaction) {
              newReactions = newReactions.map((r) =>
                r.emojiCode === emojiCode ? { ...r, count: r.count + 1 } : r
              );
            } else {
              newReactions = [...newReactions, { emojiCode, count: 1 }];
            }
            
            return { ...c, userReaction: emojiCode, reactions: newReactions };
          }
        })
      );
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
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                currentUserId={userId}
                onDelete={handleDeleteComment}
                onReaction={handleCommentReaction}
                onAuthorPress={() => {
                  const username = item.author?.username;
                  if (username) {
                    router.push(`/(profile)/${username}`);
                    onClose();
                  }
                }}
                showReactionButtons={true}
              />
            )}
          />
        )}

        {/* Comment Input */}
        <View className="border-t border-gray-200 dark:border-gray-700 p-4">
          <CommentInput
            value={newComment}
            onChangeText={setNewComment}
            onSubmit={handlePostComment}
            placeholder="Write a comment..."
            submitting={posting}
            maxLength={1000}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
