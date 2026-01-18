import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API Configuration for development vs production
const getApiUrl = (): string => {
  // Allow environment variable to override
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL.replace(/\/+$/, '');
  }
  
  // More robust development detection
  // Check for browser environment first
  const isBrowser = typeof window !== 'undefined';
  const hostname = isBrowser ? window?.location?.hostname : '';
  const isDev = __DEV__ || process.env.NODE_ENV === 'development' || hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isDev) {
    // Web dev:
    // - If loaded from a LAN hostname (e.g. 192.168.x.x:8081), prefer that same host for the API.
    // - If loaded from localhost, keep localhost.
    if (Platform.OS === 'web') {
      if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:3001`;
      }
      return 'http://localhost:3001';
    }

    // Native dev:
    // - Android emulator cannot reach the host via localhost, so use 10.0.2.2.
    // - Physical devices must hit your machine via LAN IP.
    if (Platform.OS === 'android' && !Constants.isDevice) {
      return 'http://10.0.2.2:3001';
    }

    const hostUri =
      (Constants as any)?.expoConfig?.hostUri ||
      (Constants as any)?.manifest?.debuggerHost ||
      (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

    if (typeof hostUri === 'string' && hostUri.length > 0) {
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:3001`;
      }
    }

    // Fallback (simulators often can reach localhost)
    return 'http://localhost:3001';
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