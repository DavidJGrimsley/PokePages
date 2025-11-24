import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import type { NewsArticle } from '@/src/services/rssService';

interface NewsCardProps {
  article: NewsArticle;
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  // Local util to sanitize text: decode basic entities and strip HTML tags
  function cleanText(text: string | undefined): string {
    if (!text) return '';
    let t = text;
    // Decode common HTML entities
    t = t
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
      .replace(/&mdash;/g, '—');

    // Remove tags
    t = t.replace(/<[^>]*>/g, '');

    // Collapse whitespace
    t = t.replace(/\s+/g, ' ').trim();
    return t;
  }
  return (
    <Link href={`/(drawer)/news/${article.id}` as any} asChild>
      <Pressable className="bg-app-background dark:bg-dark-app-background border-l-4 border-l-red-500 rounded-lg mb-md shadow-app-small active:opacity-80 w-full sm:max-w-[80%] self-center">
        <View className="flex-row items-stretch h-28">
          {/* Image */}
          {article.imageUrl && (
            <View className="w-24 rounded-l-lg overflow-hidden">
              <Image 
                source={{ uri: article.imageUrl }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          )}
          
          {/* Content */}
          <View className={`flex-1 p-md justify-center ${article.imageUrl ? 'pl-sm' : ''}`}>
            {/* Date only */}
            <Text className="text-xs text-red-500 font-bold uppercase mb-xs">
              {formatDate(article.publishedDate)}
            </Text>
            
            {/* Title */}
            <Text 
              className="typography-subheader text-app-text dark:text-dark-app-text mb-xs" 
              numberOfLines={2}
            >
              {article.title}
            </Text>
            
            {/* Excerpt */}
            <Text 
              className="text-sm text-app-brown dark:text-dark-app-brown" 
              numberOfLines={2}
            >
              {cleanText(article.excerpt)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};
