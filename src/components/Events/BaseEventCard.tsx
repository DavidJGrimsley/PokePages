import React, { ReactNode } from 'react';
import { Link } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { cn } from '~/utils/cn';
import { getGameLabel } from '~/utils/gameLabels';

interface BaseEventCardProps {
  eventKey: string;
  title: string;
  game: string;
  description: string;
  statusBgClass: string;
  statusLabel: string;
  dateDisplay?: string;
  children?: ReactNode; // For additional content below (like promo code, claim buttons, etc.)
  additionalContent?: ReactNode; // For content between title and description (like raid level, challenge badge, etc.)
}

export const BaseEventCard: React.FC<BaseEventCardProps> = ({
  eventKey,
  title,
  game,
  description,
  statusBgClass,
  statusLabel,
  dateDisplay,
  children,
  additionalContent,
}) => {
  return (
    <View className="bg-app-white rounded-lg p-md mb-md shadow-app-small border border-app-secondary dark:border-dark-app-secondary">
      <Link href={`/(drawer)/events/${eventKey}` as any} asChild>
        <Pressable>
          <View className="mb-sm">
            <Text className="typography-subheader text-app-primary mb-xs">
              {title}
            </Text>
            <View className="flex-row items-center justify-between gap-xs flex-wrap">
              <View className="bg-app-primary px-sm py-xs rounded-md">
                <Text className="text-app-background text-xs font-bold">{getGameLabel(game)}</Text>
              </View>
              <View className={cn('px-sm py-xs rounded-md min-w-[70px] items-center', statusBgClass)}>
                <Text className="text-app-white text-xs font-bold">{statusLabel}</Text>
              </View>
            </View>
          </View>
          
          {additionalContent}
          
          <Text className="typography-copy text-app-secondary mb-xs" numberOfLines={1} ellipsizeMode="tail">
            {description}
          </Text>
          
          {dateDisplay && (
            <Text className="typography-copy text-app-text italic mb-sm">{dateDisplay}</Text>
          )}
        </Pressable>
      </Link>

      {children}
    </View>
  );
};
