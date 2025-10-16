import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FiltersProvider } from '../../../../context/Map/FiltersContext';
import { MarkersProvider } from '../../../../context/Map/MarkersContext';
import { FilterBar } from '../../../../components/Map/FilterBar';
import { ZoomableMap } from '../../../../components/Map/ZoomableMap';

export default function Map() {
  return (
    <FiltersProvider>
      <MarkersProvider>
        <View style={styles.container}>
          <FilterBar />
          <ZoomableMap />
        </View>
      </MarkersProvider>
    </FiltersProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
