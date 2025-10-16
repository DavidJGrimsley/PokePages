# Lumiose City Interactive Map Setup Guide

## ✅ Setup Checklist

### 1. Save the Map Image
Save the circular Lumiose City map image to:
```
f:\ReactNativeApps\PokePages\assets\maps\lumiose-city-map.jpg
```

### 2. Files Created
The following files have been created for the interactive map:

#### Components
- ✅ `src/components/Map/ZoomableMap.tsx` - Main zoomable map view
- ✅ `src/components/Map/FilterBar.tsx` - Filter buttons
- ✅ `src/components/Map/Marker.tsx` - Map markers
- ✅ `src/components/Map/index.ts` - Component exports

#### Context
- ✅ `src/context/Map/FiltersContext.tsx` - Filter state management
- ✅ `src/context/Map/MarkersContext.tsx` - Markers and completion tracking

#### Data
- ✅ `src/data/Map/categories.ts` - Category definitions
- ✅ `src/data/Map/lumioseCityMarkers.ts` - All map markers with coordinates

#### Hooks
- ✅ `src/hooks/Map/useFilters.ts` - Filter logic

### 3. Test the Map
1. Navigate to the map in your app: **Guides → PLZA → Map**
2. You should see:
   - The circular Lumiose City map
   - Filter buttons at the top (Everything, Buildings, Ruins, Fast Travel, Other)
   - Markers placed on the map
   - Zoom controls on the right side

### 4. Features Available

#### Gestures
- 👆 **Pinch** to zoom in/out
- ✋ **Pan** to move around the map
- 👆 **Tap markers** to see details

#### Filters
- **Everything** - Show all markers
- **Buildings** - Pokemon Centers and Poke Marts (🏢)
- **Ruins** - Ancient ruins and landmarks (🏛️)
- **Fast Travel** - Gates and travel points (✈️)
- **Other** - Hidden items and collectibles (⭐)

#### Marker Completion
- Tap any marker to mark it as complete/incomplete
- Completed markers show a green checkmark ✓
- Completed markers are slightly faded

### 5. Adding More Markers

Edit `src/data/Map/lumioseCityMarkers.ts` to add new locations:

```typescript
{
  id: 'unique-id',
  name: 'Location Name',
  category: 'buildings', // or 'ruins', 'fastTravel', 'other'
  coordinates: { x: 50, y: 50 }, // Percentage (0-100)
  completed: false,
  description: 'Description shown when tapped'
}
```

#### Coordinate System
- **x**: 0 (left) to 100 (right)
- **y**: 0 (top) to 100 (bottom)
- **Center**: { x: 50, y: 50 }

#### Example Positions for Circular Map
```
           { x: 50, y: 10 }  // Top
                  ⬆️
{ x: 15, y: 50 } ⬅️  🎯  ➡️ { x: 85, y: 50 }
                  ⬇️
          { x: 50, y: 90 }  // Bottom
```

### 6. Customization

#### Change Map Size
Edit `src/components/Map/ZoomableMap.tsx`:
```typescript
const MAP_WIDTH = width * 2; // Change multiplier (currently 2x screen width)
const MAP_HEIGHT = MAP_WIDTH; // Square map
```

#### Change Marker Icons
Edit `src/components/Map/Marker.tsx`:
```typescript
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'buildings': return '🏢';
    // Change emojis here
  }
};
```

#### Add New Categories
1. Add to `src/data/Map/categories.ts`
2. Update filter in `src/components/Map/FilterBar.tsx`
3. Update icon in `src/components/Map/Marker.tsx`

### 7. Troubleshooting

**Map not showing?**
- Make sure image is saved to `assets/maps/lumiose-city-map.jpg`
- Check the file name is exactly correct (case-sensitive)

**Markers in wrong position?**
- Coordinates are percentages (0-100, not pixels)
- Center of map is { x: 50, y: 50 }

**Can't zoom/pan?**
- Make sure react-native-gesture-handler is installed
- Check that GestureHandlerRootView wraps the app

## 🎮 Ready to Use!

Once the image is saved, navigate to:
**App → Guides → PLZA → Map**

Enjoy exploring Lumiose City! 🗺️
