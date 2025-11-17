/**
 * Supabase Storage API for Media Uploads
 * 
 * Handles uploading images and videos to Supabase Storage bucket.
 * Supports image compression and video duration validation.
 */

import { createClient } from '@supabase/supabase-js';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { useAuthStore } from '~/store/authStore';

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

// Get auth token from Zustand auth store (session is already loaded there)
function getAuthTokenSync(): string | null {
  try {
    console.log('[storageApi] Getting auth token from auth store...');
    
    // Get session from Zustand auth store where it's already loaded
    const session = useAuthStore.getState().session;
    
    const token = session?.access_token ?? null;
    console.log('[storageApi] getAuthToken result', {
      hasSession: !!session,
      hasToken: !!token,
      userId: session?.user?.id,
    });
    return token;
  } catch (err) {
    console.error('[storageApi] getAuthTokenSync failed:', err);
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
  const start = Date.now();
  console.log('[storageApi] restUpload starting - getting auth token');
  
  // Get the user's auth token to satisfy RLS policies (sync to avoid hanging)
  const token = getAuthTokenSync();
  
  const url = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`;
  const headers: Record<string, string> = {
    apikey: supabaseKey,
    authorization: `Bearer ${token ?? supabaseKey}`,
    'x-upsert': upsert ? 'true' : 'false',
    'content-type': contentType,
  };
  console.log('[storageApi] restUpload starting', { url, contentType, size: body instanceof Blob ? body.size : (body as ArrayBuffer).byteLength, headers });
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
  console.log('[storageApi] REST upload response received', { 
    status: res.status, 
    ok: res.ok,
    statusText: res.statusText,
    responseText: text.substring(0, 500) // First 500 chars
  });
  if (!(res as Response).ok) {
    const duration = Date.now() - start;
    console.error('[storageApi] REST upload failed', {
      status: (res as Response).status,
      statusText: res.statusText,
      text,
      duration,
    });
    throw new Error(`REST upload failed: ${(res as Response).status} ${text}`);
  }
  const duration = Date.now() - start;
  console.log('[storageApi] REST upload success', { path, duration });
  return { path };
}

// Bucket for storing post media; configurable via env var so you can reuse an existing bucket.
const STORAGE_BUCKET = process.env.EXPO_PUBLIC_SUPABASE_MEDIA_BUCKET || 'social-media';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB (after compression)
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_DURATION = 30; // seconds
const IMAGE_QUALITY = 0.7; // More aggressive compression
const MAX_IMAGE_DIMENSION = 1920; // Max width/height
const WEB_COMPRESSION_QUALITY = 0.6; // Even more aggressive for web

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
 * Compress image on web using Canvas API for much faster uploads
 */
async function compressImageWeb(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      
      // Resize if too large
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width > height) {
          height = (height / width) * MAX_IMAGE_DIMENSION;
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = (width / height) * MAX_IMAGE_DIMENSION;
          height = MAX_IMAGE_DIMENSION;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (compressedBlob) => {
          if (compressedBlob) {
            console.log(`[storageApi] Compressed ${(blob.size / 1024).toFixed(0)}KB -> ${(compressedBlob.size / 1024).toFixed(0)}KB`);
            resolve(compressedBlob);
          } else {
            reject(new Error('Compression failed'));
          }
        },
        'image/jpeg',
        WEB_COMPRESSION_QUALITY
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
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
      const originalBlob = await response.blob();
      console.log('[storageApi] Web uploadImage - original blob', {
        uri,
        sizeKB: (originalBlob.size / 1024).toFixed(0),
      });
      
      // Always compress on web for faster uploads
      blob = await compressImageWeb(originalBlob);
    } else {
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: MAX_IMAGE_DIMENSION } }],
        { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
      );
      uploadUri = compressedImage.uri;
      blob = await uriToBlob(uploadUri);
    }
    
    console.log('[storageApi] uploadImage - after compression / processing', {
      uri: uploadUri,
      sizeKB: (blob.size / 1024).toFixed(0),
    });

    if (blob.size > MAX_IMAGE_SIZE) {
      const sizeMB = (blob.size / 1024 / 1024).toFixed(1);
      console.warn('[storageApi] uploadImage - blob still too large after compression', {
        sizeMB,
        limitMB: MAX_IMAGE_SIZE / 1024 / 1024,
      });
      throw new Error(`Image is still too large (${sizeMB}MB) after compression. Try a different image.`);
    }

    const filename = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    console.log('[storageApi] Generated filename, preparing upload', { filename, blobSize: blob.size });
    
    // TEMPORARY: Skip Supabase SDK on web entirely, use REST upload directly
    // The SDK upload hangs in Expo web environment
    let finalPath: string | null = null;
    
    if (Platform.OS === 'web') {
      console.log('[storageApi] Using direct REST upload for web (SDK hangs in Expo web)');
      try {
        console.log('[storageApi] Web REST upload starting...', {
          bucket: STORAGE_BUCKET,
          filename,
          size: blob.size,
        });
        const restRes = await restUpload(STORAGE_BUCKET, filename, blob, 'image/jpeg', false);
        console.log('[storageApi] Web REST upload completed', restRes);
        finalPath = restRes.path;
      } catch (restError) {
        console.error('[storageApi] Web REST upload failed', restError);
        throw restError;
      }
    } else {
      // Native: try SDK first, fallback to REST
      let data: any | null = null;
      let error: any | null = null;
      try {
        console.log('[storageApi] Calling supabase.storage.upload (native)...', { filename });
        const start = Date.now();
        const resp = await withTimeout(
          supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filename, blob, {
              contentType: 'image/jpeg',
              upsert: false,
            }) as any,
          15000
        );
        data = (resp as any).data;
        error = (resp as any).error ?? null;
        const duration = Date.now() - start;
        console.log('[storageApi] supabase.storage.upload result', {
          filename,
          duration,
          hasError: !!error,
          data,
        });
      } catch (e: any) {
        console.error('[storageApi] supabase.storage.upload threw', e?.message || e);
        error = e;
      }

      if (error || !data?.path) {
        console.warn('[storageApi] Falling back to REST upload', {
          filename,
          hasError: !!error,
        });
        const restRes = await restUpload(STORAGE_BUCKET, filename, blob, 'image/jpeg', false);
        finalPath = restRes.path;
      } else {
        finalPath = data.path;
      }
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
  console.log('[storageApi] uploadImages called', { uris, userId, folder, count: uris.length });

  const start = Date.now();
  const uploadPromises = uris.map((uri, index) => {
    console.log('[storageApi] Starting upload for image index', index, uri);
    return uploadImage(uri, userId, folder)
      .then((result) => {
        console.log('[storageApi] Image upload success', { index, uri, result });
        return result;
      })
      .catch((error) => {
        console.error('[storageApi] Image upload failed', { index, uri, error });
        throw error;
      });
  });

  const results = await Promise.all(uploadPromises);
  const duration = Date.now() - start;
  console.log('[storageApi] uploadImages complete', { count: uris.length, duration });
  return results;
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
    console.log('[storageApi] uploadVideo called', { uri, userId, duration, folder });
    if (duration > MAX_VIDEO_DURATION) {
      throw new Error(`Video duration exceeds ${MAX_VIDEO_DURATION} seconds limit`);
    }

    const blob = await uriToBlob(uri);
    
    if (blob.size > MAX_VIDEO_SIZE) {
      throw new Error(`Video size exceeds ${MAX_VIDEO_SIZE / 1024 / 1024}MB limit`);
    }

    const ext = uri.split('.').pop() || 'mp4';
    const filename = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Use Blob directly - ArrayBuffer conversion can hang in Expo web

    let data: any | null = null;
    let error: any | null = null;
    try {
      const start = Date.now();
      const resp = await withTimeout(
        supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filename, blob, {
            contentType: 'video/mp4',
            upsert: false,
          }) as any,
        20000
      );
      data = (resp as any).data;
      error = (resp as any).error ?? null;
      const durationMs = Date.now() - start;
      console.log('[storageApi] supabase.storage.upload (video) result', {
        filename,
        durationMs,
        hasError: !!error,
        data,
      });
    } catch (e: any) {
      console.error('[storageApi] supabase.storage.upload (video) threw', e?.message || e);
      error = e;
    }

    let finalPath: string | null = null;
    if (error || !data?.path) {
      console.warn('[storageApi] Falling back to REST upload for video', {
        filename,
        hasError: !!error,
      });
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
