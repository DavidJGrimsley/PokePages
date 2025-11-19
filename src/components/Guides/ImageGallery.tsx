import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, Image, Dimensions, ImageSourcePropType } from 'react-native';
import { AppText } from '../TextTheme/AppText';
import { Ionicons } from '@expo/vector-icons';
import { StrategyPic } from '@/src/types/strategy';

// Helper function to resolve image sources
const getImageSource = (src: string): ImageSourcePropType => {
  // Map of known image paths to their require statements
  const imageMap: Record<string, ImageSourcePropType> = {
    'assets/PLZA/TradeCodes_PlZA.png': require('../../../assets/PLZA/TradeCodes_PlZA.png'),
    // Add more mappings here as needed
  };

  return imageMap[src] || imageMap['assets/PLZA/TradeCodes_PlZA.png'];
};

interface ImageGalleryProps {
  pics: StrategyPic[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ pics }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (!pics || pics.length === 0) {
    return null;
  }

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  const selectedPic = selectedImageIndex !== null ? pics[selectedImageIndex] : null;
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  return (
    <>
      <View className="w-full mt-4 space-y-3">
        {pics.map((pic, index) => {
          const imageSource = getImageSource(pic.src);
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleImagePress(index)}
              activeOpacity={0.8}
              accessibilityLabel={`View ${pic.caption || 'image'} in fullscreen`}
              accessibilityRole="button"
            >
              <View className="w-full">
                <Image
                  source={imageSource}
                  style={{ width: '100%', height: 300 }}
                  resizeMode="contain"
                />
                {pic.caption && (
                  <AppText className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                    {pic.caption}
                  </AppText>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Fullscreen Modal */}
      {selectedPic && (
        <Modal
          visible={selectedImageIndex !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseModal}
        >
          <View className="flex-1 bg-black/95 justify-center items-center">
            {/* Close Button */}
            <TouchableOpacity
              onPress={handleCloseModal}
              className="absolute top-12 right-4 z-20 bg-black/50 rounded-full p-3"
              accessibilityLabel="Close fullscreen view"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>

            {/* Fullscreen Image */}
            <Image
              source={getImageSource(selectedPic.src)}
              style={{
                width: screenWidth,
                height: screenHeight * 0.8,
              }}
              resizeMode="contain"
            />

            {/* Caption */}
            {selectedPic.caption && (
              <View className="absolute bottom-12 left-0 right-0 px-6">
                <AppText className="text-base text-white text-center bg-black/70 p-4 rounded-lg">
                  {selectedPic.caption}
                </AppText>
              </View>
            )}
          </View>
        </Modal>
      )}
    </>
  );
};
