import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Marker as MarkerType } from '../../context/Map/MarkersContext';

interface MarkerProps {
  marker: MarkerType;
  onPress: (id: string) => void;
  scale: number;
  mapWidth: number;
  mapHeight: number;
}

export const Marker: React.FC<MarkerProps> = ({ marker, onPress, scale, mapWidth, mapHeight }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'buildings':
        return '🏢';
      case 'ruins':
        return '🏛️';
      case 'fastTravel':
        return '✈️';
      case 'other':
        return '⭐';
      default:
        return '📍';
    }
  };

  // Convert percentage coordinates to actual pixel positions
  const left = (marker.coordinates.x / 100) * mapWidth;
  const top = (marker.coordinates.y / 100) * mapHeight;

  return (
    <TouchableOpacity
      style={[
        styles.marker,
        {
          left: left - 20, // Center the marker (marker width / 2)
          top: top - 20,   // Center the marker (marker height / 2)
          transform: [{ scale: 1 / scale }],
        },
        marker.completed && styles.completedMarker,
      ]}
      onPress={() => onPress(marker.id)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getCategoryIcon(marker.category)}</Text>
      </View>
      {marker.completed && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    fontSize: 20,
  },
  completedMarker: {
    opacity: 0.6,
  },
  checkmark: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
