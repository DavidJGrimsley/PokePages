import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import Marker from './Marker';
import { useFilters } from '../../hooks/useFilters';
import { useMarkers } from '../../context/MarkersContext';

const { width, height } = Dimensions.get('window');

const ZoomableMap = () => {
  const [scale, setScale] = useState(new Animated.Value(1));
  const [translateX, setTranslateX] = useState(new Animated.Value(0));
  const [translateY, setTranslateY] = useState(new Animated.Value(0));
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const { filteredMarkers } = useFilters();
  const { markers } = useMarkers();

  useEffect(() => {
    // Reset scale and translation on mount
    setScale(new Animated.Value(1));
    translateX.setValue(0);
    translateY.setValue(0);
  }, []);

  const handleZoomIn = () => {
    Animated.spring(scale, {
      toValue: scale._value + 0.1,
      useNativeDriver: false,
    }).start();
  };

  const handleZoomOut = () => {
    Animated.spring(scale, {
      toValue: scale._value - 0.1 > 1 ? scale._value - 0.1 : 1,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          transform: [
            { scale },
            { translateX },
            { translateY },
          ],
        }}
        {...panResponder.panHandlers}
      >
        {/* Render the map background here */}
        <View style={styles.mapBackground} />
        {filteredMarkers.map(marker => (
          <Marker key={marker.id} marker={marker} />
        ))}
      </Animated.View>
      {/* Add zoom in and zoom out buttons here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  mapBackground: {
    width: width,
    height: height,
    backgroundColor: '#e0e0e0', // Placeholder for map background color
  },
});

export default ZoomableMap;