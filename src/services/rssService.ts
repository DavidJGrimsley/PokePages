import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  publishedDate: string;
  link: string;
  content?: string; // Full content for detail page
}

const RSS_FEED_URL = 'https://pokemondb.net/news/feed';
// Use CORS proxy for web platform
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const CACHE_KEY = 'pokemondb_news_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CacheData {
  articles: NewsArticle[];
  timestamp: number;
}

/**
 * Parse RSS XML to extract article data
 */
function parseRSSFeed(xmlText: string): NewsArticle[] {
  const articles: NewsArticle[] = [];
  
  try {
    console.log('[RSS Service] Parsing RSS feed, XML length:', xmlText.length);
    
    // Extract all <item> elements
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = xmlText.matchAll(itemRegex);
    
    let itemCount = 0;
    for (const itemMatch of items) {
      itemCount++;
      const itemContent = itemMatch[1];
      
      // Extract fields
      const title = extractTag(itemContent, 'title');
      const link = extractTag(itemContent, 'link');
      const pubDate = extractTag(itemContent, 'pubDate');
      const categoryRaw = extractTag(itemContent, 'category');
      console.log(`[RSS Service] Raw category for "${title.substring(0, 30)}":`, categoryRaw);
      const category = stripHtml(categoryRaw || 'News');
      console.log(`[RSS Service] Cleaned category:`, category);
      const description = extractTag(itemContent, 'description');
      const contentEncoded = extractTag(itemContent, 'content:encoded');

      // Log raw and cleaned description/contentEncoded for debugging
      console.log(`[RSS Service] Item ${itemCount} description raw:`, description?.substring(0, 300));
      const cleanedDescription = stripHtml(description || '');
      console.log(`[RSS Service] Item ${itemCount} description cleaned:`, cleanedDescription?.substring(0, 300));
      console.log(`[RSS Service] Item ${itemCount} contentEncoded raw:`, contentEncoded?.substring(0, 300));
      const cleanedContentEncoded = stripHtml(contentEncoded || '');
      console.log(`[RSS Service] Item ${itemCount} contentEncoded cleaned:`, cleanedContentEncoded?.substring(0, 300));
      
      console.log(`[RSS Service] Item ${itemCount}:`, { title: title.substring(0, 50), link });
      
      // Extract first image from content (check full item first, then content, then description)
      const imageUrl = extractFirstImage(itemContent) || extractFirstImage(contentEncoded || '') || extractFirstImage(description || '');
      
      if (!imageUrl) {
        console.log('[RSS Service] No image found for:', title.substring(0, 30));
      }
      
      // Choose a source for excerpt and create a cleaned excerpt from it
      const sourceForExcerpt = description || contentEncoded || '';
      const cleanedSource = stripHtml(sourceForExcerpt);
      const excerpt = createExcerpt(cleanedSource);

      // Log cleaned source snippet and excerpt for debugging
      console.log(`[RSS Service] Item ${itemCount} cleanedSource snippet:`, cleanedSource.substring(0, 140));
      console.log(`[RSS Service] Item ${itemCount} excerpt:`, excerpt);

      // Additional logging: excerpt length and presence of '<' or HTML entities
      console.log(`[RSS Service] Item ${itemCount} excerpt length:`, excerpt.length);
      console.log(`[RSS Service] Item ${itemCount} source has '<'?:`, /</.test(sourceForExcerpt));
      console.log(`[RSS Service] Item ${itemCount} cleanedSource has '<' after strip?:`, /</.test(cleanedSource));
      
      // Generate ID from link
      const id = generateIdFromLink(link);
      
      if (title && link) {
        articles.push({
          id,
          title: stripHtml(title),
          excerpt,
          imageUrl,
          category,
          publishedDate: pubDate,
          link,
          content: contentEncoded || description,
        });
        console.log(`[RSS Service] Added article: ${title.substring(0, 50)}`);
      } else {
        console.warn(`[RSS Service] Skipping item ${itemCount} - missing title or link`);
      }
    }
    
    console.log(`[RSS Service] Parsed ${articles.length} articles from ${itemCount} items`);
  } catch (error) {
    console.error('[RSS Service] Parse error:', error);
  }
  
  return articles;
}

/**
 * Extract content between XML tags
 */
function extractTag(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  if (!match) return '';
  
  // Decode HTML entities and CDATA
  let content = match[1].trim();
  
  // Remove CDATA wrapping
  content = content.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
  
  // Decode common HTML entities
  content = content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—');
  
  return content;
}

/**
 * Extract first image URL from HTML content
 */
