import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import { FilterBar } from '../components/Map/FilterBar';
import { FiltersProvider } from '../context/Map/FiltersContext';
import { MarkersProvider } from '../context/Map/MarkersContext';
import { ZoomableMap } from '../components/Map/ZoomableMap';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapFullscreen() {
  const router = useRouter();

  return (
    <FiltersProvider>
      <MarkersProvider>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          {/* Hide status bar for immersive fullscreen */}
          <StatusBar hidden style="light" />
          <FilterBar />
          {/* Render map regardless, orientationReady only affects lock */}
          <ZoomableMap />

          {/* Top-right close button */}
          <View style={styles.topRight}>
            <TouchableOpacity style={styles.fab} onPress={() => router.back()}>
              <Text style={styles.fabText}>✕</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </MarkersProvider>
    </FiltersProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1020',
  },
  topRight: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
});
