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
    getMegaShinyDexProgress,
    getAlphaShinyMegaDexProgress
  } = usePokemonTrackerStore(
    useShallow((state) => ({
      getPokedexProgress: state.getPokedexProgress,
      getShinyDexProgress: state.getShinyDexProgress,
      getAlphaDexProgress: state.getAlphaDexProgress,
      getShinyAlphaDexProgress: state.getShinyAlphaDexProgress,
      getMegaDexProgress: state.getMegaDexProgress,
      getMegaShinyDexProgress: state.getMegaShinyDexProgress,
      getAlphaShinyMegaDexProgress: state.getAlphaShinyMegaDexProgress,
    }))
  );

  // Calculate all progress metrics - will re-calculate when pokemon state changes
  const pokedexProgress = React.useMemo(() => getPokedexProgress(pokemonList), [getPokedexProgress, pokemonList, pokemon]);
  const shinyDexProgress = React.useMemo(() => getShinyDexProgress(pokemonList), [getShinyDexProgress, pokemonList, pokemon]);
  const alphaDexProgress = React.useMemo(() => getAlphaDexProgress(pokemonList), [getAlphaDexProgress, pokemonList, pokemon]);
  const shinyAlphaDexProgress = React.useMemo(() => getShinyAlphaDexProgress(pokemonList), [getShinyAlphaDexProgress, pokemonList, pokemon]);
  const megaDexProgress = React.useMemo(() => getMegaDexProgress(pokemonList), [getMegaDexProgress, pokemonList, pokemon]);
  const megaShinyDexProgress = React.useMemo(() => getMegaShinyDexProgress(pokemonList), [getMegaShinyDexProgress, pokemonList, pokemon]);
  const alphaShinyMegaDexProgress = React.useMemo(() => getAlphaShinyMegaDexProgress(pokemonList), [getAlphaShinyMegaDexProgress, pokemonList, pokemon]);

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
        
        <ProgressBar
          title="👑💎 Alpha Shiny Mega Dex"
          obtained={alphaShinyMegaDexProgress.obtained}
          total={alphaShinyMegaDexProgress.total}
          percentage={alphaShinyMegaDexProgress.percentage}
          color="bg-gradient-to-r from-purple-600 to-pink-600"
        />
      </View>
    </SidebarCollapsible>
  );
};