function extractFirstImage(html: string): string | undefined {
  if (!html) return undefined;
  
  // Try multiple image extraction patterns
  const patterns = [
    /<img[^>]+src=["']([^"']+)["']/i,
    /<media:content[^>]+url=["']([^"']+)["']/i,
    /<enclosure[^>]+url=["']([^"']+)["']/i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      console.log('[RSS Service] Found image:', match[1]);
      return match[1];
    }
  }
  
  // Last resort: find any image URL in the text
  const urlMatch = html.match(/https?:\/\/[^\s<>"']+\.(?:jpg|jpeg|png|gif|webp)/i);
  if (urlMatch) {
    console.log('[RSS Service] Found image URL:', urlMatch[0]);
    return urlMatch[0];
  }
  
  return undefined;
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  if (!html) return '';
  
  return html
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove CDATA
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Create excerpt from text (1-2 sentences, max 150 chars)
 */
function createExcerpt(text: string): string {
  // Find first 1-2 sentences
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  const sentences = text.match(sentenceRegex);
  
  if (!sentences || sentences.length === 0) {
    return text.substring(0, 150) + '...';
  }
  
  let excerpt = sentences[0];
  if (sentences.length > 1 && excerpt.length < 100) {
    excerpt += ' ' + sentences[1];
  }
  
  // Trim to 150 chars if needed
  if (excerpt.length > 150) {
    excerpt = excerpt.substring(0, 147) + '...';
  }
  
  return excerpt.trim();
}

/**
 * Generate stable ID from article link
 */
function generateIdFromLink(link: string): string {
  const urlParts = link.split('/');
  const slug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
  return slug.replace(/[^a-z0-9-]/gi, '-');
}

/**
 * Fetch news from cache or network
 */
export async function fetchNews(forceRefresh = false): Promise<NewsArticle[]> {
  try {
    console.log('[RSS Service] fetchNews called, forceRefresh:', forceRefresh);
    
    // Check cache first (unless forced refresh)
    if (!forceRefresh) {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const cache: CacheData = JSON.parse(cachedData);
        const now = Date.now();
        const age = now - cache.timestamp;
        
        console.log(`[RSS Service] Cache found, age: ${Math.round(age / 1000)}s, valid: ${age < CACHE_DURATION}`);
        
        // Return cached data if still valid
        if (now - cache.timestamp < CACHE_DURATION) {
          console.log(`[RSS Service] Returning ${cache.articles.length} cached articles`);
          return cache.articles;
        }
      } else {
        console.log('[RSS Service] No cache found');
      }
    }
    
    // Fetch fresh data
    const fetchUrl = Platform.OS === 'web' 
      ? `${CORS_PROXY}${encodeURIComponent(RSS_FEED_URL)}`
      : RSS_FEED_URL;
    
    console.log('[RSS Service] Fetching fresh news from:', fetchUrl);
    const response = await fetch(fetchUrl);
    
    console.log('[RSS Service] Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    console.log('[RSS Service] Received XML, length:', xmlText.length);
    console.log('[RSS Service] XML preview:', xmlText.substring(0, 200));
    const articles = parseRSSFeed(xmlText);
    
    // Cache the results
    const cacheData: CacheData = {
      articles,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    
    console.log(`[RSS Service] Fetched ${articles.length} articles`);
    return articles;
    
  } catch (error) {
    console.error('[RSS Service] Fetch error:', error);
    console.error('[RSS Service] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    if (error instanceof Error) {
      console.error('[RSS Service] Error message:', error.message);
      console.error('[RSS Service] Error stack:', error.stack);
    }
    
    // Try to return stale cache on error
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const cache: CacheData = JSON.parse(cachedData);
        console.log(`[RSS Service] Returning ${cache.articles.length} stale cached articles due to error`);
        return cache.articles;
      }
    } catch (cacheError) {
      console.error('[RSS Service] Cache read error:', cacheError);
    }
    
    console.log('[RSS Service] No cache available, returning empty array');
    return [];
  }
}

/**
 * Get the most recent N articles
 */
export async function getRecentNews(count: number = 2): Promise<NewsArticle[]> {
  console.log(`[RSS Service] getRecentNews called, requesting ${count} articles`);
  const articles = await fetchNews();
  console.log(`[RSS Service] getRecentNews returning ${Math.min(articles.length, count)} of ${articles.length} articles`);
  return articles.slice(0, count);
}

/**
 * Get a single article by ID
 */
export async function getArticleById(id: string): Promise<NewsArticle | null> {
  const articles = await fetchNews();
  return articles.find(article => article.id === id) || null;
}

/**
 * Clear the news cache
 */
export async function clearNewsCache(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
}
