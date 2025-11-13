import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Post, ReactionType } from '~/utils/socialApi';
import { formatDistanceToNow } from 'date-fns';
import { ReactionPicker, REACTIONS } from './ReactionPicker';
import { ShareModal } from './ShareModal';
import { ParsedContent } from './ParsedContent';
import { MediaGallery } from './MediaGallery';
import { PostHeader } from './PostHeader';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onReaction: (reactionType: ReactionType) => void;
  onComment: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onUserPress?: () => void;
  onHashtagPress?: (hashtag: string) => void;
  onPress?: () => void; // Added: Make entire card pressable
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
  onPress,
  reactions = [],
  currentUserReaction = null,
}: PostCardProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 768; // match [postId] breakpoint

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
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
        className="rounded-3xl p-3 mb-0 border-t border-r-2 border-app-flag"
        style={{ width: isSmallScreen ? '100%' : '90%', alignSelf: 'center' }}
      >
        {/* Header */}
          <PostHeader
            author={post.author}
            authorId={post.authorId}
            currentUserId={currentUserId}
            timeAgo={timeAgo}
            onAuthorPress={onUserPress}
            onDelete={onDelete}
            stopPropagation={true}
          />

        {/* Content and Media - Row on wide screens, stacked on small */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {/* Text Content */}
          <View style={isSmallScreen ? { width: '100%' } : { flex: 1, minWidth: 600 }}>
            <ParsedContent 
              content={post.content}
              className="typography-copy text-gray-800 dark:text-gray-100 mb-4 leading-6"
            />
          </View>

          {/* Media */}
          {(post.imageUrls || post.videoUrl || post.imageUrl) && (
            <View
              style={
                isSmallScreen
                  ? {
                      width: '100%',
                      maxWidth: '100%',
                      marginBottom: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
                  : {
                      flex: 1,
                      minWidth: 600,
                      maxWidth: '100%',
                      marginBottom: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
              }
            >
              {(post.imageUrls || post.videoUrl) ? (
                <MediaGallery imageUrls={post.imageUrls} videoUrl={post.videoUrl} />
              ) : post.imageUrl ? (
                <Image
                  source={{ uri: post.imageUrl }}
                  style={{ width: '100%', height: 256, maxWidth: 600 }}
                  className="rounded-2xl mb-4 border-2 border-amber-300"
                  resizeMode="cover"
                />
              ) : null}
            </View>
          )}
        </View>

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
            onPress={(e) => {
              e?.stopPropagation?.();
              handleReactionPress();
            }}
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
            onPress={(e) => {
              e?.stopPropagation?.();
              onComment();
            }}
            className="flex-row items-center px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700"
          >
            <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
            <Text className="typography-caption text-gray-600 dark:text-gray-300 ml-2 font-semibold">
              {post.commentsCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e?.stopPropagation?.();
              handleShare();
            }}
            className="flex-row items-center px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700"
          >
            <Ionicons name="share-outline" size={20} color="#6B7280" />
            <Text className="typography-caption text-gray-600 dark:text-gray-300 ml-2 font-semibold">
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

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
