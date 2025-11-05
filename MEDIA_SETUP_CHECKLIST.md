# Media Upload Setup Checklist

Use this checklist to implement media upload functionality for your PokePages social features.

## ✅ Prerequisites (Already Done)

- [x] Database schema updated (`src/db/socialSchema.ts`)
- [x] Storage API created (`src/utils/storageApi.ts`)
- [x] Azure moderation utility created (`src/utils/mediaModeration.ts`)
- [x] SQL migration file created (`migrations/add_media_support.sql`)
- [x] Documentation created (MEDIA_UPLOAD_GUIDE.md)

## 🔲 Environment Setup

### 1. Install Required Packages
```bash
npx expo install expo-image-manipulator expo-image-picker expo-av
```

### 2. Add Environment Variables
Add to your `.env` file:
```env
# Azure Content Moderator (get from Azure Portal)
AZURE_CONTENT_MODERATOR_KEY=your_key_here
AZURE_CONTENT_MODERATOR_ENDPOINT=https://your-region.api.cognitive.microsoft.com/

# Supabase (you already have these)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**How to get Azure credentials:**
1. Go to https://portal.azure.com
2. Create a "Content Moderator" resource (or use existing Cognitive Services)
3. Copy the Key and Endpoint from "Keys and Endpoint" section
4. Free tier gives you 10,000 transactions/month!

### 3. Run Database Migration
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `migrations/add_media_support.sql`
4. Paste and run
5. Verify success message

### 4. Create Supabase Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Click "Create bucket"
3. Name: `social-media`
4. Make it **Public** (or set up RLS policies)
5. Click "Create bucket"

## 🔲 Backend Updates

### 5. Update Social Controller
File: `src/routes/social/socialController.ts`

Add media upload logic to `createPost()`:
```typescript
import { moderateMediaBatch, moderateVideo } from '../../utils/mediaModeration.js';
import { uploadImages, uploadVideo, deleteMediaBatch } from '../../utils/storageApi.js';

// In createPost function, after text moderation:
let uploadedImageUrls: string[] = [];
let uploadedVideoPaths: string[] = [];

try {
  // Upload and moderate images
  if (body.imageUrls && body.imageUrls.length > 0) {
    const imageResults = await uploadImages(body.imageUrls, userId);
    uploadedImageUrls = imageResults.map(r => r.url);
    uploadedVideoPaths = imageResults.map(r => r.path);
    
    const imageModResult = await moderateMediaBatch(uploadedImageUrls);
    if (!imageModResult.isAppropriate) {
      await deleteMediaBatch(uploadedVideoPaths);
      return res.status(403).json({
        error: 'Image content not allowed',
        reason: imageModResult.reason,
      });
    }
  }

  // Upload and moderate video
  if (body.videoUrl) {
    const videoResult = await uploadVideo(body.videoUrl, userId, body.videoDuration || 30);
    body.videoUrl = videoResult.url;
    uploadedVideoPaths.push(videoResult.path);
    
    const videoModResult = await moderateVideo(body.videoUrl);
    if (!videoModResult.isAppropriate) {
      await deleteMediaBatch(uploadedVideoPaths);
      return res.status(403).json({
        error: 'Video content not allowed',
        reason: videoModResult.reason,
      });
    }
  }

  // Update body with uploaded URLs
  body.imageUrls = uploadedImageUrls;

  // Create post as normal...
} catch (error) {
  // Clean up on error
  if (uploadedVideoPaths.length > 0) {
    await deleteMediaBatch(uploadedVideoPaths);
  }
  throw error;
}
```

Apply same logic to `sendMessage()` function.

### 6. Update Social API Client
File: `src/utils/socialApi.ts`

The types are already updated! Just verify `createPost()` function accepts the new fields:
```typescript
export async function createPost(data: {
  content: string;
  imageUrls?: string[];
  videoUrl?: string;
  videoDuration?: number;
  visibility: 'public' | 'friends_only';
}): Promise<Post> {
  // ... existing implementation
}
```

## 🔲 Frontend Updates

### 7. Create MediaPicker Component
File: `src/components/Social/MediaPicker.tsx`

See `MEDIA_UPLOAD_GUIDE.md` for full component code. Key features:
- Image selection (1-5 images)
- Video selection (max 30s)
- Preview selected media
- Upload progress
- Validation (images OR video, not both)

### 8. Create MediaGallery Component
File: `src/components/Social/MediaGallery.tsx`

```typescript
import React from 'react';
import { View, Image, Dimensions } from 'react-native';
import { Video } from 'expo-av';

interface MediaGalleryProps {
  imageUrls?: string[];
  videoUrl?: string;
}

