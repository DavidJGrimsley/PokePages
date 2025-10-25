import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { RegisteredStatus, FormType } from '@/src/types/tracker';
import { buildApiUrlNoTrailingSlash as buildApiUrl } from '@/src/utils/apiConfig';
import { useAuthStore } from '@/src/store/authStore';

interface Pokemon {
  id: number;
  name: string;
  canBeAlpha?: boolean;
  hasMega?: boolean;
}

// Local tracker hook - no Zustand, just page-scoped state
function useLocalTracker() {
  const [data, setData] = React.useState<Record<number, RegisteredStatus>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load tracker data on mount
  React.useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setError(null);
        const { user, session } = useAuthStore.getState();
        
        console.log('[LocalTracker] Loading data - User ID:', user?.id);
        console.log('[LocalTracker] Has session token:', !!session?.access_token);
        
        if (!user?.id || !session?.access_token) {
          if (isMounted) {
            setLoading(false);
            setError('User not authenticated');
          }
          return;
        }

        // Auth middleware handles user ID from token
        // const url = buildApiUrl('legends-za');
        const url = 'http://localhost:3001/legends-za';
        console.log('[LocalTracker] Fetching from:', url);
        
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Unknown error');
          console.error('[LocalTracker] HTTP Error:', res.status, errorText);
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const json = await res.json();
        console.log('[LocalTracker] Received data:', json);
        const records = json.data || [];
        
        // Transform API response to local state format
        const trackerData: Record<number, RegisteredStatus> = {};
        records.forEach((record: any) => {
          const pokemonId = record.pokemonId ?? record.pokemon_id;
          if (typeof pokemonId === 'number') {
            trackerData[pokemonId] = {
              normal: Boolean(record.normal),
              shiny: Boolean(record.shiny),
              alpha: Boolean(record.alpha),
              alphaShiny: Boolean(record.alphaShiny ?? record.alpha_shiny),
            };
          }
        });

        if (isMounted) {
          setData(trackerData);
          setLoading(false);
        }
      } catch (err) {
        console.error('[LocalTracker] Failed to load data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load tracker data');
          setLoading(false);
        }
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Toggle form with optimistic update
  const toggleForm = React.useCallback(async (dex: number, form: FormType) => {
    const currentStatus = data[dex] ?? {
      normal: false,
      shiny: false,
      alpha: false,
      alphaShiny: false,
    };
    
    const newValue = !currentStatus[form];
    const updatedStatus: RegisteredStatus = { ...currentStatus, [form]: newValue };

    // Optimistic update - immediately update UI
    setData(prev => ({
      ...prev,
      [dex]: updatedStatus,
    }));

    try {
      const { user, session } = useAuthStore.getState();
      if (!user?.id || !session?.access_token) {
        throw new Error('User not authenticated');
      }

      // Backend expects: PUT /legends-za/:pokemonId with body { formType, value }
      const url = `http://localhost:3001/legends-za/${dex}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          formType: form, 
          value: newValue 
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      console.log('[LocalTracker] Successfully updated:', { dex, form, newValue });
    } catch (err) {
      console.error('[LocalTracker] Failed to sync update:', err);
      
      // Rollback optimistic update on failure
      setData(prev => ({
        ...prev,
        [dex]: currentStatus,
      }));
      
      // You could show a toast/alert here
      setError(err instanceof Error ? err.message : 'Failed to update tracker');
    }
  }, [data]);

  // Get status for a specific Pokemon
  const getStatus = React.useCallback((dex: number): RegisteredStatus => {
    return data[dex] ?? {
      normal: false,
      shiny: false,
      alpha: false,
      alphaShiny: false,
    };
  }, [data]);

  // Calculate progress stats
  const getProgress = React.useMemo(() => ({
    pokedex: (pokemonList: Pokemon[]) => {
      const obtained = pokemonList.filter(p => data[p.id]?.normal).length;
      return {
        obtained,
        total: pokemonList.length,
        percentage: pokemonList.length > 0 ? Math.round((obtained / pokemonList.length) * 100) : 0,
      };
    },
    shinyDex: (pokemonList: Pokemon[]) => {
      const obtained = pokemonList.filter(p => data[p.id]?.shiny).length;
      return {
        obtained,
        total: pokemonList.length,
        percentage: pokemonList.length > 0 ? Math.round((obtained / pokemonList.length) * 100) : 0,
      };
    },
    alphaDex: (pokemonList: Pokemon[]) => {
      const alphaCapable = pokemonList.filter(p => p.canBeAlpha);
      const obtained = alphaCapable.filter(p => data[p.id]?.alpha).length;
      return {
        obtained,
        total: alphaCapable.length,
        percentage: alphaCapable.length > 0 ? Math.round((obtained / alphaCapable.length) * 100) : 0,
      };
    },
    shinyAlpha: (pokemonList: Pokemon[]) => {
      const alphaCapable = pokemonList.filter(p => p.canBeAlpha);
      const obtained = alphaCapable.filter(p => data[p.id]?.alphaShiny).length;
      return {
        obtained,
        total: alphaCapable.length,
        percentage: alphaCapable.length > 0 ? Math.round((obtained / alphaCapable.length) * 100) : 0,
      };
    },
  }), [data]);

  return {
    data,
    loading,
    error,
    toggleForm,
    getStatus,
    getProgress,
  };
}

// Form toggle button component
interface FormButtonProps {
  dex: number;
  form: FormType;
  label: string;
  emoji: string;
  isObtained: boolean;
  onToggle: (dex: number, form: FormType) => void;
  className?: string;
}

export const FormButton: React.FC<FormButtonProps> = ({
  dex,
  form,
  label,
  emoji,
  isObtained,
  onToggle,
  className = '',
}) => {
  return (
    <Pressable
      onPress={() => onToggle(dex, form)}
      className={`
        px-3 py-2 rounded-lg border-2 flex-row items-center justify-center min-w-[80px]
        ${isObtained 
          ? 'bg-green-500 border-green-600' 
          : 'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
        }
        ${className}
      `}
    >
      <Text className="text-xs font-medium mr-1">{emoji}</Text>
      <Text className={`text-xs font-medium ${isObtained ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
        {label}
      </Text>
    </Pressable>
  );
};

// Pokemon row component
interface PokemonRowProps {
  pokemon: Pokemon;
  tracker: ReturnType<typeof useLocalTracker>;
}

export const PokemonRow: React.FC<PokemonRowProps> = ({ pokemon, tracker }) => {
  const status = tracker.getStatus(pokemon.id);
  
  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        #{pokemon.id.toString().padStart(4, '0')} {pokemon.name}
      </Text>
      
      <View className="flex-row flex-wrap gap-2">
        <FormButton
          dex={pokemon.id}
          form="normal"
          label="Normal"
          emoji="⭐"
          isObtained={status.normal}
          onToggle={tracker.toggleForm}
        />
        
        <FormButton
          dex={pokemon.id}
          form="shiny"
          label="Shiny"
          emoji="✨"
          isObtained={status.shiny}
          onToggle={tracker.toggleForm}
        />
        
        {pokemon.canBeAlpha && (
          <>
            <FormButton
              dex={pokemon.id}
              form="alpha"
              label="Alpha"
              emoji="🔥"
              isObtained={status.alpha}
              onToggle={tracker.toggleForm}
            />
            
            <FormButton
              dex={pokemon.id}
              form="alphaShiny"
              label="✨Alpha"
              emoji="💎"
              isObtained={status.alphaShiny}
              onToggle={tracker.toggleForm}
            />
          </>
        )}
      </View>
    </View>
  );
};

// Progress stats component
interface ProgressStatsProps {
  pokemonList: Pokemon[];
  tracker: ReturnType<typeof useLocalTracker>;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({ pokemonList, tracker }) => {
  const stats = {
    pokedex: tracker.getProgress.pokedex(pokemonList),
    shiny: tracker.getProgress.shinyDex(pokemonList),
    alpha: tracker.getProgress.alphaDex(pokemonList),
    shinyAlpha: tracker.getProgress.shinyAlpha(pokemonList),
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Progress</Text>
      
      <View className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-700 dark:text-gray-300">Pokédex:</Text>
          <Text className="font-medium text-gray-900 dark:text-white">
            {stats.pokedex.obtained}/{stats.pokedex.total} ({stats.pokedex.percentage}%)
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-gray-700 dark:text-gray-300">Shiny:</Text>
          <Text className="font-medium text-gray-900 dark:text-white">
            {stats.shiny.obtained}/{stats.shiny.total} ({stats.shiny.percentage}%)
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-gray-700 dark:text-gray-300">Alpha:</Text>
          <Text className="font-medium text-gray-900 dark:text-white">
            {stats.alpha.obtained}/{stats.alpha.total} ({stats.alpha.percentage}%)
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-gray-700 dark:text-gray-300">Shiny Alpha:</Text>
          <Text className="font-medium text-gray-900 dark:text-white">
            {stats.shinyAlpha.obtained}/{stats.shinyAlpha.total} ({stats.shinyAlpha.percentage}%)
          </Text>
        </View>
      </View>
    </View>
  );
};

// Main hook export for use in your dex tracker page
export { useLocalTracker };

// Example usage in your dex tracker page:
/*
import { useLocalTracker, PokemonRow, ProgressStats } from '@/src/components/Pokedex/legends-zaTracker';

export default function DexTrackerPage() {
  const tracker = useLocalTracker();
  const [filter, setFilter] = useState<FilterType>('all');
  
  if (tracker.loading) {
    return <Text>Loading...</Text>;
  }
  
  if (tracker.error) {
    return <Text>Error: {tracker.error}</Text>;
  }
  
  return (
    <ScrollView>
      <ProgressStats pokemonList={filteredPokemon} tracker={tracker} />
      {filteredPokemon.map(pokemon => (
        <PokemonRow key={pokemon.id} pokemon={pokemon} tracker={tracker} />
      ))}
    </ScrollView>
  );
}
*/
