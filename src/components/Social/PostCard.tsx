import React from 'react';
import { View, Text, Image, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Post } from '~/utils/socialApi';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onLike: () => void;
  onComment: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onUserPress?: () => void;
}

export function PostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onDelete,
  onUserPress,
}: PostCardProps) {
  const isOwnPost = post.authorId === currentUserId;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  const handleShare = async () => {
    if (onShare) {
      onShare();
    } else {
      try {
        await Share.share({
          message: `Check out this post from ${post.author?.username || 'PokePages'}:\n\n${post.content}`,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <TouchableOpacity
          onPress={onUserPress}
          className="flex-row items-center flex-1"
        >
          {post.author?.avatarUrl ? (
            <Image
              source={{ uri: post.author.avatarUrl }}
              className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 items-center justify-center">
              <Ionicons name="person" size={24} color="white" />
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="typography-label text-gray-900 dark:text-white font-semibold">
              {post.author?.username || 'Unknown Trainer'}
            </Text>
            <Text className="typography-caption text-gray-500 dark:text-gray-400">
              {timeAgo}
            </Text>
          </View>
        </TouchableOpacity>

        {isOwnPost && onDelete && (
          <TouchableOpacity onPress={onDelete} className="p-2">
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Text className="typography-copy text-gray-800 dark:text-gray-100 mb-3 leading-6">
        {post.content}
      </Text>

      {/* Image */}
      {post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          className="w-full h-64 rounded-xl mb-3"
          resizeMode="cover"
        />
      )}

      {/* Visibility Badge */}
      {post.visibility === 'friends_only' && (
        <View className="flex-row items-center mb-3">
          <Ionicons name="people" size={14} color="#F59E0B" />
          <Text className="typography-caption text-amber-600 dark:text-amber-400 ml-1">
            Friends Only
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row items-center justify-around pt-3 border-t border-gray-100 dark:border-gray-700">
        <TouchableOpacity
          onPress={onLike}
          className={`flex-row items-center px-4 py-2 rounded-full ${
            post.isLikedByUser
              ? 'bg-red-50 dark:bg-red-900/20'
              : 'bg-gray-50 dark:bg-gray-700'
          }`}
        >
          <Ionicons
            name={post.isLikedByUser ? 'heart' : 'heart-outline'}
            size={20}
            color={post.isLikedByUser ? '#EF4444' : '#6B7280'}
          />
          <Text
            className={`typography-caption ml-2 ${
              post.isLikedByUser
                ? 'text-red-500 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            {post.likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onComment}
          className="flex-row items-center px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-700"
        >
          <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
          <Text className="typography-caption text-gray-600 dark:text-gray-300 ml-2">
            {post.commentsCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          className="flex-row items-center px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-700"
        >
          <Ionicons name="share-outline" size={20} color="#6B7280" />
          <Text className="typography-caption text-gray-600 dark:text-gray-300 ml-2">
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
