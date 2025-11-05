/**
 * Supabase Storage API for Media Uploads
 * 
 * Handles uploading images and videos to Supabase Storage bucket.
 * Supports image compression and video duration validation.
 */

import { createClient } from '@supabase/supabase-js';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const STORAGE_BUCKET = 'social-media';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_DURATION = 30; // seconds
const IMAGE_QUALITY = 0.8;
const MAX_IMAGE_DIMENSION = 1920;

export interface UploadResult {
  url: string;
  path: string;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
}

/**
 * Compress and upload an image to Supabase Storage
 */
export async function uploadImage(
  uri: string,
  userId: string,
  folder: 'posts' | 'messages' = 'posts'
): Promise<UploadResult> {
  try {
    // Compress the image
    const compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_IMAGE_DIMENSION } }],
      { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Check file size
    const fileInfo = await FileSystem.getInfoAsync(compressedImage.uri);
    if (!fileInfo.exists) {
      throw new Error('Compressed image file not found');
    }
    
    if (fileInfo.size && fileInfo.size > MAX_IMAGE_SIZE) {
      throw new Error(`Image size exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit`);
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(compressedImage.uri, {
      encoding: 'base64',
    });

    // Generate unique filename
    const filename = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    // Convert base64 to blob
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple images in batch
 */
export async function uploadImages(
  uris: string[],
  userId: string,
  folder: 'posts' | 'messages' = 'posts'
): Promise<UploadResult[]> {
  if (uris.length > 5) {
    throw new Error('Cannot upload more than 5 images');
  }

  const uploadPromises = uris.map(uri => uploadImage(uri, userId, folder));
  return Promise.all(uploadPromises);
}

/**
 * Get video metadata (duration, dimensions, size)
 * Note: Duration must be provided by the caller as it requires loading the video
 */
export async function getVideoMetadata(uri: string): Promise<VideoMetadata> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    if (!fileInfo.exists) {
      throw new Error('Video file not found');
    }

    // Return basic metadata (duration would need to be provided separately)
    return {
      duration: 0, // Must be provided by caller using Video component
      width: 0,
      height: 0,
      size: fileInfo.size || 0,
    };
  } catch (error) {
    console.error('Error getting video metadata:', error);
    throw error;
  }
}

/**
 * Upload a video to Supabase Storage
 */
export async function uploadVideo(
  uri: string,
  userId: string,
  duration: number,
  folder: 'posts' | 'messages' = 'posts'
): Promise<UploadResult> {
  try {
    // Validate duration
    if (duration > MAX_VIDEO_DURATION) {
      throw new Error(`Video duration exceeds ${MAX_VIDEO_DURATION} seconds limit`);
    }

    // Check file size
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('Video file not found');
    }
    
    if (fileInfo.size && fileInfo.size > MAX_VIDEO_SIZE) {
      throw new Error(`Video size exceeds ${MAX_VIDEO_SIZE / 1024 / 1024}MB limit`);
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Generate unique filename
    const ext = uri.split('.').pop() || 'mp4';
    const filename = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Convert base64 to blob
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'video/mp4' });

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, blob, {
        contentType: 'video/mp4',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
}

/**
 * Delete a media file from Supabase Storage
 */
export async function deleteMedia(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Media deletion error:', error);
    throw error;
  }
}

/**
 * Delete multiple media files in batch
 */
export async function deleteMediaBatch(paths: string[]): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(paths);

    if (error) {
      throw new Error(`Batch delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Media batch deletion error:', error);
    throw error;
  }
}

/**
 * Extract storage path from public URL
 */
export function extractPathFromUrl(url: string): string {
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
  return match ? match[1] : '';
}

/**
 * Validate media constraints before upload
 */
export function validateMediaUpload(
  imageUris: string[],
  videoUri: string | null
): { valid: boolean; error?: string } {
  if (imageUris.length > 0 && videoUri) {
    return {
      valid: false,
      error: 'Cannot upload both images and video. Choose one or the other.',
    };
  }

  if (imageUris.length > 5) {
    return {
      valid: false,
      error: 'Cannot upload more than 5 images.',
    };
  }

  return { valid: true };
}
