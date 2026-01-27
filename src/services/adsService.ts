/**
 * Ads Service - Offline-First Ad Configuration
 * 
 * Fetches ads from DavidsPortfolio API with offline-first caching strategy:
 * - Loads from cache immediately (instant UX)
 * - Fetches fresh data in background
 * - Updates cache when new data available
 * - Works offline using last cached data
 * - Cross-platform: AsyncStorage (mobile) + localStorage (web)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = 'https://davidjgrimsley.com/api/content';
const CACHE_KEY = 'ads_cache';
const CACHE_TIMESTAMP_KEY = 'ads_cache_timestamp';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// ===========================
// Type Definitions
// ===========================

export interface AdConfig {
  id: string;
  title: string;
  tagline: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  icon: string;
  accentColor: string;
  internalFormRoute?: string;
  features?: string[];
}

interface APIAdConfig {
  id: string;
  serviceId: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  accent: string;
}

interface ContentPayload {
  version: string;
  generatedAt: string;
  services: any[];
  ads: APIAdConfig[];
}

// ===========================
// Storage Abstraction
// ===========================

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

// ===========================
// Transformation Logic
// ===========================

const iconMap: Record<string, string> = {
  'app-development': 'phone-portrait-outline',
  'website-building': 'globe-outline',
  'game-development': 'game-controller-outline',
  'tutoring': 'school-outline',
  'online-presence': 'trending-up-outline',
};

const colorMap: Record<string, string> = {
  '#0E668B': 'blue',
  '#1E9E70': 'green',
  '#723B80': 'purple',
  '#EEA444': 'orange',
  '#D63C83': 'pink',
};

function transformApiAd(apiAd: APIAdConfig): AdConfig {
  const accentColor = colorMap[apiAd.accent] || 'blue';
  const icon = iconMap[apiAd.serviceId] || 'information-circle-outline';
  
  return {
    id: apiAd.id,
    title: apiAd.headline,
    tagline: apiAd.body.split('.')[0] || apiAd.body.substring(0, 50),
    description: apiAd.body,
    ctaText: apiAd.ctaLabel,
    ctaUrl: apiAd.ctaUrl,
    icon,
    accentColor,
    internalFormRoute: `/intake/${apiAd.serviceId}`,
    features: [],
  };
}

// ===========================
// Cache Management
// ===========================

async function getCachedAds(): Promise<AdConfig[] | null> {
  try {
    const cachedData = await storage.getItem(CACHE_KEY);
    if (!cachedData) return null;
    
    return JSON.parse(cachedData) as AdConfig[];
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

async function setCachedAds(ads: AdConfig[]): Promise<void> {
  try {
    await storage.setItem(CACHE_KEY, JSON.stringify(ads));
    await storage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

async function isCacheExpired(): Promise<boolean> {
  try {
    const timestamp = await storage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return true;
    
    const age = Date.now() - parseInt(timestamp, 10);
    return age > CACHE_DURATION;
  } catch {
    return true;
  }
}

// ===========================
// API Fetching
// ===========================

async function fetchAdsFromAPI(): Promise<AdConfig[]> {
  const response = await fetch(API_URL);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const payload: ContentPayload = await response.json();
  return payload.ads.map(transformApiAd);
}

// ===========================
// Public API - Offline-First
// ===========================

/**
 * Get all ads with offline-first strategy:
 * 1. Return cached data immediately if available
 * 2. Fetch fresh data in background if cache expired
 * 3. Update cache with fresh data
 */
export async function getAllAds(): Promise<AdConfig[]> {
  // Try cache first for instant UX
  const cachedAds = await getCachedAds();
  const cacheExpired = await isCacheExpired();
  
  // If cache is valid, return it immediately
  if (cachedAds && !cacheExpired) {
    return cachedAds;
  }
  
  // If cache exists but expired, return it while fetching fresh data
  if (cachedAds && cacheExpired) {
    // Return cached data immediately
    fetchAdsFromAPI()
      .then(setCachedAds)
      .catch(error => console.error('Background refresh failed:', error));
    
    return cachedAds;
  }
  
  // No cache available - must fetch (blocks until data arrives)
  try {
    const freshAds = await fetchAdsFromAPI();
    await setCachedAds(freshAds);
    return freshAds;
  } catch (error) {
    console.error('Failed to fetch ads:', error);
    
    // Last resort: return empty array
    return [];
  }
}

/**
 * Force refresh ads from API (ignores cache)
 */
export async function refreshAds(): Promise<AdConfig[]> {
  const freshAds = await fetchAdsFromAPI();
  await setCachedAds(freshAds);
  return freshAds;
}

/**
 * Get a random ad
 */
export async function getRandomAd(): Promise<AdConfig | null> {
  const ads = await getAllAds();
  if (ads.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * ads.length);
  return ads[randomIndex];
}

/**
 * Get ad by ID
 */
export async function getAdById(id: string): Promise<AdConfig | undefined> {
  const ads = await getAllAds();
  return ads.find(ad => ad.id === id);
}

/**
 * Clear cache (useful for debugging)
 */
export async function clearAdsCache(): Promise<void> {
  await storage.removeItem(CACHE_KEY);
  await storage.removeItem(CACHE_TIMESTAMP_KEY);
}
