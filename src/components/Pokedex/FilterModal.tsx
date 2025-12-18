import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { cn } from '@/src/utils/cn';
import type { Pokemon } from '@/data/Pokemon/types';

type FilterType = 'all' | 'alpha' | 'mega';
type DexType = 'all' | 'lumiose' | 'hyperspace';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  activeDex: DexType;
  setActiveDex: (dex: DexType) => void;
  lumioseDex: Pokemon[];
  hyperspaceDex: Pokemon[];
  getActiveDexCount: () => number;
}

export function FilterModal({
  visible,
  onClose,
  filter,
  setFilter,
  activeDex,
  setActiveDex,
  lumioseDex,
  hyperspaceDex,
  getActiveDexCount,
}: FilterModalProps) {
  const handleClearFilters = () => {
    setActiveDex('all');
    setFilter('all');
  };

  const hasActiveFilters = filter !== 'all' || activeDex !== 'all';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 bg-black/50 items-center justify-center"
        onPress={onClose}
      >
        <Pressable 
          className="bg-app-surface dark:bg-app-background rounded-xl p-6 mx-4 w-11/12 max-w-md shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header with Clear Button */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-app-text dark:text-gray-100" role="heading" aria-level={1}>
              Filter Options
            </Text>
            {hasActiveFilters && (
              <Pressable
                onPress={handleClearFilters}
                className="bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-lg"
              >
                <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                  Clear
                </Text>
              </Pressable>
            )}
          </View>
          
          {/* Dex Selection */}
          <Text className="text-sm font-semibold text-app-text dark:text-gray-200 mb-2" role="heading" aria-level={2}>
            Pokédex:
          </Text>
          <View className="flex-row gap-2 mb-6">
            <Pressable
              onPress={() => setActiveDex('all')}
              className={cn(
                'flex-1 py-3 px-3 rounded-lg border-2',
                activeDex === 'all'
                  ? 'bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-700'
                  : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              )}
            >
              <Text className={cn(
                'text-sm font-semibold text-center',
                activeDex === 'all' ? 'text-white dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
              )}>
                All
              </Text>
              <Text className={cn(
                'text-xs text-center mt-0.5',
                activeDex === 'all' ? 'text-green-100 dark:text-green-200' : 'text-gray-500 dark:text-gray-400'
              )}>
                {lumioseDex.length + hyperspaceDex.length}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveDex('lumiose')}
              className={cn(
                'flex-1 py-3 px-3 rounded-lg border-2',
                activeDex === 'lumiose'
                  ? 'bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-700'
                  : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              )}
            >
              <Text className={cn(
                'text-sm font-semibold text-center',
                activeDex === 'lumiose' ? 'text-white dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
              )}>
                Lumiose
              </Text>
              <Text className={cn(
                'text-xs text-center mt-0.5',
                activeDex === 'lumiose' ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'
              )}>
                {lumioseDex.length}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveDex('hyperspace')}
              className={cn(
                'flex-1 py-3 px-3 rounded-lg border-2',
                activeDex === 'hyperspace'
                  ? 'bg-purple-500 dark:bg-purple-600 border-purple-600 dark:border-purple-700'
                  : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              )}
            >
              <Text className={cn(
                'text-sm font-semibold text-center',
                activeDex === 'hyperspace' ? 'text-white dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
              )}>
                Hyperspace
              </Text>
              <Text className={cn(
                'text-xs text-center mt-0.5',
                activeDex === 'hyperspace' ? 'text-purple-100 dark:text-purple-200' : 'text-gray-500 dark:text-gray-400'
              )}>
                {hyperspaceDex.length}
              </Text>
            </Pressable>
          </View>

          {/* Type Filter */}
          <Text className="text-sm font-semibold text-app-text dark:text-gray-200 mb-2" role="heading" aria-level={2}>
            Form:
          </Text>
          <View className="flex-row gap-2 mb-6">
            <Pressable
              onPress={() => setFilter('all')}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg border-2',
                filter === 'all'
                  ? 'bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-700'
                  : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              )}
            >
              <Text className={cn(
                'text-sm font-semibold text-center',
                filter === 'all' ? 'text-white dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
              )}>
                All
              </Text>
              <Text className={cn(
                'text-xs text-center mt-0.5',
                filter === 'all' ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'
              )}>
                {getActiveDexCount()}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFilter('alpha')}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg border-2',
                filter === 'alpha'
                  ? 'bg-red-500 dark:bg-red-600 border-red-600 dark:border-red-700'
                  : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              )}
            >
              <Text className={cn(
                'text-sm font-semibold text-center',
                filter === 'alpha' ? 'text-white dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
              )}>
                Alpha
              </Text>
              <Text className={cn(
                'text-xs text-center mt-0.5',
                filter === 'alpha' ? 'text-red-100 dark:text-red-200' : 'text-gray-500 dark:text-gray-400'
              )}>
                {(activeDex === 'all' 
                  ? [...lumioseDex, ...hyperspaceDex]
                  : activeDex === 'lumiose' 
                  ? lumioseDex 
                  : hyperspaceDex
                ).filter(p => p.canBeAlpha).length}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFilter('mega')}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg border-2',
                filter === 'mega'
                  ? 'bg-purple-500 dark:bg-purple-600 border-purple-600 dark:border-purple-700'
                  : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              )}
            >
              <Text className={cn(
                'text-sm font-semibold text-center',
                filter === 'mega' ? 'text-white dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
              )}>
                Mega
              </Text>
              <Text className={cn(
                'text-xs text-center mt-0.5',
                filter === 'mega' ? 'text-purple-100 dark:text-purple-200' : 'text-gray-500 dark:text-gray-400'
              )}>
                {(activeDex === 'all' 
                  ? [...lumioseDex, ...hyperspaceDex]
                  : activeDex === 'lumiose' 
                  ? lumioseDex 
                  : hyperspaceDex
                ).filter(p => p.hasMega).length}
              </Text>
            </Pressable>
          </View>

          {/* Apply Button */}
          <Pressable
            onPress={onClose}
            className="bg-blue-500 dark:bg-blue-600 py-3 rounded-lg"
          >
            <Text className="text-white dark:text-gray-100 font-semibold text-center">
              Apply Filters
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
