import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Frame } from '../UI/Frame';
import { AppText } from '../TextTheme/AppText';
import { Ionicons } from '@expo/vector-icons';

interface VideoCarouselProps {
  videoIds: string[];
  isMobile?: boolean;
}

export const VideoCarousel: React.FC<VideoCarouselProps> = ({ videoIds, isMobile = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!videoIds || videoIds.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? videoIds.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === videoIds.length - 1 ? 0 : prev + 1));
  };

  const showNavigationButtons = videoIds.length > 1;

  return (
    <View className="w-full mt-4 mb-4">
      <View className="relative items-center justify-center">
        {/* Previous Button */}
        {showNavigationButtons && (
          <TouchableOpacity
            onPress={handlePrevious}
            className="absolute left-0 z-10 bg-black/50 rounded-full p-2 top-1/2 -translate-y-1/2"
            style={{ transform: [{ translateY: -20 }] }}
            accessibilityLabel="Previous video"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        )}

        {/* Video Frame */}
        <Frame
          src={`https://www.youtube.com/embed/${videoIds[currentIndex]}`}
          title="YouTube video player"
          width={isMobile ? '100%' : 560}
          height={isMobile ? 200 : 315}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          className="rounded-lg shadow-lg"
        />

        {/* Next Button */}
        {showNavigationButtons && (
          <TouchableOpacity
            onPress={handleNext}
            className="absolute right-0 z-10 bg-black/50 rounded-full p-2 top-1/2 -translate-y-1/2"
            style={{ transform: [{ translateY: -20 }] }}
            accessibilityLabel="Next video"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Video Counter */}
      {showNavigationButtons && (
        <AppText className="text-center text-sm mt-2 text-gray-600 dark:text-gray-400">
          Video {currentIndex + 1} of {videoIds.length}
        </AppText>
      )}
    </View>
  );
};
