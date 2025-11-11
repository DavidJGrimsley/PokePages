/**
 * Content Moderation Utilities
 * Prevents inappropriate, hateful, or harmful content from being posted
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
const openai = hasOpenAIKey
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// **TEMPORARILY DISABLED** - Hitting rate limits in development
// Re-enable in production with proper rate limiting/caching
let aiModerationEnabled = false; // TODO: Set to hasOpenAIKey when rate limits resolved
let aiDisableReason = 'Disabled to avoid rate limits during development';

function disableAIModeration(reason: string) {
  if (!aiModerationEnabled) {
    return;
  }
  aiModerationEnabled = false;
  aiDisableReason = reason;
  console.warn(`OpenAI moderation disabled: ${reason}. Falling back to basic moderation.`);
}

// Bad words list (basic fallback)
const PROFANITY_LIST = [
  // Add your list here - keeping it clean in this example
  'badword1',
  'badword2',
  // ... etc
];

export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
  flaggedCategories?: string[];
  confidence?: number;
  mode: 'ai' | 'basic' | 'advanced';
  fallbackReason?: string;
}

/**
 * Option 1: OpenAI Moderation API (RECOMMENDED)
 * Free, accurate, and fast
 */
export async function moderateContentWithAI(content: string): Promise<ModerationResult> {
  if (!aiModerationEnabled || !openai) {
    if (!openai && !aiDisableReason) {
      aiDisableReason = 'No OpenAI API key provided';
    }
    const basicResult = moderateContentBasic(content);
    return {
      ...basicResult,
      mode: 'basic',
      fallbackReason: aiDisableReason || 'AI moderation disabled',
    };
  }

  try {
    const moderation = await openai.moderations.create({
      input: content,
    });

    const result = moderation.results[0];
    
    // Check if content was flagged
    if (result.flagged) {
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);

      return {
        isAllowed: false,
        reason: `Content flagged for: ${flaggedCategories.join(', ')}`,
        flaggedCategories,
        confidence: Math.max(...Object.values(result.category_scores)),
        mode: 'ai',
      };
    }

    // Content is safe
    return {
      isAllowed: true,
      confidence: 1 - Math.max(...Object.values(result.category_scores)),
      mode: 'ai',
    };
  } catch (error: any) {
    console.error('OpenAI moderation error:', error);
    const status = error?.status ?? error?.code;
    if (status === 401 || status === 402 || status === 403 || status === 429 || status === 'insufficient_quota') {
      disableAIModeration(`API unavailable (${status})`);
    }
    // Fallback to basic check if API fails
    const basicResult = moderateContentBasic(content);
    return {
      ...basicResult,
      mode: 'basic',
      fallbackReason: aiDisableReason || `AI moderation error (${status ?? 'unknown'})`,
    };
  }
}

/**
 * Option 2: Basic Profanity Filter (FALLBACK)
 * Simple keyword matching
 */
export function moderateContentBasic(content: string): ModerationResult {
  const lowerContent = content.toLowerCase();
  
  // Check for profanity
  for (const word of PROFANITY_LIST) {
    if (lowerContent.includes(word.toLowerCase())) {
      return {
        isAllowed: false,
        reason: 'Content contains inappropriate language',
        mode: 'basic',
      };
    }
  }

  // Check for excessive caps (usually spam/angry)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7 && content.length > 20) {
    return {
      isAllowed: false,
      reason: 'Please avoid excessive use of capital letters',
      mode: 'basic',
    };
  }

  // Check for repetitive characters (spam indicator)
  if (/(.)\1{10,}/.test(content)) {
    return {
      isAllowed: false,
      reason: 'Content appears to be spam',
      mode: 'basic',
    };
  }

  // Check for suspicious URLs/links (spam protection)
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const urls = content.match(urlPattern) || [];
  if (urls.length > 3) {
    return {
      isAllowed: false,
      reason: 'Too many links detected',
      mode: 'basic',
    };
  }

  return { isAllowed: true, mode: 'basic' };
}

