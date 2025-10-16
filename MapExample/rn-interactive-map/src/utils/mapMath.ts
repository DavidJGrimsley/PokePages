import { LatLng } from 'react-native-maps';

// Function to calculate the distance between two geographical points
export function calculateDistance(point1: LatLng, point2: LatLng): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) * Math.cos(toRad(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Function to convert map coordinates to screen coordinates
export function mapToScreenCoordinates(mapWidth: number, mapHeight: number, lat: number, lng: number, bounds: { northEast: LatLng; southWest: LatLng }): { x: number; y: number } {
  const latRange = bounds.northEast.latitude - bounds.southWest.latitude;
  const lngRange = bounds.northEast.longitude - bounds.southWest.longitude;

  const x = ((lng - bounds.southWest.longitude) / lngRange) * mapWidth;
  const y = ((bounds.northEast.latitude - lat) / latRange) * mapHeight;

  return { x, y };
}

// Function to scale a value based on the zoom level
export function scaleValue(value: number, zoomLevel: number): number {
  return value * Math.pow(2, zoomLevel);
}