export function MediaGallery({ imageUrls, videoUrl }: MediaGalleryProps) {
  const width = Dimensions.get('window').width - 32;

  if (videoUrl) {
    return (
      <Video
        source={{ uri: videoUrl }}
        className="rounded-lg mt-3"
        style={{ width, height: 300 }}
        useNativeControls
        resizeMode="contain"
      />
    );
  }

  if (imageUrls && imageUrls.length > 0) {
    return (
      <View className="flex-row flex-wrap gap-2 mt-3">
        {imageUrls.map((url, index) => (
          <Image
            key={index}
            source={{ uri: url }}
            className="rounded-lg"
            style={{
              width: imageUrls.length === 1 ? width : (width - 8) / 2,
              height: 200,
            }}
            resizeMode="cover"
          />
        ))}
      </View>
    );
  }

  return null;
}
```

### 9. Update PostCard Component
File: `src/components/Social/PostCard.tsx`

Add to imports:
```typescript
import { MediaGallery } from './MediaGallery';
```

Add to component (after content, before actions):
```typescript
<MediaGallery imageUrls={post.imageUrls} videoUrl={post.videoUrl} />
```

### 10. Update Post Creation Screen
File: `src/app/(drawer)/social/(tabs)/two.tsx`

Add to imports:
```typescript
import { MediaPicker } from '../../../components/Social/MediaPicker';
import { useAuthStore } from '../../../store/authStore';
```

Add state for media:
```typescript
const [imageUrls, setImageUrls] = useState<string[]>([]);
const [videoUrl, setVideoUrl] = useState<string | null>(null);
const [videoDuration, setVideoDuration] = useState<number | undefined>();
const userId = useAuthStore(state => state.user?.id);
```

Add MediaPicker before the content input:
```typescript
{userId && (
  <MediaPicker
    userId={userId}
    folder="posts"
    onMediaSelected={(images, video, duration) => {
      setImageUrls(images);
      setVideoUrl(video);
      setVideoDuration(duration);
    }}
  />
)}
```

Update handlePost to include media:
```typescript
await createPost({
  content,
  imageUrls,
  videoUrl,
  videoDuration,
  visibility,
});
```

## 🔲 Testing

### 11. Test Basic Functionality
- [ ] Upload post with 1 image
- [ ] Upload post with 5 images
- [ ] Upload post with 1 video (under 30s)
- [ ] View post with images in feed
- [ ] View post with video in feed
- [ ] Delete post with media (verify storage cleanup)

### 12. Test Constraints
- [ ] Try to upload 6 images (should error)
- [ ] Try to upload both images AND video (should error)
- [ ] Try to upload video over 30 seconds (should error)

### 13. Test Moderation
- [ ] Upload appropriate content (should succeed)
- [ ] Upload inappropriate image (should be rejected by Azure)
- [ ] Verify rejected media is removed from storage
- [ ] Check error messages are user-friendly

### 14. Test Messages
- [ ] Send message with image
- [ ] Send message with video
- [ ] Receive message with media
- [ ] View media in message thread

## 🔲 Optional Enhancements

### 15. Advanced Features
- [ ] Image zoom/lightbox view
- [ ] Video thumbnail generation
- [ ] Upload progress bar
- [ ] Retry failed uploads
- [ ] Draft posts with media
- [ ] Share media to other apps
- [ ] Image filters (Pokemon-themed?)

### 16. Performance Optimizations
- [ ] Lazy load images in feed
- [ ] Cache uploaded images
- [ ] Compress videos before upload
- [ ] Generate image thumbnails
- [ ] Prefetch next page media

## 📊 Monitoring

### 17. Track Usage
- [ ] Monitor Azure Content Moderator usage (free tier: 10K/month)
- [ ] Monitor Supabase Storage usage (free tier: 1GB)
- [ ] Set up alerts for quota limits
- [ ] Track moderation rejection rate
- [ ] Monitor upload success rate

## 🎉 Launch Checklist

Before going live:
- [ ] All tests passing
- [ ] Error handling complete
- [ ] Loading states implemented
- [ ] Azure credentials in production env
- [ ] Supabase storage bucket public
- [ ] RLS policies tested
- [ ] Cost monitoring set up
- [ ] User documentation updated

## 📝 Notes

**Azure Free Tier:**
- 10,000 transactions/month FREE
- After that: $1 per 1,000 transactions
- Image = 1 transaction
- Video = 3-5 transactions (frame analysis)

**Supabase Free Tier:**
- 1GB storage
- 2GB bandwidth/month
- Plenty for small-medium apps!

**Estimated Costs (10K users):**
- ~50K posts/month with 2 images avg
- = 100K image checks
- = ~$90/month Azure (after 10K free)
- Very reasonable for safety!

---

## 🚀 Quick Start (Skip to here if you just want to get started)

1. Install packages: `npx expo install expo-image-manipulator expo-image-picker expo-av`
2. Add Azure credentials to `.env`
3. Run SQL migration in Supabase
4. Create `social-media` storage bucket in Supabase
5. Update `socialController.ts` with media upload logic
6. Create `MediaPicker.tsx` and `MediaGallery.tsx` components
7. Update `PostCard.tsx` and post creation screen
8. Test and deploy!

Need help? Check `MEDIA_UPLOAD_GUIDE.md` for detailed instructions.
