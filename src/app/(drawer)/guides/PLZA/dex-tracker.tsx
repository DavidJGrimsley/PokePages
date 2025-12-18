import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import Head from 'expo-router/head';
import { Container } from '@/src/components/UI/Container';
import { ProgressSidebar } from '@/src/components/UI/ProgressSidebar';
import colors from '@/src/constants/style/colors';
import { cn } from '@/src/utils/cn';
import { usePokemonTrackerStore} from '@/src/store/dexTrackerStore';
import { useAuthStore } from '@/src/store/authStore';
import { useShallow } from 'zustand/react/shallow';
import { useFocusEffect } from '@react-navigation/native';
import { lumioseDex, type Pokemon } from '@/data/Pokemon/LegendsZA/LumioseDex';
import { hyperspaceDex } from '@/data/Pokemon/LegendsZA/HyperspaceDex';
import { type FormType }from '~/types/tracker';
import SearchBar from '@/src/components/Pokedex/LumioseDexSearch';
import AuthStatus from '@/src/components/Auth/AuthStatus';
import { Footer } from '@/src/components/Meta/Footer';
import { DualCollapsibleRow } from '@/src/components/Pokedex/DualCollapsibleRow';
import FavoriteToggle from '@/src/components/UI/FavoriteToggle';
import { registerFeature } from '@/src/utils/featureRegistry';
import { FilterModal } from '@/src/components/Pokedex/FilterModal';
import { useShowSignInAlert } from '@/src/hooks/useNavigateToSignIn';

export const FEATURE_KEY = 'feature:guides.PLZA.dex-tracker';
const FEATURE_TITLE = 'Legends: Z-A Form Tracker';
registerFeature({
  key: FEATURE_KEY,
  title: FEATURE_TITLE,
  path: '/guides/PLZA/dex-tracker',
  icon: 'calculator' });


type FilterType = 'all' | 'alpha' | 'mega';

