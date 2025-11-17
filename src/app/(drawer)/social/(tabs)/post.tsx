import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import Head from 'expo-router/head';
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
import SuccessMessage from 'components/UI/SuccessMessage';
import { HashtagInput } from 'components/Social/HashtagInput';
import { MediaPicker } from 'components/Social/MediaPicker';
import { useAuthStore } from '~/store/authStore';
import * as socialApi from '~/utils/socialApi';
import { uploadImages, uploadVideo } from '~/utils/storageApi';
import { Footer } from '@/src/components/Meta/Footer';

export default function CreatePostTab() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'friends_only'>('public');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const handleMediaSelected = (images: string[], video: string | null) => {
    setSelectedImages(images);
    setSelectedVideo(video);
  };

  const handlePost = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to create a post');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please write something before posting');
      return;
    }

    const traceId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[CreatePost:${traceId}] 🔔 User pressed Share Post`, {
      userId: user.id,
      hasImages: selectedImages.length > 0,
      imageCount: selectedImages.length,
      hasVideo: !!selectedVideo,
      contentLength: content.length,
      visibility,
      hashtags,
    });

    setLoading(true);
    try {
      console.log(`[CreatePost:${traceId}] 📝 Starting createPost flow`);
      
      let uploadedImageUrls: string[] = [];
      let uploadedVideoUrl: string | null = null;

      // Upload images if selected
      if (selectedImages.length > 0) {
        console.log(`[CreatePost:${traceId}] 📸 Uploading`, selectedImages.length, 'images...', selectedImages);
        setUploadProgress(`Uploading ${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}...`);

        const uploadStart = Date.now();
        const results = await uploadImages(selectedImages, user.id, 'posts');
        const uploadDuration = Date.now() - uploadStart;
        console.log(`[CreatePost:${traceId}] ✅ Images uploaded in ${uploadDuration}ms`, results);
        uploadedImageUrls = results.map(r => r.url);
      }

      // Upload video if selected
      if (selectedVideo) {
        console.log(`[CreatePost:${traceId}] 🎥 Uploading video:`, selectedVideo);
        setUploadProgress('Uploading video...');
        
        // Default to 30 seconds max duration for video validation
        const uploadStart = Date.now();
        const result = await uploadVideo(selectedVideo, user.id, 30, 'posts');
        const uploadDuration = Date.now() - uploadStart;
        console.log(`[CreatePost:${traceId}] ✅ Video uploaded in ${uploadDuration}ms`, result);
        uploadedVideoUrl = result.url;
      }

      setUploadProgress('Creating post...');
      const apiStart = Date.now();
      const response = await socialApi.createPost(
        user.id, 
        content.trim(), 
        visibility, 
        undefined, 
        hashtags,
        uploadedImageUrls,
        uploadedVideoUrl
      );
      const apiDuration = Date.now() - apiStart;
      console.log(`[CreatePost:${traceId}] ✅ Post created successfully in ${apiDuration}ms`, response);
      
      // Clear form and show success
      setContent('');
      setHashtags([]);
      setSelectedImages([]);
      setSelectedVideo(null);
      setUploadProgress('');
      setShowSuccess(true);
      
      // Auto-hide success message and optionally navigate
      setTimeout(() => {
        setShowSuccess(false);
        // Optionally auto-navigate to feed after 2 seconds
        // router.push('/social');
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      console.error(`[CreatePost:${traceId}] ❌ Error during post creation`, error);
      setUploadProgress('');
      if (Platform.OS === 'web') {
        // For web, use window.alert as fallback
        window.alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const charCount = content.length;
  const maxChars = 5000;
  const isValid = content.trim().length > 0 && charCount <= maxChars;

  // SEO meta content
  const title = 'Create Post | Share Your Pokémon Adventure | PokePages';
  const description = 'Share your Pokémon journey with the community. Post updates, strategies, team builds, and connect with fellow trainers on Poké Pages.';
  const keywords = 'create pokemon post, share pokemon, trainer posts, pokemon social';

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
        <meta property="og:url" content="https://pokepages.app/social/post" />
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
        <meta name="robots" content="noindex, nofollow" />
      </Head>
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

            {/* Media Picker */}
            <MediaPicker onMediaSelected={handleMediaSelected} maxImages={5} />

            {/* Hashtags Section */}
            <HashtagInput
              selectedHashtags={hashtags}
              onHashtagsChange={setHashtags}
              maxHashtags={5}
            />

            
            {/* Success Message */}
            {showSuccess && (
              <View className="mt-4">
                <SuccessMessage
                  title="✅ Post Shared!"
                  message="Your post is now live in the feed!"
                  showAnimation={true}
                />
                <TouchableOpacity
                  onPress={() => router.push('/social/feed')}
                  className="mt-4 bg-amber-500 rounded-xl py-3 items-center"
                >
                  <Text className="typography-label text-white font-semibold">
                    View in Feed
                  </Text>
                </TouchableOpacity>
              </View>
            )}


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
                <View className="flex-col items-center">
                  <ActivityIndicator color="white" />
                  {uploadProgress && (
                    <Text className="typography-caption text-white mt-2">
                      {uploadProgress}
                    </Text>
                  )}
                </View>
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
                • Be respectful and have fun! 🎉
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
              <Text className="typography-label text-blue-900 dark:text-blue-100 font-semibold mb-2">
                🚫 Community Guidelines
              </Text>
              <Text className="typography-caption text-blue-800 dark:text-blue-200 mb-1">
                • Posts cannot contain hate speech, harassment, or explicit content
              </Text>
              <Text className="typography-caption text-blue-800 dark:text-blue-200 mb-1">
                • Bo trolling, wasting people&apos;s time, or spamming
              </Text>
            </View>
            <Footer />
          </ScrollView>
        </KeyboardAvoidingView>
      </Container>
    </>
  );
}
