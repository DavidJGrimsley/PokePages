# MAP_DATA_SCHEMA.md

# Map Data Schema

This document outlines the schema for the map data used in the "Pokemon Legends Z-A" interactive map application. The map data is structured in a way that allows for easy integration with the application's filtering and marker functionalities.

## Marker Schema

Each marker in the map data should adhere to the following schema:

```json
{
  "id": "string",                // Unique identifier for the marker
  "name": "string",              // Name of the location or item
  "description": "string",       // Description of the location or item
  "coordinates": {               // Geographic coordinates of the marker
    "latitude": "number",        // Latitude of the marker
    "longitude": "number"        // Longitude of the marker
  },
  "category": "string",          // Category of the marker (e.g., "Building", "Ruins", "Fast Travel", "Other")
  "isComplete": "boolean",       // Status indicating if the item has been marked as complete
  "image": {                     // Optional image data for the marker
    "url": "string",             // URL of the image
    "type": "string"             // Type of the image (e.g., "svg", "png", "lottie")
  }
}
```

## Categories

The following categories are used to filter markers on the map:

- Everything
- Buildings
- Ruins
- Fast Travel Locations
- Other Game-Specific Items

## Example Marker Data

Here is an example of how a marker might be represented in the JSON data:

```json
{
  "id": "marker_001",
  "name": "Poke Center",
  "description": "A place to heal your Pokemon.",
  "coordinates": {
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  "category": "Building",
  "isComplete": false,
  "image": {
    "url": "https://example.com/images/poke_center.svg",
    "type": "svg"
  }
}
```

## Notes

- Ensure that all marker IDs are unique to avoid conflicts.
- The `isComplete` field should be updated based on user interactions with the map.
- The `image` field is optional; if not provided, a default marker image should be used.

This schema provides a structured approach to managing map data, facilitating the development of features such as filtering and completion tracking in the interactive map application.