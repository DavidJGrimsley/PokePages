import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';

interface MarkerProps {
  id: string;
  title: string;
  description: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  onMarkerPress: (id: string) => void;
  isComplete: boolean;
}

const Marker: React.FC<MarkerProps> = ({ id, title, description, coordinate, onMarkerPress, isComplete }) => {
  const markerImage = isComplete ? require('../../../assets/markers/svg/marker-complete.svg') : require('../../../assets/markers/svg/marker-incomplete.svg');

  return (
    <TouchableOpacity onPress={() => onMarkerPress(id)}>
      <View style={{ position: 'absolute', top: coordinate.latitude, left: coordinate.longitude }}>
        <Image source={markerImage} style={{ width: 30, height: 30 }} />
      </View>
    </TouchableOpacity>
  );
};

export default Marker;