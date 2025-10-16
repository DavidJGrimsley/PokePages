# rn-interactive-map

## Overview
The rn-interactive-map project is a React Native application designed to provide an interactive map experience for the game "Pokemon Legends Z-A". The application features a zoomable and draggable map with various filter options for different categories of items, allowing users to mark items as complete.

## Features
- **Interactive Map**: Users can zoom and drag the map to explore different areas.
- **Filter Options**: Filter markers based on categories such as:
  - Everything
  - Buildings
  - Ruins
  - Fast travel locations
  - Other game-specific items
- **Completion Tracking**: Users can mark items as complete, enhancing their gameplay experience.

## Project Structure
The project is organized into several directories:
- **src**: Contains the main application code, including components, screens, context, services, hooks, data, constants, types, and utilities.
- **assets**: Holds marker assets in various formats (SVG, vector, Lottie) and font files.
- **docs**: Documentation files for image format recommendations, map data schema, and overall architecture.
- **configuration files**: Includes package.json, tsconfig.json, app.json, babel.config.js, and metro.config.js for project setup.

## Image Format Recommendations
For map markers in "Pokemon Legends Z-A", the following image file types are recommended:
- **SVG**: Ideal for scalable vector graphics, ensuring high quality at any zoom level.
- **PNG**: Suitable for raster images, providing good quality for static markers.
- **Lottie**: Recommended for animated markers, allowing for engaging visual effects.

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd rn-interactive-map
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Run the application:
   ```
   npm start
   ```

## Usage
Once the application is running, users can interact with the map, apply filters, and track their progress by marking items as complete. The intuitive interface allows for easy navigation and exploration of the game world.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.