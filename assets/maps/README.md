# Map Assets

This folder contains map images for the interactive map feature.

## Current Maps

### Lumiose City Map (Pokemon Legends Z-A)
- **File**: `lumiose-city-map.jpg`
- **Usage**: Used in the PLZA guides interactive map
- **Description**: A circular futuristic city map with various districts and points of interest

## Adding the Map Image

To add/update the Lumiose City map image:

1. Save the map image as `lumiose-city-map.jpg` in this directory
2. The image should be high resolution for best zooming experience
3. Recommended format: PNG (supports transparency if needed)
4. Recommended size: At least 2000x2000px for good zoom quality

## Image Format Recommendations

- **PNG**: Best for detailed maps with sharp lines and text
- **JPG**: Good for photographic style maps, smaller file size
- **WebP**: Modern format with great compression (check compatibility)

## Coordinate System

When adding markers to the map, coordinates are based on percentages:
- `x: 0-100` (left to right)
- `y: 0-100` (top to bottom)

Example marker positions for Lumiose City:
- Center Plaza: `{ x: 50, y: 50 }`
- North Gate: `{ x: 50, y: 10 }`
- South District: `{ x: 50, y: 90 }`
