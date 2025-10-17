import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '@/src/utils/cn';

interface SidebarCollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  borderColor?: string;
  backgroundColor?: string;
  className?: string;
}

export const SidebarCollapsible: React.FC<SidebarCollapsibleProps> = ({
  title,
  children,
  defaultExpanded = false,
  borderColor = 'border-blue-500',
  backgroundColor = 'bg-blue-50',
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View className={cn('rounded-lg border-l-4 mb-6', borderColor, className)}>
      <Pressable
        onPress={toggleExpanded}
        className={cn(
          'p-4 rounded-lg transition-all duration-200',
          backgroundColor,
          isExpanded ? 'rounded-b-none' : ''
        )}
      >
        <View className="flex-row items-center justify-center">
          <Text className="text-base font-semibold text-app-text text-center">
            {title}
          </Text>
          <View className="ml-2">
            <Text className="text-app-text font-bold">
              {isExpanded ? '▼' : '▶'}
            </Text>
          </View>
        </View>
      </Pressable>
      
      {isExpanded && (
        <View className={cn('p-4 pt-0 rounded-lg rounded-t-none', backgroundColor)}>
          {children}
        </View>
      )}
    </View>
  );
};