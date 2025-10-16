import React from 'react';
import { View } from 'react-native';
import ZoomableMap from '../components/map/ZoomableMap';
import FilterBar from '../components/map/FilterBar';
import { FiltersProvider } from '../context/FiltersContext';
import { MarkersProvider } from '../context/MarkersContext';

const MapScreen = () => {
  return (
    <FiltersProvider>
      <MarkersProvider>
        <View style={{ flex: 1 }}>
          <FilterBar />
          <ZoomableMap />
        </View>
      </MarkersProvider>
    </FiltersProvider>
  );
};

export default MapScreen;