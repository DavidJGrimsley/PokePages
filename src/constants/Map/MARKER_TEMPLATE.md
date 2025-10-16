# Marker Data Template

Use this template to add markers for Pokemon Legends Z-A locations.

## Quick Reference

### Categories Available
- `buildings` - 🏢 Poke Centers, Marts, etc.
- `ruins` - 🏛️ Ancient ruins
- `fastTravel` - ✈️ Fast travel points
- `other` - ⭐ Items, collectibles, etc.

### Marker Template

```tsx
{
  id: 'unique-id',
  name: 'Location Name',
  category: 'buildings', // or ruins, fastTravel, other
  coordinates: { x: 100, y: 200 }, // pixels from top-left
  completed: false,
  description: 'Optional description'
}
```

## Example Markers for PLZA

```tsx
// Poke Centers
{
  id: 'pc-central',
  name: 'Central Poke Center',
  category: 'buildings',
  coordinates: { x: 200, y: 150 },
  completed: false,
  description: 'Main Pokemon Center in Lumiose City'
},

// Poke Marts
{
  id: 'mart-north',
  name: 'North District Mart',
  category: 'buildings',
  coordinates: { x: 180, y: 80 },
  completed: false,
  description: 'Buy items and supplies'
},

// Fast Travel
{
  id: 'ft-plaza',
  name: 'Central Plaza',
  category: 'fastTravel',
  coordinates: { x: 200, y: 200 },
  completed: false,
  description: 'Fast travel hub'
},

// Ruins
{
  id: 'ruins-ancient',
  name: 'Ancient Temple',
  category: 'ruins',
  coordinates: { x: 320, y: 280 },
  completed: false,
  description: 'Mysterious ancient structure'
},

// Items
{
  id: 'item-rare-candy',
  name: 'Rare Candy',
  category: 'other',
  coordinates: { x: 150, y: 300 },
  completed: false,
  description: 'Hidden rare candy'
},
```

## How to Find Coordinates

### Method 1: Image Editor
1. Open your map image in an image editor (Photoshop, GIMP, etc.)
2. Use the cursor position tool to find pixel coordinates
3. Note: (0,0) is top-left corner

### Method 2: In-App Testing
1. Add this to ZoomableMap.tsx inside the Animated.View:
```tsx
<View
  onStartShouldSetResponder={() => true}
  onResponderRelease={(e) => {
    console.log('Tap at:', {
      x: Math.round(e.nativeEvent.locationX),
      y: Math.round(e.nativeEvent.locationY)
    });
  }}
  style={{ position: 'absolute', width: '100%', height: '100%' }}
/>
```
2. Tap locations on your map
3. Check Metro console for coordinates
4. Remove this code when done

### Method 3: Grid Overlay
1. Create a grid overlay on your map image
2. Count grid squares to estimate positions
3. Refine positions visually in the app

## Bulk Import Template

Save this as JSON and import programmatically:

```json
{
  "markers": [
    {
      "id": "1",
      "name": "Location 1",
      "category": "buildings",
      "coordinates": { "x": 100, "y": 150 },
      "completed": false,
      "description": "Description here"
    },
    {
      "id": "2",
      "name": "Location 2",
      "category": "ruins",
      "coordinates": { "x": 200, "y": 250 },
      "completed": false,
      "description": "Description here"
    }
  ]
}
```

Then in MarkersContext.tsx:
```tsx
import markersData from '../../data/Map/plza-markers.json';
const [markers, setMarkers] = useState<Marker[]>(markersData.markers);
```

## Tips

### Organizing Markers
Group by type in your data file:
```tsx
// Buildings
{ id: 'pc-1', ... },
{ id: 'pc-2', ... },
{ id: 'mart-1', ... },

// Ruins
{ id: 'ruins-1', ... },
{ id: 'ruins-2', ... },

// Fast Travel
{ id: 'ft-1', ... },
```

### Naming Convention
- Use descriptive IDs: `pc-central`, `ruins-north`, `ft-plaza`
- Keep names concise but clear
- Add detailed descriptions for more info

### Testing
- Add a few markers first
- Test zoom, pan, and tap interactions
- Verify completion toggle works
- Then add remaining markers

### Completion Persistence (Future)
To save completion state:
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save
await AsyncStorage.setItem('map-completion', JSON.stringify(markers));

// Load
const saved = await AsyncStorage.getItem('map-completion');
if (saved) setMarkers(JSON.parse(saved));
```
