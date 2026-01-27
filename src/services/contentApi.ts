/**
 * Content API Service
 * 
 * Fetches service ads and content from DavidsPortfolio API
 * Production URL: https://davidjgrimsley.com/api/content
 */

const API_BASE_URL = 'https://davidjgrimsley.com';

export interface AdConfig {
  /** Unique identifier for the ad */
  id: string;
  
  /** Service this ad is promoting */
  serviceId: string;
  
  /** Main heading/service name */
  headline: string;
  
  /** Detailed description */
  body: string;
  
  /** Call-to-action button text */
  ctaLabel: string;
  
  /** URL for CTA (can be route or external) */
  ctaUrl: string;
  
  /** Accent color hex code */
  accent: string;
  
  /** Optional placement targeting */
  placement?: string;
  
  /** Optional tags for filtering */
  tags?: string[];
}

export interface ContentPayload {
  version: string;
  generatedAt: string;
  services: any[];
  ads: AdConfig[];
}

/**
 * Fetch content from API with caching
 */
export async function getContent(): Promise<ContentPayload> {
  const response = await fetch(`${API_BASE_URL}/api/content`);

  if (!response.ok) {
    throw new Error(`Failed to load content (${response.status})`);
  }

  return response.json() as Promise<ContentPayload>;
}

/**
 * Get all ads from API
 */
export async function getAllAds(): Promise<AdConfig[]> {
  const content = await getContent();
  return content.ads;
}

/**
 * Get a random ad
 */
export async function getRandomAd(): Promise<AdConfig> {
  const ads = await getAllAds();
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
