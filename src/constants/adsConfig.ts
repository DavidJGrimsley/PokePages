/**
 * Ad Configuration
 * 
 * NOW FETCHES FROM API: https://davidjgrimsley.com/api/content
 * This file provides legacy compatibility and transformation utilities.
 */

import { getAllAds as fetchAllAds, getRandomAd as apiGetRandomAd, getAdById as apiGetAdById, type AdConfig as APIAdConfig } from '@/services/contentApi';

export interface AdConfig {
  /** Unique identifier for the ad */
  id: string;
  
  /** Main heading/service name */
  title: string;
  
  /** Short catchy tagline (shown in banner) */
  tagline: string;
  
  /** Detailed description (shown in modal) */
  description: string;
  
  /** Call-to-action button text */
  ctaText: string;
  
  /** Internal route path for form (optional) */
  internalFormRoute?: string;
  
  /** External URL for intake form or more info */
  externalUrl: string;
  
  /** Google Forms URL for embedded intake form (optional) */
  formUrl?: string;
  
  /** List of key features/benefits */
  features: string[];
  
  /** Icon name from Ionicons */
  icon: string;
  
  /** Accent color (Tailwind color class suffix, e.g., 'blue', 'purple') */
  accentColor: string;
}

/**
 * Icon mapping for services
 */
const iconMap: Record<string, string> = {
  'app-development': 'phone-portrait-outline',
  'website-building': 'globe-outline',
  'game-development': 'game-controller-outline',
  'tutoring': 'school-outline',
  'online-presence': 'trending-up-outline',
};

/**
 * Color mapping from hex to Tailwind color names
 */
const colorMap: Record<string, string> = {
  '#0E668B': 'blue',
  '#1E9E70': 'green',
  '#723B80': 'purple',
  '#EEA444': 'orange',
  '#D63C83': 'pink',
};

/**
 * Transform API ad to legacy AdConfig format
 */
function transformApiAd(apiAd: APIAdConfig): AdConfig {
  const accentColor = colorMap[apiAd.accent] || 'blue';
  const icon = iconMap[apiAd.serviceId] || 'information-circle-outline';
  
  return {
    id: apiAd.id,
    title: apiAd.headline,
    tagline: apiAd.body.split('.')[0] || apiAd.body.substring(0, 50),
    description: apiAd.body,
    ctaText: apiAd.ctaLabel,
    externalUrl: apiAd.ctaUrl,
    internalFormRoute: `/intake/${apiAd.serviceId}`,
    features: [], // Features not included in API response
    icon,
    accentColor,
  };
}

/**
 * Get all ad configurations as an array
 * NOW FETCHES FROM API
 */
export const getAllAds = async (): Promise<AdConfig[]> => {
  try {
    const apiAds = await fetchAllAds();
    return apiAds.map(transformApiAd);
  } catch (error) {
    console.error('Failed to fetch ads from API:', error);
    return []; // Return empty array on error
  }
};

/**
 * Get a random ad from the pool
 * NOW FETCHES FROM API
 */
export const getRandomAd = async (): Promise<AdConfig | null> => {
  try {
    const apiAd = await apiGetRandomAd();
    return transformApiAd(apiAd);
  } catch (error) {
    console.error('Failed to fetch random ad from API:', error);
    return null;
  }
};

/**
 * Get an ad by ID
 * NOW FETCHES FROM API
 */
export const getAdById = async (id: string): Promise<AdConfig | undefined> => {
  try {
    const apiAd = await apiGetAdById(id);
    return apiAd ? transformApiAd(apiAd) : undefined;
  } catch (error) {
    console.error('Failed to fetch ad by ID from API:', error);
    return undefined;
  }
};

export type AdConfigKey = string; // No longer limited to hardcoded keys
