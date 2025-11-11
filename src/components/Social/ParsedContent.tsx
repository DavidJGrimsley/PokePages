import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface ParsedContentProps {
  content: string;
  className?: string;
}

/**
 * Component that parses text content and makes hashtags clickable
 * Hashtags are detected as #word patterns and rendered as links
 */
export function ParsedContent({ content, className = '' }: ParsedContentProps) {
  // Regex to match hashtags: # followed by alphanumeric and underscores
  const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
  
  // Split content by hashtags
  const parts = content.split(hashtagRegex);
  
  return (
    <Text className={className}>
      {parts.map((part, index) => {
        // Check if this part is a hashtag
        if (part.match(hashtagRegex)) {
          const tag = part.substring(1); // Remove the # symbol
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                // Navigate to feed with hashtag filter
                router.push({
                  pathname: '/(drawer)/social/(tabs)/feed',
                  params: { hashtag: tag }
                });
              }}
            >
              <Text className="text-blue-500 dark:text-blue-400 font-semibold">
                {part}
              </Text>
            </TouchableOpacity>
          );
        }
        // Regular text
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
}
