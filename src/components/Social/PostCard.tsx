import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Post, ReactionType } from '~/utils/socialApi';
import { formatDistanceToNow } from 'date-fns';
import { ReactionPicker, REACTIONS } from './ReactionPicker';
import { ShareModal } from './ShareModal';
import { ParsedContent } from './ParsedContent';
import { MediaGallery } from './MediaGallery';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onReaction: (reactionType: ReactionType) => void;
  onComment: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onUserPress?: () => void;
  onHashtagPress?: (hashtag: string) => void;
  reactions?: { emojiCode: ReactionType; count: number }[];
  currentUserReaction?: ReactionType | null;
}

export function PostCard({
  post,
  currentUserId,
  onReaction,
  onComment,
  onShare,
  onDelete,
  onUserPress,
  onHashtagPress,
  reactions = [],
  currentUserReaction = null,
}: PostCardProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const isOwnPost = post.authorId === currentUserId;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      setShowShareModal(true);
    }
  };

  const handleReactionPress = () => {
    setShowReactionPicker(true);
  };

  const handleReactionSelect = (reactionType: ReactionType) => {
    onReaction(reactionType);
  };

  // Get emoji for current user's reaction
  const currentReactionEmoji = currentUserReaction
    ? REACTIONS.find((r) => r.type === currentUserReaction)?.emoji
    : null;

  return (
    <>
      <View className=" rounded-3xl p-3 mb-0 border-t border-r-2 border-amber-500">
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 rounded-3xl flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={() => {
              console.log('🔘 PostCard header pressed');
              console.log('🔘 onUserPress exists?', !!onUserPress);
              console.log('🔘 post.authorId:', post.authorId);
              if (onUserPress) {
                console.log('✅ Calling onUserPress callback');
                onUserPress();
              } else if (post.author?.username) {
                console.log('📍 Navigating to /(profile)/' + post.author.username);
                router.push(`/(profile)/${post.author.username}`);
              } else {
                console.warn('⚠️ No username available for author');
              }
            }}
            className="flex-row items-center flex-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {post.author?.avatarUrl ? (
              <Image
                source={{ uri: post.author.avatarUrl }}
                className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-amber-400"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 items-center justify-center border-2 border-amber-400">
                <Ionicons name="person" size={24} color="white" />
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text className="typography-label text-gray-900 dark:text-white font-bold">
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
        <ParsedContent 
          content={post.content}
          className="typography-copy text-gray-800 dark:text-gray-100 mb-4 leading-6"
        />

        {/* Media Gallery - supports up to 5 images or 1 video */}
        <MediaGallery imageUrls={post.imageUrls} videoUrl={post.videoUrl} />

        {/* Legacy single image support (for backward compatibility) */}
        {!post.imageUrls && !post.videoUrl && post.imageUrl && (
          <Image
            source={{ uri: post.imageUrl }}
            className="w-full h-64 rounded-2xl mb-4 border-2 border-amber-300"
            resizeMode="cover"
          />
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-4">
            {post.hashtags.map(hashtag => (
              <TouchableOpacity
                key={hashtag.id}
                onPress={() => onHashtagPress?.(hashtag.name)}
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
          <View className="flex-row items-center mb-3 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-full self-start">
            <Ionicons name="people" size={14} color="#F59E0B" />
            <Text className="typography-caption text-amber-600 dark:text-amber-400 ml-1 font-semibold">
              Friends Only
            </Text>
          </View>
        )}

        {/* Reactions Summary */}
        {reactions.length > 0 && (
          <View className="flex-row items-center mb-3 flex-wrap">
            {reactions.map((reaction) => {
              const reactionData = REACTIONS.find((r) => r.type === reaction.emojiCode);
              if (!reactionData) return null;
              return (
                <View
                  key={reaction.emojiCode}
                  className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 mr-2 mb-1 border border-amber-300"
                >
                  <Text className="text-sm">{reactionData.emoji}</Text>
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
            onPress={handleReactionPress}
            className={`flex-row items-center px-4 py-2 rounded-full border-2 ${
              currentUserReaction
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
            }`}
          >
            {currentReactionEmoji ? (
              <Text className="text-xl">{currentReactionEmoji}</Text>
            ) : (
              <Ionicons name="heart-outline" size={20} color="#6B7280" />
            )}
            <Text
              className={`typography-caption ml-2 font-semibold ${
                currentUserReaction
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {totalReactions}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onComment}
            className="flex-row items-center px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700"
          >
            <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
            <Text className="typography-caption text-gray-600 dark:text-gray-300 ml-2 font-semibold">
              {post.commentsCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            className="flex-row items-center px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700"
          >
            <Ionicons name="share-outline" size={20} color="#6B7280" />
            <Text className="typography-caption text-gray-600 dark:text-gray-300 ml-2 font-semibold">
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ReactionPicker
        visible={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        onSelect={handleReactionSelect}
      />

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        message={`Check out this post from ${post.author?.username || 'a trainer'}: ${post.content}`}
        url={`https://pokepages.app/posts/${post.id}`}
        title={`Post from ${post.author?.username || 'PokePages'}`}
      />
    </>
  );
}
