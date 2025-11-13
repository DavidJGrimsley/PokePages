import React, { useState, useCallback } from 'react';
import { View, Image, Pressable, Modal, StyleSheet, useWindowDimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';

interface MediaGalleryProps {
  imageUrls?: string[];
  videoUrl?: string | null;
}

export function MediaGallery({ imageUrls = [], videoUrl = null }: MediaGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const { width: windowWidth } = useWindowDimensions();
  const player = useVideoPlayer((videoUrl ? { uri: videoUrl } : undefined) as any, (player: any) => {
    if (videoUrl) {
      player.loop = true;
    }
  });
  
  // Calculate available width (accounting for container padding)
  // On narrow screens, use full width minus padding
  // On wider screens, cap at a reasonable max width (800px for better desktop viewing)
  const maxWidth = Math.min(windowWidth - 32, 800); // 32px for padding, max 800px
  const screenWidth = maxWidth;
  const imageCount = imageUrls.length;

  const handleImagePress = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const handlePrevImage = useCallback(() => {
    setSelectedImageIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNextImage = useCallback(() => {
    setSelectedImageIndex(prev => (prev !== null && prev < imageCount - 1 ? prev + 1 : prev));
  }, [imageCount]);

  // Don't render if no media
  if (!videoUrl && imageUrls.length === 0) {
    return null;
  }

  // Calculate image dimensions based on count
  const getImageStyle = (index: number) => {
    if (imageCount === 1) {
      return { width: screenWidth, height: 300 };
    } else if (imageCount === 2) {
      return { width: screenWidth / 2 - 4, height: 200 };
    } else if (imageCount === 3) {
      if (index === 0) {
        return { width: screenWidth, height: 200 };
      }
      return { width: screenWidth / 2 - 4, height: 150 };
    } else if (imageCount === 4) {
      return { width: screenWidth / 2 - 4, height: 150 };
    } else {
      // 5 images: 2 on top, 3 on bottom
      if (index < 2) {
        return { width: screenWidth / 2 - 4, height: 150 };
      }
      return { width: screenWidth / 3 - 6, height: 120 };
    }
  };

  return (
    <View className="mb-4" style={{ maxWidth: '100%' }}>
      {/* Video Display */}
      {videoUrl && (
        <VideoView
          player={player}
          style={{ width: screenWidth, height: 300, maxWidth: '100%' }}
          className="rounded-2xl border-2 border-purple-300"
          nativeControls
          contentFit="cover"
          allowsFullscreen
          allowsPictureInPicture
        />
      )}

      {/* Images Display */}
      {imageUrls.length > 0 && (
        <View className="flex-row flex-wrap gap-2" style={{ maxWidth: '100%' }}>
          {imageUrls.map((url, index) => (
            <Pressable
              key={index}
              onPress={() => handleImagePress(index)}
              style={{ maxWidth: '100%' }}
            >
              <Image
                source={{ uri: url }}
                style={[getImageStyle(index), { maxWidth: '100%' }]}
                className="rounded-2xl border-2 border-amber-300"
                resizeMode="cover"
              />
              {imageCount > 1 && (
                <View className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-1">
                  <Ionicons name="images" size={12} color="white" />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Full Screen Image Modal */}
      {selectedImageIndex !== null && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseModal}
          statusBarTranslucent
        >
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Ionicons name="close-circle" size={40} color="white" />
            </Pressable>

            <Image
              source={{ uri: imageUrls[selectedImageIndex] }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />

            {/* Navigation arrows for multiple images */}
            {imageCount > 1 && (
              <>
                {selectedImageIndex > 0 && (
                  <Pressable
                    style={styles.leftArrow}
                    onPress={handlePrevImage}
                  >
                    <Ionicons name="chevron-back" size={40} color="white" />
                  </Pressable>
                )}
                {selectedImageIndex < imageCount - 1 && (
                  <Pressable
                    style={styles.rightArrow}
                    onPress={handleNextImage}
                  >
                    <Ionicons name="chevron-forward" size={40} color="white" />
                  </Pressable>
                )}
              </>
            )}

            {/* Image counter */}
            {imageCount > 1 && (
              <View style={styles.imageCounter}>
                <View className="bg-black/60 rounded-full px-4 py-2">
                  <Ionicons name="images" size={16} color="white" />
                  <View className="absolute top-0 right-0 bg-amber-500 rounded-full px-2">
                    <View className="typography-caption text-white font-bold">
                      {selectedImageIndex + 1}/{imageCount}
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  leftArrow: {
    position: 'absolute',
    left: 20,
    top: '50%',
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
  },
  rightArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
});
