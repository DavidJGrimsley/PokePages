# Strategy Media Guide

This guide explains how to add YouTube videos and images to strategy pages.

## Adding YouTube Videos

### Section-Level Videos
Add videos to a specific section within a strategy:

```json
{
  "title": "Section Title",
  "content": "Section description",
  "bullets": ["bullet point 1", "bullet point 2"],
  "youtubeIDs": ["VIDEO_ID_1", "VIDEO_ID_2"]
}
```

### Strategy-Level Videos
Add videos that appear at the bottom of the entire strategy page:

```json
{
  "id": "strategy-id",
  "title": "Strategy Title",
  "sections": [...],
  "youtubeIDs": ["VIDEO_ID_1", "VIDEO_ID_2"]
}
```

**Note:** YouTube video IDs are the part after `v=` in a YouTube URL. For example:
- URL: `https://www.youtube.com/watch?v=MjicscEj0J8`
- Video ID: `MjicscEj0J8`

## Adding Images

Images must be added to the project's `assets` folder first, then referenced in the config.

### Step 1: Add Image to Assets Folder
Place your image in the appropriate assets folder (e.g., `assets/PLZA/`).

### Step 2: Update ImageGallery Component
Open `src/components/Guides/ImageGallery.tsx` and add your image path to the `imageMap`:

```typescript
const imageMap: Record<string, ImageSourcePropType> = {
  'assets/PLZA/TradeCodes_PlZA.png': require('../../../assets/PLZA/TradeCodes_PlZA.png'),
  'assets/PLZA/YourNewImage.png': require('../../../assets/PLZA/YourNewImage.png'),
  // Add more mappings here
};
```

### Step 3: Reference in Config
Add the image to your strategy section:

```json
{
  "title": "Section Title",
  "content": "Section description",
  "bullets": ["bullet point 1"],
  "pics": [
    {
      "src": "assets/PLZA/YourNewImage.png",
      "caption": "Image description for accessibility"
    }
  ]
}
```

## Features

### Video Carousel
- Displays multiple videos with left/right navigation arrows
- Shows video counter (e.g., "Video 1 of 3")
- Responsive sizing for mobile and desktop
- Only renders if `youtubeIDs` array has at least one video

### Image Gallery
- Displays images with captions
- Tap any image to view fullscreen
- Swipe or tap close button to exit fullscreen
- Responsive sizing
- Only renders if `pics` array has at least one image

## TypeScript Types

All strategy configuration is now properly typed. Import types from:

```typescript
import { Strategy, StrategySection, StrategyPic } from '@/src/types/strategy';
```

## Example: Complete Strategy with Media

```json
{
  "example-strategy": {
    "id": "example-strategy",
    "title": "Example Strategy",
    "subtitle": "Learn by example",
    "icon": "📚",
    "description": "This shows how to use media",
    "sections": [
      {
        "title": "Section with Video",
        "content": "Watch this video to learn more",
        "bullets": ["Point 1", "Point 2"],
        "youtubeIDs": ["VIDEO_ID_HERE"]
      },
      {
        "title": "Section with Images",
        "content": "These images show the process",
        "bullets": ["Step 1", "Step 2"],
        "pics": [
          {
            "src": "assets/PLZA/Example1.png",
            "caption": "First example image"
          },
          {
            "src": "assets/PLZA/Example2.png",
            "caption": "Second example image"
          }
        ]
      }
    ],
    "youtubeIDs": ["OUTRO_VIDEO_ID"]
  }
}
```

This will render:
1. Strategy title and description
2. Section 1 with bullets and a video carousel
3. Section 2 with bullets and an image gallery
4. "Related Videos" section at the bottom with the outro video
