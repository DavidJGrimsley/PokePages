import { Marker } from '../../context/Map/MarkersContext';

/**
 * Lumiose City Map Markers
 * 
 * Coordinates are percentage-based (0-100 for both x and y)
 * The map is circular, so markers should be placed within the circle
 */
export const lumioseCityMarkers: Marker[] = [
  // Center Plaza
  {
    id: 'center-plaza',
    name: 'Central Plaza',
    category: 'fastTravel',
    coordinates: { x: 50, y: 50 },
    completed: false,
    description: 'The heart of Lumiose City'
  },
  
  // Pokemon Centers - placed in different districts
  {
    id: 'pokecenter-north',
    name: 'Pokemon Center - North District',
    category: 'buildings',
    coordinates: { x: 50, y: 20 },
    completed: false,
    description: 'Heal your Pokemon and access PC storage'
  },
  {
    id: 'pokecenter-south',
    name: 'Pokemon Center - South District',
    category: 'buildings',
    coordinates: { x: 50, y: 80 },
    completed: false,
    description: 'Heal your Pokemon and access PC storage'
  },
  {
    id: 'pokecenter-east',
    name: 'Pokemon Center - East District',
    category: 'buildings',
    coordinates: { x: 75, y: 50 },
    completed: false,
    description: 'Heal your Pokemon and access PC storage'
  },
  {
    id: 'pokecenter-west',
    name: 'Pokemon Center - West District',
    category: 'buildings',
    coordinates: { x: 25, y: 50 },
    completed: false,
    description: 'Heal your Pokemon and access PC storage'
  },

  // Poke Marts
  {
    id: 'pokemart-main',
    name: 'Poke Mart - Main Branch',
    category: 'buildings',
    coordinates: { x: 60, y: 45 },
    completed: false,
    description: 'Buy items and supplies'
  },

  // Fast Travel Points - Around the outer ring
  {
    id: 'ft-north-gate',
    name: 'North Gate',
    category: 'fastTravel',
    coordinates: { x: 50, y: 10 },
    completed: false,
    description: 'Northern entrance to the city'
  },
  {
    id: 'ft-south-gate',
    name: 'South Gate',
    category: 'fastTravel',
    coordinates: { x: 50, y: 90 },
    completed: false,
    description: 'Southern entrance to the city'
  },
  {
    id: 'ft-east-gate',
    name: 'East Gate',
    category: 'fastTravel',
    coordinates: { x: 85, y: 50 },
    completed: false,
    description: 'Eastern entrance to the city'
  },
  {
    id: 'ft-west-gate',
    name: 'West Gate',
    category: 'fastTravel',
    coordinates: { x: 15, y: 50 },
    completed: false,
    description: 'Western entrance to the city'
  },

  // Ruins and Points of Interest
  {
    id: 'ruins-ancient',
    name: 'Ancient Ruins',
    category: 'ruins',
    coordinates: { x: 35, y: 35 },
    completed: false,
    description: 'Mysterious ancient structure with historical significance'
  },
  {
    id: 'ruins-tower',
    name: 'Prism Tower',
    category: 'ruins',
    coordinates: { x: 50, y: 55 },
    completed: false,
    description: 'Iconic landmark of Lumiose City'
  },

  // Special Items and Collectibles
  {
    id: 'item-rare-candy',
    name: 'Hidden Rare Candy',
    category: 'other',
    coordinates: { x: 65, y: 65 },
    completed: false,
    description: 'A rare candy hidden in the city'
  },
  {
    id: 'item-tm-location',
    name: 'TM Location',
    category: 'other',
    coordinates: { x: 40, y: 60 },
    completed: false,
    description: 'Find a powerful TM here'
  },
];

/**
 * Helper function to add custom markers
 * Use this template when adding new locations
 */
export const createMarker = (
  id: string,
  name: string,
  category: 'buildings' | 'ruins' | 'fastTravel' | 'other',
  x: number,
  y: number,
  description?: string
): Marker => ({
  id,
  name,
  category,
  coordinates: { x, y },
  completed: false,
  description,
});
