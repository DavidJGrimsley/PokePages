import React from 'react';
import { View, Text } from 'react-native';
import { SidebarCollapsible } from '@/src/components/UI/SidebarCollapsible';
import { usePokemonTrackerStore } from '@/src/store/pokemonTrackerStore';
import { useShallow } from 'zustand/react/shallow';
import { type Pokemon } from '@/data/Pokemon/LumioseDex';

interface ProgressSidebarProps {
  pokemonList: Pokemon[];
}

interface ProgressBarProps {
  title: string;
  obtained: number;
  total: number;
  percentage: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  title, 
  obtained, 
  total, 
  percentage, 
  color = 'bg-blue-500'
}) => (
  <View className="mb-4">
    <View className="flex-row justify-between items-center mb-1">
      <Text className="text-base font-semibold text-app-text">{title}</Text>
      <Text className="text-base font-bold text-app-accent">{percentage}%</Text>
    </View>
    <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
      <View 
        className={`h-full ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </View>
    <Text className="text-sm text-app-brown mt-1 text-center">
      {obtained} / {total}
    </Text>
  </View>
);

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({ pokemonList }) => {
  // Subscribe to the entire pokemon state to trigger re-renders on any change
  const pokemon = usePokemonTrackerStore((state) => state.pokemon);
  
  const {
    getPokedexProgress,
    getShinyDexProgress,
    getAlphaDexProgress,
    getShinyAlphaDexProgress,
    getMegaDexProgress,
    getMegaShinyDexProgress
  } = usePokemonTrackerStore(
    useShallow((state) => ({
      getPokedexProgress: state.getPokedexProgress,
      getShinyDexProgress: state.getShinyDexProgress,
      getAlphaDexProgress: state.getAlphaDexProgress,
      getShinyAlphaDexProgress: state.getShinyAlphaDexProgress,
      getMegaDexProgress: state.getMegaDexProgress,
      getMegaShinyDexProgress: state.getMegaShinyDexProgress,
    }))
  );

  // Calculate all progress metrics - will re-calculate when pokemon state changes
  const pokedexProgress = React.useMemo(() => getPokedexProgress(pokemonList), [pokemonList, getPokedexProgress, pokemon]);
  const shinyDexProgress = React.useMemo(() => getShinyDexProgress(pokemonList), [pokemonList, getShinyDexProgress, pokemon]);
  const alphaDexProgress = React.useMemo(() => getAlphaDexProgress(pokemonList), [pokemonList, getAlphaDexProgress, pokemon]);
  const shinyAlphaDexProgress = React.useMemo(() => getShinyAlphaDexProgress(pokemonList), [pokemonList, getShinyAlphaDexProgress, pokemon]);
  const megaDexProgress = React.useMemo(() => getMegaDexProgress(pokemonList), [pokemonList, getMegaDexProgress, pokemon]);
  const megaShinyDexProgress = React.useMemo(() => getMegaShinyDexProgress(pokemonList), [pokemonList, getMegaShinyDexProgress, pokemon]);

  return (
    <SidebarCollapsible 
      title="Progress" 
      backgroundColor="bg-green-50"
      borderColor="border-green-500"
    >
      <View className="space-y-2">
        <ProgressBar
          title="📖 Pokédex Completion"
          obtained={pokedexProgress.obtained}
          total={pokedexProgress.total}
          percentage={pokedexProgress.percentage}
          color="bg-blue-500"
        />
        
        <ProgressBar
          title="✨ Shiny Dex"
          obtained={shinyDexProgress.obtained}
          total={shinyDexProgress.total}
          percentage={shinyDexProgress.percentage}
          color="bg-yellow-500"
        />
        
        <ProgressBar
          title="🔴 Alpha Dex"
          obtained={alphaDexProgress.obtained}
          total={alphaDexProgress.total}
          percentage={alphaDexProgress.percentage}
          color="bg-red-500"
        />
        
        <ProgressBar
          title="👑 Shiny Alpha Dex"
          obtained={shinyAlphaDexProgress.obtained}
          total={shinyAlphaDexProgress.total}
          percentage={shinyAlphaDexProgress.percentage}
          color="bg-purple-500"
        />
        
        <ProgressBar
          title="💎 Mega Dex"
          obtained={megaDexProgress.obtained}
          total={megaDexProgress.total}
          percentage={megaDexProgress.percentage}
          color="bg-indigo-500"
        />
        
        <ProgressBar
          title="💎✨ Mega Shiny Dex"
          obtained={megaShinyDexProgress.obtained}
          total={megaShinyDexProgress.total}
          percentage={megaShinyDexProgress.percentage}
          color="bg-pink-500"
        />
      </View>
    </SidebarCollapsible>
  );
};