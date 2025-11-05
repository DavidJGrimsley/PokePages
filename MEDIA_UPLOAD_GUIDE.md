# Media Upload Implementation Guide

This guide covers the implementation of image and video uploads for the PokePages social features, including Azure Content Moderator integration for safety.

## Overview

Users can now attach media to posts and messages with the following constraints:
- **Up to 5 images** OR **one 30-second video** per post/message
- Images are compressed and resized to 1920px max dimension
- Videos must be 30 seconds or less
- All media is moderated using Azure Content Moderator before posting

## Setup Required

### 1. Install Required Packages

```bash
npx expo install expo-image-manipulator expo-image-picker expo-av
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Azure Content Moderator
AZURE_CONTENT_MODERATOR_KEY=your_azure_key_here
AZURE_CONTENT_MODERATOR_ENDPOINT=https://your-region.api.cognitive.microsoft.com/

# Supabase (already configured)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Storage Bucket

Create a storage bucket in Supabase:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `social-media`
3. Make it public (or configure RLS policies)
4. Set up folders:
   - `/posts/{userId}/` - for post media
   - `/messages/{userId}/` - for message media

### 4. Database Migration

Run this SQL in your Supabase SQL editor to update the schema:

```sql
-- Add media fields to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS image_urls text[],
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS video_duration integer;

-- Drop old single image column if exists
ALTER TABLE posts DROP COLUMN IF EXISTS image_url;

-- Add media fields to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS image_urls text[],
ADD COLUMN IF NOT EXISTS video_url,
ADD COLUMN IF NOT EXISTS video_duration integer;

-- Add check constraint to ensure max 30 second videos
ALTER TABLE posts
ADD CONSTRAINT posts_video_duration_check
CHECK (video_duration IS NULL OR (video_duration > 0 AND video_duration <= 30));

ALTER TABLE messages
ADD CONSTRAINT messages_video_duration_check
CHECK (video_duration IS NULL OR (video_duration > 0 AND video_duration <= 30));
```

## Architecture

### File Structure

```
src/
├── db/
│   └── socialSchema.ts          # Updated schema with media fields
├── utils/
│   ├── storageApi.ts            # Supabase storage functions
│   ├── mediaModeration.ts       # Azure Content Moderator integration
│   └── socialApi.ts             # API client (needs update)
├── routes/
│   └── social/
│       └── socialController.ts  # Controllers (needs update)
└── components/
    └── Social/
        ├── PostCard.tsx         # Display posts with media
        ├── MediaPicker.tsx      # New: Media selection component
        └── MediaGallery.tsx     # New: Display image gallery
```

### Data Flow

```
User selects media
  ↓
Validate constraints (5 images OR 1 video)
  ↓
Upload to Supabase Storage
  ↓
Moderate with Azure Content Moderator
  ↓
If approved: Save post/message to database
If rejected: Delete from storage & show error
```

## Implementation Steps

### Step 1: Update socialApi.ts Types

Update the `Post` and `Message` interfaces:

```typescript
export interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrls?: string[] | null;  // New
  videoUrl?: string | null;      // New
  videoDuration?: number | null; // New
  visibility: 'public' | 'friends_only';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  imageUrls?: string[] | null;  // New
  videoUrl?: string | null;      // New
  videoDuration?: number | null; // New
  isRead: boolean;
  friendshipId?: string | null;
  createdAt: string;
}
```

### Step 2: Update socialController.ts

Add media upload and moderation to the `createPost` controller:

```typescript
import { moderateImage, moderateMediaBatch, moderateVideo } from '../../utils/mediaModeration.js';

