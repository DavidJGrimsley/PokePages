import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from 'components/UI/Container';
import { useAuthStore } from '~/store/authStore';
import * as socialApi from '~/utils/socialApi';

export default function CreatePostTab() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends_only'>('public');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to create a post');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please write something before posting');
      return;
    }

    setLoading(true);
    try {
      await socialApi.createPost(user.id, content.trim(), visibility);
      
      Alert.alert('Success', 'Your post has been shared!', [
        {
          text: 'OK',
          onPress: () => {
            setContent('');
            router.push('/social');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const charCount = content.length;
  const maxChars = 5000;
  const isValid = content.trim().length > 0 && charCount <= maxChars;

  return (
    <>
      <Stack.Screen options={{ title: 'Create Post' }} />
      <Container>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="p-4"
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="mb-6">
              <Text className="typography-header text-gray-900 dark:text-white mb-2">
                ✨ Share Your Adventure
              </Text>
              <Text className="typography-copy text-gray-600 dark:text-gray-400">
                What&apos;s on your mind, trainer?
              </Text>
            </View>

            {/* Content Input */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-lg border border-gray-100 dark:border-gray-700">
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Share your Pokémon journey, strategies, or just say hello! 🎮"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                className="typography-copy text-gray-900 dark:text-white min-h-[200px] p-0"
                maxLength={maxChars}
              />

              {/* Character Count */}
              <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Text
                  className={`typography-caption ${
                    charCount > maxChars * 0.9
                      ? 'text-red-500'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {charCount} / {maxChars}
                </Text>
              </View>
            </View>

            {/* Visibility Toggle */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-lg border border-gray-100 dark:border-gray-700">
              <Text className="typography-label text-gray-900 dark:text-white font-semibold mb-3">
                👀 Who can see this?
              </Text>

              <TouchableOpacity
                onPress={() => setVisibility('public')}
                className={`flex-row items-center p-4 rounded-xl mb-2 ${
                  visibility === 'public'
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
                }`}
              >
                <Ionicons
                  name={visibility === 'public' ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={visibility === 'public' ? '#F59E0B' : '#9CA3AF'}
                />
                <View className="ml-3 flex-1">
                  <Text className="typography-label text-gray-900 dark:text-white font-semibold">
                    🌍 Everyone (Explore + Friends)
                  </Text>
                  <Text className="typography-caption text-gray-600 dark:text-gray-400">
                    Your post will appear in Explore and Friends feeds
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setVisibility('friends_only')}
                className={`flex-row items-center p-4 rounded-xl ${
                  visibility === 'friends_only'
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
                }`}
              >
                <Ionicons
                  name={visibility === 'friends_only' ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={visibility === 'friends_only' ? '#F59E0B' : '#9CA3AF'}
                />
                <View className="ml-3 flex-1">
                  <Text className="typography-label text-gray-900 dark:text-white font-semibold">
                    👥 Friends Only
                  </Text>
                  <Text className="typography-caption text-gray-600 dark:text-gray-400">
                    Only your friends can see this post
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Post Button */}
            <TouchableOpacity
              onPress={handlePost}
              disabled={!isValid || loading}
              className={`rounded-2xl py-4 items-center shadow-lg ${
                isValid && !loading
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="send" size={20} color="white" />
                  <Text className="typography-label text-white font-bold ml-2">
                    Share Post
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Tips */}
            <View className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <Text className="typography-label text-blue-900 dark:text-blue-100 font-semibold mb-2">
                💡 Tips for Great Posts
              </Text>
              <Text className="typography-caption text-blue-800 dark:text-blue-200 mb-1">
                • Share your team builds and strategies
              </Text>
              <Text className="typography-caption text-blue-800 dark:text-blue-200 mb-1">
                • Ask questions and help other trainers
              </Text>
              <Text className="typography-caption text-blue-800 dark:text-blue-200 mb-1">
                • Celebrate your achievements
              </Text>
              <Text className="typography-caption text-blue-800 dark:text-blue-200">
                • Be respectful and have fun! 🎉
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Container>
    </>
  );
}
