import { Platform } from 'react-native';

// API Configuration for development vs production
const getApiUrl = (): string => {
  // Allow environment variable to override
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    // return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // More robust development detection
  // Check for browser environment first
  const isBrowser = typeof window !== 'undefined';
  const hostname = isBrowser ? window.location.hostname : '';
  const isDev = __DEV__ || process.env.NODE_ENV === 'development' || hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isDev) {
    // For Android emulator, use 10.0.2.2 instead of localhost
    // For iOS simulator and web, localhost works fine
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001';
    } else {
      return 'http://localhost:3001';
    }
  } else {
    return 'https://api.pokepages.app';
  }
};

export const API_BASE_URL = getApiUrl();

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // If endpoint contains a query string, do NOT append a trailing slash
  // Also avoid trailing slash when endpoint already ends with '/'
  const hasQuery = cleanEndpoint.includes('?');
  const endsWithSlash = cleanEndpoint.endsWith('/');
  const base = `${API_BASE_URL}/${cleanEndpoint}`;
  return hasQuery || endsWithSlash ? base : `${base}/`;
};

// Special case for routes that don't use trailing slashes
export const buildApiUrlNoTrailingSlash = (endpoint: string): string => {
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};