export async function createPost(req: Request, res: Response) {
  try {
    const userId = req.user?.id; // From auth middleware
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const body = insertPostSchema.parse(req.body);

    // Moderate text content
    const textModResult = await moderateContent(body.content);
    if (!textModResult.isAppropriate) {
      return res.status(403).json({
        error: 'Content not allowed',
        reason: getModerationMessage(textModResult.reason),
      });
    }

    // Moderate images if present
    if (body.imageUrls && body.imageUrls.length > 0) {
      const imageModResult = await moderateMediaBatch(body.imageUrls);
      if (!imageModResult.isAppropriate) {
        return res.status(403).json({
          error: 'Image content not allowed',
          reason: imageModResult.reason,
        });
      }
    }

    // Moderate video if present
    if (body.videoUrl) {
      const videoModResult = await moderateVideo(body.videoUrl);
      if (!videoModResult.isAppropriate) {
        return res.status(403).json({
          error: 'Video content not allowed',
          reason: videoModResult.reason,
        });
      }
    }

    // Create post
    const post = await createPostQuery({
      authorId: userId,
      content: body.content,
      imageUrls: body.imageUrls,
      videoUrl: body.videoUrl,
      videoDuration: body.videoDuration,
      visibility: body.visibility,
    });

    return res.status(201).json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create post error:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
}
```

### Step 3: Create MediaPicker Component

```typescript
// src/components/Social/MediaPicker.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { TextTheme } from '../TextTheme/TextTheme';
import { validateMediaUpload, uploadImages, uploadVideo } from '../../utils/storageApi';

interface MediaPickerProps {
  onMediaSelected: (imageUrls: string[], videoUrl: string | null, videoDuration?: number) => void;
  userId: string;
  folder?: 'posts' | 'messages';
}

export function MediaPicker({ onMediaSelected, userId, folder = 'posts' }: MediaPickerProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uris = result.assets.map(asset => asset.uri);
      const validation = validateMediaUpload(uris, selectedVideo);
      
      if (!validation.valid) {
        Alert.alert('Invalid Selection', validation.error);
        return;
      }

      setSelectedImages(uris);
      setSelectedVideo(null);
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your videos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
      videoMaxDuration: 30,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const duration = asset.duration ? Math.floor(asset.duration / 1000) : 0;

      if (duration > 30) {
        Alert.alert('Video too long', 'Videos must be 30 seconds or less');
        return;
      }

      const validation = validateMediaUpload([], asset.uri);
      
      if (!validation.valid) {
        Alert.alert('Invalid Selection', validation.error);
        return;
      }

      setSelectedVideo(asset.uri);
      setSelectedImages([]);
    }
  };

  const uploadMedia = async () => {
    setUploading(true);
    try {
      if (selectedImages.length > 0) {
        const results = await uploadImages(selectedImages, userId, folder);
        onMediaSelected(results.map(r => r.url), null);
      } else if (selectedVideo) {
        // Would need to get duration from Video component
        const result = await uploadVideo(selectedVideo, userId, 30, folder);
        onMediaSelected([], result.url, 30);
      }
    } catch (error) {
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="mb-4">
      <View className="flex-row gap-2 mb-2">
        <TouchableOpacity
          onPress={pickImages}
          disabled={uploading || selectedVideo !== null}
          className="flex-1 bg-amber-500 p-3 rounded-lg flex-row items-center justify-center"
        >
          <Ionicons name="images" size={20} color="white" />
          <TextTheme className="ml-2 text-white font-bold">Images (0-5)</TextTheme>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickVideo}
          disabled={uploading || selectedImages.length > 0}
          className="flex-1 bg-purple-500 p-3 rounded-lg flex-row items-center justify-center"
        >
          <Ionicons name="videocam" size={20} color="white" />
          <TextTheme className="ml-2 text-white font-bold">Video (30s)</TextTheme>
        </TouchableOpacity>
      </View>

      {selectedImages.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {selectedImages.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              className="w-20 h-20 rounded-lg"
            />
          ))}
        </View>
      )}

      {selectedVideo && (
        <TextTheme className="text-green-600">Video selected ✓</TextTheme>
      )}

      {(selectedImages.length > 0 || selectedVideo) && (
        <TouchableOpacity
          onPress={uploadMedia}
          disabled={uploading}
          className="mt-2 bg-blue-500 p-3 rounded-lg"
        >
          <TextTheme className="text-white text-center font-bold">
            {uploading ? 'Uploading...' : 'Upload Media'}
          </TextTheme>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

### Step 4: Update PostCard Component

Add media display to `PostCard.tsx`:

```typescript
// Add to imports
import { Image, Dimensions } from 'react-native';
import { Video } from 'expo-av';

// Add to PostCard component
{post.imageUrls && post.imageUrls.length > 0 && (
  <View className="mt-3 flex-row flex-wrap gap-2">
    {post.imageUrls.map((url, index) => (
      <Image
        key={index}
        source={{ uri: url }}
        className="rounded-lg"
        style={{
          width: post.imageUrls!.length === 1 
            ? Dimensions.get('window').width - 32 
            : (Dimensions.get('window').width - 48) / 2,
          height: 200,
        }}
        resizeMode="cover"
      />
    ))}
  </View>
)}

{post.videoUrl && (
  <Video
    source={{ uri: post.videoUrl }}
    className="mt-3 rounded-lg"
    style={{ width: '100%', height: 300 }}
    useNativeControls
    resizeMode="contain"
  />
)}
```

## Azure Content Moderator Costs

- **Free Tier**: 10,000 transactions per month
- **Paid Tier**: $1.00 per 1,000 transactions
- **Image moderation**: ~1 transaction per image
- **Video moderation**: ~1 transaction per frame analyzed (typically 3-5 frames)

### Cost Estimates

For a social app with 1,000 active users:
- 5,000 posts/month with images (avg 2 images each) = 10,000 image checks
- **Monthly cost**: FREE (within 10K limit)

For 10,000 active users:
- 50,000 posts/month with images = 100,000 image checks
- **Monthly cost**: ~$90/month ($1 per 1K after 10K free)

## Testing

1. **Test image upload**: Select 1-5 images and post
2. **Test video upload**: Select a video under 30 seconds
3. **Test constraints**: Try to select both images AND video (should error)
4. **Test moderation**: Upload inappropriate content (should be rejected)
5. **Test deletion**: Delete a post with media (should remove from storage)

## Next Steps

1. ✅ Database schema updated
2. ✅ Storage API created
3. ✅ Media moderation utility created
4. 🔄 Update controllers for media upload
5. 🔄 Create MediaPicker component
6. 🔄 Update PostCard to display media
7. 🔄 Apply same changes to Messages
8. 🔄 Add loading states and error handling
9. 🔄 Test end-to-end flow

## Troubleshooting

### Images not compressing
- Ensure `expo-image-manipulator` is installed
- Check that max dimension is set correctly

### Videos not uploading
- Verify video is under 30 seconds
- Check file size is under 50MB
- Ensure video format is MP4

### Moderation errors
- Verify Azure credentials in environment variables
- Check Azure Content Moderator endpoint is correct
- Ensure you haven't exceeded free tier limits

### Storage errors
- Verify Supabase storage bucket exists and is public
- Check RLS policies allow user access
- Ensure bucket name matches `STORAGE_BUCKET` constant
