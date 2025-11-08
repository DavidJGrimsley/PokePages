// src/utils/supabaseClient.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Ensure crypto.randomUUID exists in web/prod builds (needed by supabase auth helpers)
(() => {
  try {
    const g: any = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : undefined);
    if (!g) return;
    const c: any = g.crypto ?? (typeof window !== 'undefined' ? (window as any).crypto : undefined);
    if (c && typeof c.getRandomValues === 'function' && typeof c.randomUUID !== 'function') {
      // RFC4122 v4 UUID polyfill using getRandomValues
      c.randomUUID = () => {
        const bytes = new Uint8Array(16);
        c.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        const hex = Array.from(bytes, toHex).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      };
    }
    if (!g.crypto && c) {
      g.crypto = c;
    }
  } catch {
    // ignore polyfill failures
  }
})();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug logging for Android
if (Platform.OS === 'android' && __DEV__) {
  console.log('🔍 Supabase Client Configuration:');
  console.log('Platform:', Platform.OS);
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Has Anon Key:', !!SUPABASE_ANON_KEY);
}

// Check if we're in a browser environment
const isWeb = Platform.OS === 'web';

// Custom storage adapter for web
const webStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: isWeb ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Let Supabase automatically handle OAuth callback on web
    flowType: 'implicit', // Use implicit flow for web OAuth
  },
  // Add explicit headers for content negotiation
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
});