/**
 * Option 3: Advanced AI Content Analysis
 * Uses GPT to deeply analyze content sentiment and appropriateness
 */
export async function moderateContentAdvanced(content: string): Promise<ModerationResult> {
  try {
    if (!aiModerationEnabled || !openai) {
      return moderateContentWithAI(content);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cheap
      messages: [
        {
          role: 'system',
          content: `You are a content moderator for a Pokémon community app. 
Analyze if the content is appropriate for all ages, not hateful, not bullying, 
and follows community guidelines. Respond with JSON only:
{
  "isAllowed": boolean,
  "reason": "explanation if not allowed",
  "sentiment": "positive|neutral|negative",
  "concerns": ["list", "of", "concerns"]
}`,
        },
        {
          role: 'user',
          content: `Moderate this post: "${content}"`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      isAllowed: result.isAllowed,
      reason: result.reason,
      flaggedCategories: result.concerns,
      confidence: result.isAllowed ? 0.95 : 0.85,
      mode: 'advanced',
    };
  } catch (error: any) {
    console.error('Advanced moderation error:', error);
    const status = error?.status ?? error?.code;
    if (status === 401 || status === 402 || status === 403 || status === 429 || status === 'insufficient_quota') {
      disableAIModeration(`API unavailable (${status})`);
    }
    // Fallback to OpenAI moderation
    const fallback = await moderateContentWithAI(content);
    return {
      ...fallback,
      fallbackReason: fallback.fallbackReason || `Advanced AI moderation error (${status ?? 'unknown'})`,
    };
  }
}

/**
 * Main moderation function - choose your strategy
 */
export async function moderateContent(
  content: string,
  strategy: 'ai' | 'basic' | 'advanced' = 'ai'
): Promise<ModerationResult> {
  // Always do basic checks first (fast)
  const basicCheck = moderateContentBasic(content);
  if (!basicCheck.isAllowed) {
    return basicCheck;
  }

  // Then do AI check based on strategy
  switch (strategy) {
    case 'advanced':
      return moderateContentAdvanced(content);
    case 'ai':
      return moderateContentWithAI(content);
    case 'basic':
      return basicCheck;
    default:
      return basicCheck;
  }
}

/**
 * Filter/clean content (replace bad words with asterisks)
 */
export function filterContent(content: string): string {
  let filtered = content;
  
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  }
  
  return filtered;
}

/**
 * Get a user-friendly moderation message
 */
export function getModerationMessage(result: ModerationResult): string {
  if (result.isAllowed) {
    return 'Content approved';
  }

  const messages: Record<string, string> = {
    hate: '🚫 Please keep our community respectful. Hateful content is not allowed.',
    'hate/threatening': '🚫 Threatening content is strictly prohibited.',
    harassment: '🚫 Please be kind. Harassment is not tolerated.',
    'harassment/threatening': '🚫 Threatening language is not allowed.',
    'self-harm': '🚫 If you need help, please reach out to a crisis support service.',
    sexual: '🚫 Please keep content appropriate for all ages.',
    'sexual/minors': '🚫 This type of content is strictly prohibited.',
    violence: '🚫 Violent content is not allowed.',
    'violence/graphic': '🚫 Graphic content is not appropriate for our community.',
  };

  // If we have specific categories, use them
  if (result.flaggedCategories && result.flaggedCategories.length > 0) {
    const category = result.flaggedCategories[0];
    return messages[category] || result.reason || '🚫 Content violates community guidelines.';
  }

  return result.reason || '🚫 Content violates community guidelines.';
}

/**
 * Example usage in your post creation
 */
export async function exampleUsage() {
  const userPost = "This is a sample post about my favorite Pokémon!";
  
  // Moderate the content
  const result = await moderateContent(userPost, 'ai');
  
  if (!result.isAllowed) {
    console.log('❌ Post rejected:', getModerationMessage(result));
    return false;
  }
  
  console.log('✅ Post approved!');
  return true;
}
