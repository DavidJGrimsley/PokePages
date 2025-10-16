# Architecture of the Interactive Map Project

## Overview
The Interactive Map project is a React Native application designed to provide users with an engaging and interactive experience while exploring various locations in the game "Pokemon Legends Z-A". The application features a zoomable and draggable map, filter options for different categories, and functionality to mark items as complete.

## Key Components
1. **App Entry Point (`src/app.tsx`)**: 
   - Sets up the main navigation.
   - Renders the `MapScreen` component.

2. **Map Screen (`src/screens/MapScreen.tsx`)**:
   - Integrates the `ZoomableMap` and `FilterBar` components.
   - Manages the overall display of the map and filtering logic.

3. **Map Components**:
   - **ZoomableMap (`src/components/map/ZoomableMap.tsx`)**: Provides functionality for zooming and dragging the map.
   - **Marker (`src/components/map/Marker.tsx`)**: Represents individual markers on the map, indicating points of interest.
   - **MarkerLayer (`src/components/map/MarkerLayer.tsx`)**: Manages the rendering of multiple markers on the `ZoomableMap`.
   - **FilterBar (`src/components/map/FilterBar.tsx`)**: Allows users to filter map markers based on categories.
   - **CompletionBadge (`src/components/map/CompletionBadge.tsx`)**: Indicates whether a specific item has been marked as complete.

4. **UI Components**:
   - **Container (`src/components/ui/Container.tsx`)**: Provides consistent layout styling across the application.
   - **Chip (`src/components/ui/Chip.tsx`)**: Displays filter options.
   - **Checkbox (`src/components/ui/Checkbox.tsx`)**: Used for marking items as complete.

5. **Context Management**:
   - **FiltersContext (`src/context/FiltersContext.tsx`)**: Manages filter states across the application.
   - **MarkersContext (`src/context/MarkersContext.tsx`)**: Manages the state of markers on the map.

6. **Services**:
   - **Storage (`src/services/storage.ts`)**: Contains functions for storing and retrieving data related to completed items and user preferences.

7. **Custom Hooks**:
   - **usePanZoom (`src/hooks/usePanZoom.ts`)**: Manages pan and zoom functionality on the map.
   - **useFilters (`src/hooks/useFilters.ts`)**: Manages filter states and logic.
   - **useCompletion (`src/hooks/useCompletion.ts`)**: Manages the completion status of items.

8. **Data Management**:
   - **Categories (`src/data/categories.ts`)**: Exports an array of category objects for filtering.
   - **Markers Data (`src/data/markers/plza.json`)**: Contains JSON data for markers specific to the game.

9. **Constants**:
   - **Filters (`src/constants/filters.ts`)**: Exports constants related to filter options.
   - **Categories (`src/constants/categories.ts`)**: Exports constants related to marker categories.

10. **Utilities**:
    - **Map Math (`src/utils/mapMath.ts`)**: Utility functions for map coordinates and scaling.
    - **Storage Keys (`src/utils/storageKeys.ts`)**: Constants for storage keys used in the application.

## Image Format Recommendations
For the map markers in "Pokemon Legends Z-A", the following image file types are recommended:
- **SVG**: Ideal for scalable vector graphics, ensuring high quality at any zoom level.
- **PNG**: Suitable for raster images, providing good quality for detailed images.
- **Lottie**: Recommended for animations, allowing for engaging and dynamic marker representations.

## Conclusion
This architecture outlines the structure and components of the Interactive Map project, emphasizing modular design and user interactivity. The application aims to enhance the gaming experience by providing a comprehensive and visually appealing map interface.