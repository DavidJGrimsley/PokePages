import React from 'react';
import { View, StyleSheet, useWindowDimensions, TouchableOpacity, Text, Alert } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Marker } from './Marker';
import { useFilters } from '../../hooks/Map/useFilters';
import { useMarkers } from '../../context/Map/MarkersContext';
import { useRouter, usePathname } from 'expo-router';

// Map configuration
// Use a static require so Metro bundles the local image correctly
const MAP_IMAGE = require('../../../assets/PLZA/maps/lumiose-city-map.jpg');

export const ZoomableMap: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isInFullscreen = pathname.includes('fullscreen');
  const { width, height } = useWindowDimensions();
  const MAP_WIDTH = width; // Map fits to screen width
  const MAP_HEIGHT = Math.min(height * 0.85, width * 1.2); // Constrain height, slightly taller than square

  // Start at 1:1 scale (normal size, not zoomed out)
  const initialScale = 1;

  const scale = useSharedValue(initialScale);
  const savedScale = useSharedValue(initialScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const { filteredMarkers } = useFilters();
  const { toggleCompletion } = useMarkers();

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const handleZoomIn = () => {
    const next = Math.min(savedScale.value * 1.2, 6);
    scale.value = withSpring(next);
    savedScale.value = next;
  };

  const handleZoomOut = () => {
    const next = Math.max(savedScale.value * 0.8, initialScale);
    scale.value = withSpring(next);
    savedScale.value = next;
  };

  const handleReset = () => {
    scale.value = withSpring(initialScale);
    savedScale.value = initialScale;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const handleMarkerPress = (id: string) => {
    const marker = filteredMarkers.find(m => m.id === id);
    if (marker) {
      Alert.alert(
        marker.name,
        marker.description || 'No description available',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: marker.completed ? 'Mark Incomplete' : 'Mark Complete',
            onPress: () => toggleCompletion(id),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapViewport}>
        <GestureDetector gesture={composed}>
          <Animated.View style={[{ width: MAP_WIDTH, height: MAP_HEIGHT }, animatedStyle]}>
            <Image
              source={MAP_IMAGE}
              style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
              contentFit="cover"
            />
            {filteredMarkers.map((marker) => (
              <Marker
                key={marker.id}
                marker={marker}
                onPress={handleMarkerPress}
                scale={savedScale.value}
                mapWidth={MAP_WIDTH}
                mapHeight={MAP_HEIGHT}
              />
            ))}
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={handleZoomIn}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleZoomOut}>
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>⟲</Text>
        </TouchableOpacity>
        {!isInFullscreen && (
          <TouchableOpacity style={styles.button} onPress={() => router.push('/map-fullscreen')}>
            <Text style={styles.buttonText}>⛶</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  mapViewport: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    gap: 8,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});
