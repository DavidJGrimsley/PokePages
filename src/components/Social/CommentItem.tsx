import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import * as socialApi from '~/utils/socialApi';

interface CommentItemProps {
  comment: socialApi.Comment;
  currentUserId: string;
  onDelete?: (commentId: string) => void;
  onReaction?: (commentId: string, reactionType: socialApi.ReactionType) => void;
  onAuthorPress?: () => void;
  showReactionButtons?: boolean;
}

const emojiMap: Record<socialApi.ReactionType, string> = {
  heart: '❤️',
  shiny: '✨',
  fire: '🔥',
  meh: '😑',
  heartbreak: '💔',
  hundred: '💯',
};

export function CommentItem({
  comment,
  currentUserId,
  onDelete,
  onReaction,
  onAuthorPress,
  showReactionButtons = false,
}: CommentItemProps) {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  const isOwnComment = comment.authorId === currentUserId;

  return (
    <View className="mb-4">
      <View className="flex-row items-start">
        {comment.author?.avatarUrl ? (
          <Image
            source={{ uri: comment.author.avatarUrl }}
            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 items-center justify-center">
            <Ionicons name="person" size={20} color="white" />
          </View>
        )}
        <View className="flex-1 ml-3">
          <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
            <TouchableOpacity onPress={onAuthorPress} disabled={!onAuthorPress}>
              <Text className="typography-label text-gray-900 dark:text-white font-semibold mb-1">
                {comment.author?.username || 'Unknown User'}
              </Text>
            </TouchableOpacity>
            <Text className="typography-copy text-gray-800 dark:text-gray-200">
              {comment.content}
            </Text>
          </View>
          <View className="flex-row items-center mt-1 ml-3">
            <Text className="typography-caption text-gray-500">{timeAgo}</Text>
            {isOwnComment && onDelete && (
              <TouchableOpacity
                onPress={() => onDelete(comment.id)}
                className="ml-4"
              >
                <Text className="typography-caption text-red-500">Delete</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Reaction Buttons */}
          {showReactionButtons && onReaction && (
            <View className="flex-row items-center mt-2 ml-3 flex-wrap">
              {(['heart', 'shiny', 'fire', 'meh', 'heartbreak', 'hundred'] as socialApi.ReactionType[]).map(
                (emoji) => {
                  const reactionCount = comment.reactions?.find((r) => r.emojiCode === emoji)?.count || 0;
                  const isUserReaction = comment.userReaction === emoji;

                  return (
                    <TouchableOpacity
                      key={emoji}
                      onPress={() => onReaction(comment.id, emoji)}
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
          )}
        </View>
      </View>
    </View>
  );
}