export default function DexTrackerPage() {
  const hasHydrated = usePokemonTrackerStore((state) => state._hasHydrated);
  const user = useAuthStore((s) => s.user);
  const showAlertAndNavigateToSignIn = useShowSignInAlert();
  const [filter, setFilter] = useState<FilterType>('all');
  const [activeDex, setActiveDex] = useState<'all' | 'lumiose' | 'hyperspace'>('all');
  const [query, setQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filter Pokemon based on selected filter + search query
  const filteredPokemon = React.useMemo(() => {
    // Select the appropriate dex based on activeDex state
    let sourceDex: Pokemon[];
      switch (activeDex) {
      case 'all':
        sourceDex = [...lumioseDex, ...hyperspaceDex];
        break;
      case 'hyperspace':
        sourceDex = hyperspaceDex;
        break;
      case 'lumiose':
      default:
        sourceDex = lumioseDex;
        break;
    }

    if (!sourceDex || !Array.isArray(sourceDex)) {
      console.error('[DEX TRACKER] sourceDex is not available or not an array:', sourceDex);
      return [];
    }
    
    let base = sourceDex;
    switch (filter) {
      case 'alpha':
        base = base.filter(p => p?.canBeAlpha);
        break;
      case 'mega':
        base = base.filter(p => p?.hasMega);
        break;
      default:
        break;
    }

    const q = query.trim().toLowerCase();
    if (!q) return base;

    return base.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(q);
      const idMatch = String(p.id).includes(q) || String(p.id).padStart(4, '0').includes(q);
      return nameMatch || idMatch;
    });
  }, [activeDex, filter, query]);

  // Helper functions
  const getActiveDexName = () => {
    switch (activeDex) {
      case 'all':
        return 'All Pokédex';
      case 'lumiose':
        return 'Lumiose Dex';
      case 'hyperspace':
        return 'Hyperspace';
    }
  };

  const getActiveDexCount = () => {
    switch (activeDex) {
      case 'all':
        return lumioseDex.length + hyperspaceDex.length;
      case 'lumiose':
        return lumioseDex.length;
      case 'hyperspace':
        return hyperspaceDex.length;
    }
  };

  // After hydration/user change, load data for the active dex
  useEffect(() => {
    const userId = user?.id;
    if (hasHydrated && userId) {
      try {
        if (activeDex === 'all') {
          usePokemonTrackerStore.getState().loadFromDatabase('lumiose');
          usePokemonTrackerStore.getState().loadFromDatabase('hyperspace');
        } else {
          usePokemonTrackerStore.getState().loadFromDatabase(activeDex);
        }
      } catch (e) {
        console.error('[DEX TRACKER PAGE] Failed to trigger loadFromDatabase:', e);
      }
    }
  }, [hasHydrated, activeDex, user?.id]);

  // Refetch when screen gains focus (e.g., navigating back)
  useFocusEffect(
    React.useCallback(() => {
      const userId = user?.id;
      if (hasHydrated && userId) {
        try {
          if (activeDex === 'all') {
            usePokemonTrackerStore.getState().loadFromDatabase('lumiose');
            usePokemonTrackerStore.getState().loadFromDatabase('hyperspace');
          } else {
            usePokemonTrackerStore.getState().loadFromDatabase(activeDex);
          }
        } catch (e) {
          console.error('[DEX TRACKER PAGE] Focus reload failed:', e);
        }
      }
      return undefined;
    }, [hasHydrated, user?.id, activeDex])
  );

  const FormButton = ({ 
    dexNum, 
    form, 
    label, 
    emoji,
    pokedex
  }: { 
    dexNum: number; 
    form: FormType; 
    label: string; 
    emoji: string;
    pokedex: string;
  }) => {
    // Subscribe to this specific form's status for this pokedex
    const isObtained = usePokemonTrackerStore((state) => 
      state.pokemon[pokedex]?.[dexNum]?.[form] || false
    );
    const toggleForm = usePokemonTrackerStore((state) => state.toggleForm);
    
    return (
      <Pressable
        onPress={() => {
          console.log('[DEX TRACKER] Button pressed', { dexNum, form, pokedex, hasUser: !!user });
          if (!user) {
            console.log('[DEX TRACKER] No user, showing alert');
            showAlertAndNavigateToSignIn();
          } else {
            console.log('[DEX TRACKER] User exists, toggling form');
            toggleForm(dexNum, form, pokedex);
          }
        }}
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

  const PokemonRow = ({ pokemon, pokedex }: { pokemon: Pokemon; pokedex: string }) => {
    const { id: dexNum, name, hasMega, canBeAlpha } = pokemon;
    
    // Subscribe to a tuple of primitive values with shallow comparison
    const [normal, shiny, alpha, alphaShiny] = usePokemonTrackerStore(
      useShallow((state) => {
        const s = state.pokemon[pokedex]?.[dexNum];
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
          <Text
            className="text-sm font-bold text-app-text w-12"
            numberOfLines={1}
          >
            #{String(dexNum).padStart(3, '0')}
          </Text>
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
          <FormButton dexNum={dexNum} form="normal" label="Normal" emoji="⚪" pokedex={pokedex} />
          <FormButton dexNum={dexNum} form="shiny" label="Shiny" emoji="✨" pokedex={pokedex} />
          {canBeAlpha && (
            <>
              <FormButton dexNum={dexNum} form="alpha" label="Alpha" emoji="🔴" pokedex={pokedex} />
              <FormButton dexNum={dexNum} form="alphaShiny" label="Alpha ✨" emoji="👑" pokedex={pokedex} />
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
      
      <Container>
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={true}>
          {/* Header */}
            <View className=" flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="typography-display-responsive  text-app-secondary dark:text-dark-app-secondary">Pokédex Tracker</Text>
                <Text className="text-sm text-dark-app-secondary dark:text-app-secondary mt-1">
                  Track your collection and special forms
                </Text>
              </View>
              <FavoriteToggle featureKey={FEATURE_KEY} featureTitle={FEATURE_TITLE} />
            </View>

          <View className="">
            <AuthStatus />
            
            {/* Search Bar and Filter Button */}
            <View className="flex-row items-center gap-3 mb-4">
              <View className="flex-1">
                <SearchBar value={query} onChange={setQuery} />
              </View>
              <Pressable
                onPress={() => setFilterModalVisible(true)}
                className="bg-blue-500 dark:bg-blue-600 px-4 py-3 rounded-lg flex-row items-center gap-2"
              >
                <Text className="text-white dark:text-gray-100 font-semibold">🔍 Filter</Text>
                {(filter !== 'all' || activeDex !== 'all') && (
                  <View className="bg-white dark:bg-gray-800 rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-blue-500 dark:text-blue-400 text-xs font-bold">!</Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Dual Collapsible Row - Progress & Instructions */}
            <DualCollapsibleRow
              leftTitle="Progress"
              leftIcon="📊"
              leftContent={
                <ProgressSidebar pokemonList={[...lumioseDex, ...hyperspaceDex]} />
              }
              leftBgColor="bg-green-50"
              leftBorderColor="border-green-500"
              rightTitle="How to Use"
              rightIcon="📝"
              rightContent={
                <View>
                  <Text className="text-xs text-app-brown dark:text-gray-400 mb-1">• Tap a button to toggle obtained status (gray → green)</Text>
                  <Text className="text-xs text-app-brown dark:text-gray-400 mb-1">• ⚪ Registered: Caught the regular version at least once</Text>
                  <Text className="text-xs text-app-brown dark:text-gray-400 mb-1">• ✨ Shiny: Caught the shiny version (non-alpha) at least once</Text>
                  <Text className="text-xs text-app-brown dark:text-gray-400 mb-1">• 🔴 Alpha: Caught the alpha version (non-shiny) at least once</Text>
                  <Text className="text-xs text-app-brown dark:text-gray-400 mb-3">• 👑 Alpha ✨: Caught the shiny alpha version at least once</Text>
                  <Text className="text-xs text-app-text dark:text-gray-300 mb-3">**If you catch a shiny or alpha and evolve it, toggle the previous entry to false and the current one to true**</Text>
                  
                  {/* Badges section */}
                  <Text className="text-sm font-semibold text-app-text dark:text-gray-100 mb-2" role="heading" aria-level={3}>🏷️ Badges:</Text>
                  <View className="flex-row gap-4">
                    <View className="flex-row items-center">
                      <View className="bg-purple-500 dark:bg-purple-600 px-1.5 py-0.5 rounded mr-1">
                        <Text className="text-xs text-white dark:text-gray-100 font-bold">M</Text>
                      </View>
                      <Text className="text-xs text-app-brown dark:text-gray-400">Has Mega Evolution</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="bg-red-500 dark:bg-red-600 px-1.5 py-0.5 rounded mr-1">
                        <Text className="text-xs text-white dark:text-gray-100 font-bold">α</Text>
                      </View>
                      <Text className="text-xs text-app-brown dark:text-gray-400">Can be Alpha</Text>
                    </View>
                  </View>
                </View>
              }
              rightBgColor="bg-blue-50"
              rightBorderColor="border-blue-500"
            />

            {/* Pokémon List */}
            {activeDex === 'all' ? (
              <>
                {/* Lumiose Dex Section */}
                <View className="bg-app-surface dark:bg-app-background p-4 rounded-lg shadow-app-medium mb-4">
                  <Text className="text-lg font-bold text-dark-app-text dark:text-app-text mb-4" role="heading" aria-level={2}>
                    Lumiose Pokédex ({(() => {
                      let filtered = lumioseDex;
                      if (filter === 'alpha') filtered = filtered.filter(p => p?.canBeAlpha);
                      if (filter === 'mega') filtered = filtered.filter(p => p?.hasMega);
                      const q = query.trim().toLowerCase();
                      if (q) filtered = filtered.filter(p => p.name?.toLowerCase().includes(q) || String(p.id).includes(q) || String(p.id).padStart(4, '0').includes(q));
                      return filtered.length;
                    })()})
                  </Text>
                  {(() => {
                    let filtered = lumioseDex;
                    if (filter === 'alpha') filtered = filtered.filter(p => p?.canBeAlpha);
                    if (filter === 'mega') filtered = filtered.filter(p => p?.hasMega);
                    const q = query.trim().toLowerCase();
                    if (q) filtered = filtered.filter(p => p.name?.toLowerCase().includes(q) || String(p.id).includes(q) || String(p.id).padStart(4, '0').includes(q));
                    return filtered.map((pokemon) => (
                      <PokemonRow key={`lumiose-${pokemon.id}-${pokemon.name}`} pokemon={pokemon} pokedex="lumiose" />
                    ));
                  })()}
                </View>

                {/* Hyperspace Dex Section */}
                <View className="bg-app-surface dark:bg-app-background p-4 rounded-lg shadow-app-medium mb-4">
                  <Text className="text-lg font-bold text-app-text  mb-4" role="heading" aria-level={2}>
                    Hyperspace Pokédex ({(() => {
                      let filtered = hyperspaceDex;
                      if (filter === 'alpha') filtered = filtered.filter(p => p?.canBeAlpha);
                      if (filter === 'mega') filtered = filtered.filter(p => p?.hasMega);
                      const q = query.trim().toLowerCase();
                      if (q) filtered = filtered.filter(p => p.name?.toLowerCase().includes(q) || String(p.id).includes(q) || String(p.id).padStart(4, '0').includes(q));
                      return filtered.length;
                  })()})
                  </Text>
                  {(() => {
                    let filtered = hyperspaceDex;
                    if (filter === 'alpha') filtered = filtered.filter(p => p?.canBeAlpha);
                    if (filter === 'mega') filtered = filtered.filter(p => p?.hasMega);
                    const q = query.trim().toLowerCase();
                    if (q) filtered = filtered.filter(p => p.name?.toLowerCase().includes(q) || String(p.id).includes(q) || String(p.id).padStart(4, '0').includes(q));
                    return filtered.map((pokemon) => (
                      <PokemonRow key={`hyperspace-${pokemon.id}-${pokemon.name}`} pokemon={pokemon} pokedex="hyperspace" />
                    ));
                  })()}
                </View>
              </>
            ) : (
              <View className="bg-app-surface dark:bg-app-background p-4 rounded-lg shadow-app-medium mb-4">
                <Text className="text-lg font-bold text-dark-app-text dark:text-app-text mb-4" role="heading" aria-level={2}>
                  {getActiveDexName()} Pokédex ({filteredPokemon.length})
                </Text>
                {filteredPokemon.map((pokemon) => (
                  <PokemonRow key={`${activeDex}-${pokemon.id}-${pokemon.name}`} pokemon={pokemon} pokedex={activeDex} />
                ))}
              </View>
            )}

            {/* Footer Note */}
            <View className="mt-6 mb-4">
              <Text className="text-xs text-center text-app-brown dark:text-gray-400 italic">
                💾 Your progress is saved locally and synced to your account
              </Text>
              <Text className="text-xs text-center text-app-brown dark:text-gray-400 italic mt-1">
                🔄 Automatically syncs when online
              </Text>
            </View>
            <Footer/>
          </View>
        </ScrollView>

        {/* Filter Modal */}
        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          filter={filter}
          setFilter={setFilter}
          activeDex={activeDex}
          setActiveDex={setActiveDex}
          lumioseDex={lumioseDex}
          hyperspaceDex={hyperspaceDex}
          getActiveDexCount={getActiveDexCount}
        />
      </Container>
    </>
  );
}
