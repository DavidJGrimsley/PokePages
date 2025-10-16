# Interactive Map for Pokemon Legends Z-A

## Overview
This interactive map allows users to view points of interest in Pokemon Legends Z-A with filtering, zooming, and completion tracking.

## Features
- ✅ **Zoomable & Draggable Map**: Pinch to zoom, pan to move around
- ✅ **Filter System**: Filter by Buildings, Ruins, Fast Travel locations, and Other items
- ✅ **Completion Tracking**: Mark items as complete/incomplete
- ✅ **Interactive Markers**: Tap markers to see details and toggle completion

## How to Add Your Own Map Image

### Recommended Image Formats

1. **PNG (Recommended for static maps)**
   - High quality, good compression
   - Supports transparency
   - Best for: 2000x2000px to 4000x4000px maps
   - File size: 2-10MB typically

2. **JPG (For larger maps)**
   - Better compression for very large images
   - No transparency
   - Best for: Photos or scanned maps
   - File size: 1-5MB typically

3. **SVG (For vector maps)**
   - Infinite scaling without quality loss
   - Best for: Hand-drawn or vector-based maps
   - Smallest file size
   - Requires additional library: `react-native-svg`

### Steps to Add Your Map

1. **Add your map image to the assets folder:**
   ```
   assets/maps/plza-map.png
   ```

2. **Update `ZoomableMap.tsx`:**
   ```tsx
   import { Image } from 'react-native';
   
   // Replace the placeholder View with:
   <Image 
     source={require('../../../assets/maps/plza-map.png')}
     style={styles.mapBackground}
     resizeMode="contain"
   />
   ```

3. **Adjust the coordinates:**
   - Open `src/context/Map/MarkersContext.tsx`
   - Update marker coordinates based on your map dimensions
   - Coordinates are in pixels from top-left (0,0)

### Map Image Recommendations

- **Resolution**: 2048x2048px or larger for high quality
- **Format**: PNG with transparency or JPG
- **Color**: High contrast colors for better readability
- **Labels**: Remove in-game labels if you want to use custom markers

## Adding New Markers

Edit `src/context/Map/MarkersContext.tsx`:

```tsx
{
  id: '5',
  name: 'New Location',
  category: 'buildings', // buildings, ruins, fastTravel, other
  coordinates: { x: 200, y: 250 }, // Pixel position on map
  completed: false,
  description: 'Description here'
}
```

## Customizing Categories

Edit `src/data/Map/categories.ts` to add/modify filter categories:

```tsx
{
  id: 'newCategory',
  label: 'New Category',
  icon: '🎯',
  color: '#ff5722',
}
```

## Current Structure

```
src/
├── components/Map/
│   ├── FilterBar.tsx      # Filter chips UI
│   ├── ZoomableMap.tsx    # Main map component
│   ├── Marker.tsx         # Individual markers
│   └── Chip.tsx           # Filter chip component
├── context/Map/
│   ├── FiltersContext.tsx # Filter state management
│   └── MarkersContext.tsx # Markers data & completion
├── hooks/Map/
│   └── useFilters.ts      # Filter logic hook
└── data/Map/
    └── categories.ts      # Category definitions
```

## Usage

The map is already integrated at:
```
app/(drawer)/guides/PLZA/map.tsx
```

Navigate to: **Guides → PLZA → Map**

## Next Steps

1. **Add your map image** to `assets/maps/`
2. **Update marker coordinates** to match your map
3. **Add more markers** for all POIs in the game
4. **Customize categories** if needed
5. **Style the markers** with custom icons or images

## Advanced Features (Future)

- [ ] Custom marker images per category
- [ ] Search functionality
- [ ] Export/import markers as JSON
- [ ] Persist completion state
- [ ] Share progress with friends
- [ ] Multiple map layers (overworld, underground, etc.)
