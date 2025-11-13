import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface PostHeaderProps {
  author?: {
    username?: string | null;
    avatarUrl?: string | null;
  } | null;
  authorId: string;
  currentUserId: string;
  timeAgo: string;
  onAuthorPress?: () => void;
  onDelete?: () => void;
  stopPropagation?: boolean;
}

export function PostHeader({
  author,
  authorId,
  currentUserId,
  timeAgo,
  onAuthorPress,
  onDelete,
  stopPropagation = false,
}: PostHeaderProps) {
  const isOwnPost = authorId === currentUserId;

  const handleAuthorPress = (e?: any) => {
    if (stopPropagation && e) {
      e.stopPropagation();
    }
    
    if (onAuthorPress) {
      onAuthorPress();
    } else if (author?.username) {
      router.push(`/(profile)/${author.username}`);
    }
  };

  return (
    <View className="flex-row bg-white dark:bg-gray-800 rounded-3xl items-center justify-between mb-3">
      <TouchableOpacity
        onPress={handleAuthorPress}
        className="flex-row items-center flex-1"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {author?.avatarUrl ? (
          <Image
            source={{ uri: author.avatarUrl }}
            className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-amber-400"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 items-center justify-center border-2 border-amber-400">
            <Ionicons name="person" size={24} color="white" />
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text className="typography-label text-gray-900 dark:text-white font-bold">
            {author?.username || 'Unknown Trainer'}
          </Text>
          <Text className="typography-caption text-gray-500 dark:text-gray-400">
            {timeAgo}
          </Text>
        </View>
      </TouchableOpacity>

      {isOwnPost && onDelete && (
        <TouchableOpacity 
          onPress={(e) => {
            if (stopPropagation) {
              e?.stopPropagation?.();
            }
            onDelete();
          }} 
          className="p-2"
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}
