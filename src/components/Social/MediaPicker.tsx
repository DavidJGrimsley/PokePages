import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Alert, ScrollView, Dimensions, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';

interface MediaPickerProps {
  onMediaSelected: (images: string[], video: string | null) => void;
  maxImages?: number;
}

export function MediaPicker({ onMediaSelected, maxImages = 5 }: MediaPickerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const screenWidth = Dimensions.get('window').width;
  const imageSize = (screenWidth - 64) / 3; // 3 images per row with padding

  const pickImages = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7, // More aggressive compression for faster uploads
        selectionLimit: maxImages,
      });

      if (!result.canceled) {
        const selectedImages = result.assets.map(asset => asset.uri);
        
        // Check if we already have a video
        if (video) {
          Alert.alert(
            'Cannot Mix Media',
            'Posts can contain either images OR a video, not both. Remove the video first.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Check if total would exceed max
        if (images.length + selectedImages.length > maxImages) {
          Alert.alert(
            'Too Many Images',
            `You can only add up to ${maxImages} images per post`,
            [{ text: 'OK' }]
          );
          return;
        }

        const newImages = [...images, ...selectedImages].slice(0, maxImages);
        setImages(newImages);
        onMediaSelected(newImages, null);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const pickVideo = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      // Check if we already have images
      if (images.length > 0) {
        Alert.alert(
          'Cannot Mix Media',
          'Posts can contain either images OR a video, not both. Remove the images first.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch video picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedVideo = result.assets[0];
        
        // Check duration (if available)
        if (selectedVideo.duration && selectedVideo.duration > 30000) { // 30 seconds in ms
          Alert.alert(
            'Video Too Long',
            'Videos must be 30 seconds or less',
            [{ text: 'OK' }]
          );
          return;
        }

        setVideo(selectedVideo.uri);
        onMediaSelected([], selectedVideo.uri);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onMediaSelected(newImages, null);
  };

  const removeVideo = () => {
    setVideo(null);
    onMediaSelected([], null);
  };

  const clearAll = () => {
    setImages([]);
    setVideo(null);
    onMediaSelected([], null);
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-lg border border-gray-100 dark:border-gray-700">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="typography-label text-gray-900 dark:text-white font-semibold">
          📸 Add Media
        </Text>
        {(images.length > 0 || video) && (
          <TouchableOpacity onPress={clearAll} className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
            <Text className="typography-caption text-red-600 dark:text-red-400 font-semibold">
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-3">
        <TouchableOpacity
          onPress={pickImages}
          disabled={video !== null}
          className={`flex-1 flex-row items-center justify-center p-3 rounded-xl border-2 ${
            video
              ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
          }`}
        >
          <Ionicons
            name="images"
            size={20}
            color={video ? '#9CA3AF' : '#F59E0B'}
          />
          <Text
            className={`typography-label ml-2 font-semibold ${
              video ? 'text-gray-400' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            Images
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickVideo}
          disabled={images.length > 0}
          className={`flex-1 flex-row items-center justify-center p-3 rounded-xl border-2 ${
            images.length > 0
              ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              : 'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
          }`}
        >
          <Ionicons
            name="videocam"
            size={20}
            color={images.length > 0 ? '#9CA3AF' : '#A855F7'}
          />
          <Text
            className={`typography-label ml-2 font-semibold ${
              images.length > 0 ? 'text-gray-400' : 'text-purple-600 dark:text-purple-400'
            }`}
          >
            Video
          </Text>
        </TouchableOpacity>
      </View>

      {/* Constraints Info */}
      <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-3">
        <Text className="typography-caption text-blue-800 dark:text-blue-200 mb-1">
          💡 You can add up to {maxImages} images OR 1 video (max 30s)
        </Text>
        <Text className="typography-caption text-blue-800 dark:text-blue-200">
          📸 Images are automatically compressed for fast uploads
        </Text>
      </View>

      {/* Selected Images Preview */}
      {images.length > 0 && (
        <View className="mb-2">
          <Text className="typography-caption text-gray-600 dark:text-gray-400 mb-2">
            {images.length} / {maxImages} images selected
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {images.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    style={{ width: imageSize, height: imageSize }}
                    className="rounded-xl border-2 border-amber-300"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    style={{ elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Selected Video Preview */}
      {video && (
        <VideoPreview uri={video} onRemove={removeVideo} />
      )}
    </View>
  );
}

function VideoPreview({ uri, onRemove }: { uri: string; onRemove: () => void }) {
  const player = useVideoPlayer(uri, (player: any) => {
    // no looping for preview; controls on
  });
  return (
    <View className="mb-2">
      <Text className="typography-caption text-gray-600 dark:text-gray-400 mb-2">
        Video selected
      </Text>
      <View className="relative">
        <VideoView
          player={player}
          style={{ width: '100%', height: 200 }}
          className="rounded-xl border-2 border-purple-300"
          nativeControls
          contentFit="cover"
          allowsFullscreen
          allowsPictureInPicture
        />
        <TouchableOpacity
          onPress={onRemove}
          className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
          style={{ elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
        >
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
