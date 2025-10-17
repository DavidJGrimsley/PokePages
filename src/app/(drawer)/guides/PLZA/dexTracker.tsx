import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Head from 'expo-router/head';
import { Container } from '@/src/components/UI/Container';
import { AppText } from '@/src/components/TextTheme/AppText';
import { BouncyText } from '@/src/components/TextTheme/BouncyText';
import { SidebarCollapsible } from '@/src/components/UI/SidebarCollapsible';
import { ProgressSidebar } from '@/src/components/UI/ProgressSidebar';
import MultiLayerParallaxScrollView from '@/src/components/Parallax/MultiLayerParallaxScrollView';
import colors from '@/src/constants/style/colors';
import { cn } from '@/src/utils/cn';
import { usePokemonTrackerStore, type FormType } from '@/src/store/pokemonTrackerStore';
import { useShallow } from 'zustand/react/shallow';
import { nationalDex, type Pokemon } from '@/data/Pokemon/LumioseDex';

type FilterType = 'all' | 'alpha' | 'mega';

export default function DexTrackerPage() {
  const hasHydrated = usePokemonTrackerStore((state) => state._hasHydrated);
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter Pokemon based on selected filter
  const filteredPokemon = React.useMemo(() => {
    switch (filter) {
      case 'alpha':
        return nationalDex.filter(p => p.canBeAlpha);
      case 'mega':
        return nationalDex.filter(p => p.hasMega);
      default:
        return nationalDex;
    }
  }, [filter]);

  // Debug: Log the current pokemon tracker state (only on mount)
  useEffect(() => {
    const pokemon = usePokemonTrackerStore.getState().pokemon;
    console.log('[DEX TRACKER PAGE] Current pokemon tracker state:', pokemon);
    console.log('[DEX TRACKER PAGE] Has hydrated:', hasHydrated);
  }, [hasHydrated]);

  const FilterButton = ({ filterType, label, count }: { filterType: FilterType; label: string; count: number }) => (
    <Pressable
      onPress={() => setFilter(filterType)}
      className={cn(
        'px-4 py-2 rounded-lg border-2 flex-1 items-center justify-center',
        filter === filterType
          ? 'bg-blue-500 border-blue-600'
          : 'bg-gray-200 border-gray-300'
      )}
    >
      <Text className={cn(
        'text-sm font-semibold',
        filter === filterType ? 'text-white' : 'text-gray-700'
      )}>
        {label}
      </Text>
      <Text className={cn(
        'text-xs mt-0.5',
        filter === filterType ? 'text-blue-100' : 'text-gray-500'
      )}>
        {count} Pokémon
      </Text>
    </Pressable>
  );

  const FormButton = ({ 
    dex, 
    form, 
    label, 
    emoji 
  }: { 
    dex: number; 
    form: FormType; 
    label: string; 
    emoji: string;
  }) => {
    // Subscribe to this specific form's status reactively
    const isObtained = usePokemonTrackerStore((state) => 
      state.pokemon[dex]?.[form] || false
    );
    const toggleForm = usePokemonTrackerStore((state) => state.toggleForm);
    
    return (
      <Pressable
        onPress={() => toggleForm(dex, form)}
        className={cn(
          'flex-1 py-2 px-2 rounded-md border-2 items-center justify-center min-w-[70px]',
          isObtained 
            ? 'bg-green-500 border-green-600' 
            : 'bg-gray-200 border-gray-300'
        )}
      >
        <Text className="text-xs font-semibold text-center">
          {emoji}
        </Text>
        <Text className={cn(
          'text-xs font-medium text-center mt-0.5',
          isObtained ? 'text-white' : 'text-gray-700'
        )}>
          {label}
        </Text>
      </Pressable>
    );
  };

  const PokemonRow = ({ pokemon }: { pokemon: Pokemon }) => {
    const { id: dex, name, hasMega, canBeAlpha } = pokemon;
    
    // Subscribe to a tuple of primitive values with shallow comparison
    const [normal, shiny, alpha, alphaShiny] = usePokemonTrackerStore(
      useShallow((state) => {
        const s = state.pokemon[dex];
        return [!!s?.normal, !!s?.shiny, !!s?.alpha, !!s?.alphaShiny] as const;
      })
    );
    
    // Calculate forms based on what's available for this Pokemon
    const availableForms = canBeAlpha ? 4 : 2;
    const obtainedForms = canBeAlpha 
      ? [normal, shiny, alpha, alphaShiny].filter(Boolean).length
      : [normal, shiny].filter(Boolean).length;
    
    return (
      <View className="mb-3">
        <View className="flex-row items-center mb-2">
          <Text className="text-sm font-bold text-app-text w-12">#{String(dex).padStart(4, '0')}</Text>
          <Text className="text-lg font-semibold text-app-text flex-1">{name}</Text>
          
          {/* Show badges for special abilities */}
          <View className="flex-row gap-1 mr-2">
            {hasMega && (
              <View className="bg-purple-500 px-1.5 py-0.5 rounded">
                <Text className="text-xs text-white font-bold">M</Text>
              </View>
            )}
            {canBeAlpha && (
              <View className="bg-red-500 px-1.5 py-0.5 rounded">
                <Text className="text-xs text-white font-bold">α</Text>
              </View>
            )}
          </View>
          
          {obtainedForms > 0 && (
            <View className="bg-blue-500 px-2 py-0.5 rounded-full">
              <Text className="text-xs text-white font-bold">{obtainedForms}/{availableForms}</Text>
            </View>
          )}
        </View>
        
        <View className="flex-row gap-2">
          <FormButton dex={dex} form="normal" label="Registered" emoji="⚪" />
          <FormButton dex={dex} form="shiny" label="Shiny" emoji="✨" />
          {canBeAlpha && (
            <>
              <FormButton dex={dex} form="alpha" label="Alpha" emoji="🔴" />
              <FormButton dex={dex} form="alphaShiny" label="Alpha ✨" emoji="👑" />
            </>
          )}
        </View>
      </View>
    );
  };

  if (!hasHydrated) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.light.accent} />
          <Text className="mt-4 text-app-text">Loading your collection...</Text>
        </View>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Pokédex Tracker - PokéPages</title>
        <meta name="description" content="Track your Pokémon collection in Pokémon Legends Z-A" />
      </Head>
      
      <MultiLayerParallaxScrollView
        headerBackgroundColor={{ light: colors.light.background, dark: colors.dark.background }}
        headerHeight={180}
        titleElement={
          <View className="flex-1 justify-center items-center px-4">
            <BouncyText text="Pokédex Tracker" />
            <AppText className="text-center text-app-brown text-lg mt-2">
              Track your Pokédex completion and special forms
            </AppText>
          </View>
        }
      >
        <Container>
          {/* Filter Buttons */}
          <View className="flex-row gap-2 mb-6">
            <FilterButton 
              filterType="all" 
              label="All" 
              count={nationalDex.length} 
            />
            <FilterButton 
              filterType="alpha" 
              label="Alpha" 
              count={nationalDex.filter(p => p.canBeAlpha).length} 
            />
            <FilterButton 
              filterType="mega" 
              label="Mega" 
              count={nationalDex.filter(p => p.hasMega).length} 
            />
          </View>

          {/* Progress Sidebar */}
          <ProgressSidebar pokemonList={nationalDex} />

          {/* Instructions */}
          <SidebarCollapsible
            title="📝 How to Use"
            backgroundColor="bg-blue-50"
            borderColor="border-blue-500"
          >
            <Text className="text-xs text-app-brown mb-1">• Tap a button to toggle obtained status (gray → green)</Text>
            <Text className="text-xs text-app-brown mb-1">• ⚪ Registered: Caught the regular version at least once</Text>
            <Text className="text-xs text-app-brown mb-1">• ✨ Shiny: Caught the shiny version (non-alpha) at least once</Text>
            <Text className="text-xs text-app-brown mb-1">• 🔴 Alpha: Caught the alpha version (non-shiny) at least once</Text>
            <Text className="text-xs text-app-brown mb-3">• 👑 Alpha ✨: Caught the shiny alpha version at least once</Text>
            
            {/* Badges section */}
            <Text className="text-sm font-semibold text-app-text mb-2">🏷️ Badges:</Text>
            <View className="flex-row gap-4">
              <View className="flex-row items-center">
                <View className="bg-purple-500 px-1.5 py-0.5 rounded mr-1">
                  <Text className="text-xs text-white font-bold">M</Text>
                </View>
                <Text className="text-xs text-app-brown">Has Mega Evolution</Text>
              </View>
              <View className="flex-row items-center">
                <View className="bg-red-500 px-1.5 py-0.5 rounded mr-1">
                  <Text className="text-xs text-white font-bold">α</Text>
                </View>
                <Text className="text-xs text-app-brown">Can be Alpha</Text>
              </View>
            </View>
          </SidebarCollapsible>

          {/* Pokémon List */}
          <View className="bg-app-white p-4 rounded-lg shadow-app-medium">
            <Text className="text-lg font-bold text-app-text mb-4">
              {filter === 'all' ? 'All Pokémon' : 
               filter === 'alpha' ? 'Alpha Pokémon' : 
               'Mega Evolution Pokémon'} ({filteredPokemon.length})
            </Text>
            {filteredPokemon.map((pokemon) => (
              <PokemonRow key={pokemon.id} pokemon={pokemon} />
            ))}
          </View>

          {/* Footer Note */}
          <View className="mt-6 mb-4">
            <Text className="text-xs text-center text-app-brown italic">
              💾 Your progress is automatically saved locally
            </Text>
            <Text className="text-xs text-center text-app-brown italic mt-1">
              (Supabase sync coming soon!)
            </Text>
          </View>
        </Container>
      </MultiLayerParallaxScrollView>
    </>
  );
}
