/**
 * Supabase Storage API for Media Uploads
 * 
 * Handles uploading images and videos to Supabase Storage bucket.
 * Supports image compression and video duration validation.
 */

import { createClient } from '@supabase/supabase-js';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseKey) {
  console.error('[storageApi] Missing Supabase env vars', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
  });
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function getAuthToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return (data as any)?.session?.access_token ?? null;
  } catch {
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`upload-timeout after ${ms}ms`)), ms);
    promise
      .then((v) => { clearTimeout(t); resolve(v); })
      .catch((e) => { clearTimeout(t); reject(e); });
  });
}

async function restUpload(bucket: string, path: string, body: Blob | ArrayBuffer, contentType: string, upsert: boolean) {
  const token = await getAuthToken();
  const url = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`;
  const headers: Record<string, string> = {
    apikey: supabaseKey,
    authorization: `Bearer ${token ?? supabaseKey}`,
    'x-upsert': upsert ? 'true' : 'false',
    'content-type': contentType,
  };
  const res = await withTimeout(
    fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers,
      body: body instanceof Blob ? body : new Uint8Array(body as ArrayBuffer),
    }),
    20000
  );
  const text = await res.text();
  if (!(res as Response).ok) {
    throw new Error(`REST upload failed: ${(res as Response).status} ${text}`);
  }
  return { path };
}

// Bucket for storing post media; configurable via env var so you can reuse an existing bucket.
const STORAGE_BUCKET = process.env.EXPO_PUBLIC_SUPABASE_MEDIA_BUCKET || 'social-media';
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
 * Helper function to convert local file URI to Blob using XMLHttpRequest
 * This works reliably in React Native for local file URIs
 */
async function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new Error('Failed to read file'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
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
    let blob: Blob;
    let uploadUri = uri;

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      blob = await response.blob();
    } else {
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: MAX_IMAGE_DIMENSION } }],
        { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
      );
      uploadUri = compressedImage.uri;
      blob = await uriToBlob(uploadUri);
    }
    
    if (blob.size > MAX_IMAGE_SIZE) {
      throw new Error(`Image size exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit`);
    }

    const filename = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    let payload: Blob | ArrayBuffer = blob;
    if (Platform.OS === 'web') {
      payload = await blob.arrayBuffer();
    }

    let data: any | null = null;
    let error: any | null = null;
    try {
      const resp = await withTimeout(
        supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filename, payload as any, {
            contentType: 'image/jpeg',
            upsert: false,
          }) as any,
        15000
      );
      data = (resp as any).data;
      error = (resp as any).error ?? null;
    } catch (e: any) {
      error = e;
    }

    let finalPath: string | null = null;
    if (error || !data?.path) {
      const restRes = await restUpload(STORAGE_BUCKET, filename, blob, 'image/jpeg', false);
      finalPath = restRes.path;
    } else {
      finalPath = data.path;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(finalPath!);

    return {
      url: publicUrl,
      path: finalPath!,
    };
  } catch (uploadError: any) {
    console.error('[storageApi] uploadImage:error', uploadError?.message);
    throw uploadError;
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
    // Convert to blob to get size
    const blob = await uriToBlob(uri);

    // Return basic metadata (duration would need to be provided separately)
    return {
      duration: 0, // Must be provided by caller using Video component
      width: 0,
      height: 0,
      size: blob.size,
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
    if (duration > MAX_VIDEO_DURATION) {
      throw new Error(`Video duration exceeds ${MAX_VIDEO_DURATION} seconds limit`);
    }

    const blob = await uriToBlob(uri);
    
    if (blob.size > MAX_VIDEO_SIZE) {
      throw new Error(`Video size exceeds ${MAX_VIDEO_SIZE / 1024 / 1024}MB limit`);
    }

    const ext = uri.split('.').pop() || 'mp4';
    const filename = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    let payload: Blob | ArrayBuffer = blob;
    if (Platform.OS === 'web') {
      payload = await blob.arrayBuffer();
    }

    let data: any | null = null;
    let error: any | null = null;
    try {
      const resp = await withTimeout(
        supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filename, payload as any, {
            contentType: 'video/mp4',
            upsert: false,
          }) as any,
        20000
      );
      data = (resp as any).data;
      error = (resp as any).error ?? null;
    } catch (e: any) {
      error = e;
    }

    let finalPath: string | null = null;
    if (error || !data?.path) {
      const restRes = await restUpload(STORAGE_BUCKET, filename, blob, 'video/mp4', false);
      finalPath = restRes.path;
    } else {
      finalPath = data.path;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(finalPath!);

    return {
      url: publicUrl,
      path: finalPath!,
    };
  } catch (uploadError: any) {
    console.error('[storageApi] uploadVideo:error', uploadError?.message);
    throw uploadError;
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
