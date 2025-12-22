import React, { useMemo, Fragment } from 'react';
import { View, Text, ScrollView } from 'react-native';
import typeAnalysis from '~/constants/typeAnalysis.json';
import { getTypeColor } from '~/utils/typeColors';
import { type PokemonType } from '~/constants/typeUtils';
import { nationalDex } from '@/data/Pokemon/NationalDex';
import { AdBannerWithModal } from '@/src/components/Ads/AdBannerWithModal';
import { getAllAds } from '~/constants/adsConfig';

type TypeData = {
  id: string;
  title: string;
  description: string;
};

interface TypeInfoProps {
  selectedType?: PokemonType | null;
}

export function TypeInfo({ selectedType }: TypeInfoProps) {
  const ads = useMemo(() => getAllAds(), []);
  const adBaseIndex = useMemo(
    () => (ads.length > 0 ? Math.floor(Math.random() * ads.length) : 0),
    [ads.length]
  );

  // Helper function to get Pokémon with specific type combination
  const getPokemonWithTypes = useMemo(() => {
    return (type1: string, type2?: string) => {
      return nationalDex.filter(pokemon => {
        const pokemonType1 = pokemon.type1.toLowerCase();
        const pokemonType2 = pokemon.type2?.toLowerCase();
        
        if (type2) {
          // For dual types, check both combinations (order doesn't matter)
          return (
            (pokemonType1 === type1.toLowerCase() && pokemonType2 === type2.toLowerCase()) ||
            (pokemonType1 === type2.toLowerCase() && pokemonType2 === type1.toLowerCase())
          );
        } else {
          // For single type, match exact type (only type1, no type2)
          return pokemonType1 === type1.toLowerCase() && !pokemonType2;
        }
      });
    };
  }, []);

  // Get all single types (not dual types)
  const allSingleTypes = Object.entries(typeAnalysis as Record<string, TypeData>).filter(
    ([key]) => !key.includes('-')
  );

  // Get all dual types
  const allDualTypes = Object.entries(typeAnalysis as Record<string, TypeData>).filter(
    ([key]) => key.includes('-')
  );

  // Filter types based on selected type
  const singleTypes = selectedType
    ? allSingleTypes.filter(([key]) => key === selectedType)
    : allSingleTypes;

  const dualTypes = selectedType
    ? allDualTypes.filter(([key]) => {
        const types = key.split('-');
        return types.includes(selectedType);
      })
    : allDualTypes;

  const renderTypeChip = (key: string, type: TypeData, isDual: boolean = false) => {
    if (isDual) {
      // Split the key to get both types
      const [type1, type2] = key.split('-');
      const color1 = getTypeColor(type1);
      const color2 = getTypeColor(type2);
      
      // Get Pokémon with this dual type
      const pokemonWithType = getPokemonWithTypes(type1, type2);

      return (
        <View
          key={key}
          className="p-4 bg-white dark:bg-app-surface rounded-lg shadow-sm"
        >
          <View className="flex-row items-center mb-2">
            {/* Dual Color Chip - Split vertically */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                marginRight: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <View style={{ backgroundColor: color1, flex: 1 }} />
              <View style={{ backgroundColor: color2, flex: 1 }} />
            </View>

            {/* Type Info */}
            <View className="flex-1">
              <Text className="text-lg font-bold text-app-text mb-1">
                {type.title}
              </Text>
              <Text className="text-sm text-gray-600 mb-1">
                {type.description}
              </Text>
              <Text className="text-xs text-gray-500">
                {pokemonWithType.length} Pokémon
              </Text>
            </View>
          </View>

          {/* Pokémon List */}
          {pokemonWithType.length > 0 && (
            <View className="mt-2 pt-2 border-t border-gray-200">
              <Text className="text-xs font-semibold text-gray-700 mb-2">
                Pokémon with this typing:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {pokemonWithType.map((pokemon) => (
                  <View
                    key={pokemon.id}
                    className="bg-gray-100 px-2 py-1 rounded"
                  >
                    <Text className="text-xs text-gray-700">
                      {pokemon.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      );
    }

    // Single type chip
    const color = getTypeColor(key);
    const pokemonWithType = getPokemonWithTypes(key);
    
    return (
      <View
        key={key}
        className="p-4 bg-app-white dark:bg-app-surface rounded-lg shadow-sm"
      >
        <View className="flex-row items-center mb-2">
          {/* Single Color Chip */}
          <View
            style={{
              backgroundColor: color,
              width: 64,
              height: 64,
              borderRadius: 8,
              marginRight: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          />

          {/* Type Info */}
          <View className="flex-1">
            <Text className="text-lg font-bold text-app-text mb-1">
              {type.title}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">
              {type.description}
            </Text>
            <Text className="text-xs text-gray-500">
              {pokemonWithType.length} Pokémon (pure type)
            </Text>
          </View>
        </View>

        {/* Pokémon List */}
        {pokemonWithType.length > 0 && (
          <View className="mt-2 pt-2 border-t border-gray-200">
            <Text className="text-xs font-semibold text-gray-700 mb-2">
              Pure {type.title} Pokémon:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {pokemonWithType.map((pokemon) => (
                <View
                  key={pokemon.id}
                  className="bg-gray-100 px-2 py-1 rounded"
                >
                  <Text className="text-xs text-gray-700">
                    {pokemon.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-app-background dark:bg-dark-app-background p-4">
      <Text
        role="heading"
        aria-level={1}
        className="text-lg font-semibold text-center text-app-secondary dark:text-dark-app-secondary"
      >
        Pokémon Type Information{'\n'}
        Find out more about each type
      </Text>

      {/* Filter indicator */}
      {selectedType && (
        <View className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Text className="text-sm text-blue-800 text-center">
            Showing types containing: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
          </Text>
        </View>
      )}

      {/* Single Types Section */}
      {singleTypes.length > 0 && (
        <>
          <Text
            role="heading"
            aria-level={2}
            className="text-xl font-bold text-app-text dark:text-dark-app-text mb-2"
          >
            Single Types
          </Text>
          <View className="gap-3 mb-6">
            {(() => {
              let adSlot = 0;
              return singleTypes.map(([key, type], index) => {
                const shouldShowAd = (index + 1) % 25 === 0 && index + 1 < singleTypes.length;
                const adId = shouldShowAd && ads.length > 0
                  ? ads[(adBaseIndex + adSlot) % ads.length].id
                  : undefined;
                if (shouldShowAd) adSlot += 1;
                return (
                  <Fragment key={key}>
                    {renderTypeChip(key, type, false)}
                    {shouldShowAd && adId && (
                      <View className="my-4">
                        <AdBannerWithModal adId={adId} />
                      </View>
                    )}
                  </Fragment>
                );
              });
            })()}
          </View>
        </>
      )}

      {/* Dual Types Section */}
      {dualTypes.length > 0 && (
        <>
          <Text
            role="heading"
            aria-level={2}
            className="text-xl font-bold text-app-text dark:text-dark-app-text my-2"
          >
            Dual Types
          </Text>
          <View className="gap-3 mb-6">
            {(() => {
              let adSlot = 0;
              return dualTypes.map(([key, type], index) => {
                const shouldShowAd = (index + 1) % 25 === 0 && index + 1 < dualTypes.length;
                const adId = shouldShowAd && ads.length > 0
                  ? ads[(adBaseIndex + adSlot) % ads.length].id
                  : undefined;
                if (shouldShowAd) adSlot += 1;
                return (
                  <Fragment key={key}>
                    {renderTypeChip(key, type, true)}
                    {shouldShowAd && adId && (
                      <View className="my-4">
                        <AdBannerWithModal adId={adId} />
                      </View>
                    )}
                  </Fragment>
                );
              });
            })()}
          </View>
        </>
      )}

      {/* No results message */}
      {singleTypes.length === 0 && dualTypes.length === 0 && selectedType && (
        <View className="p-6 items-center">
          <Text className="text-gray-500 text-center">
            No types found matching your search.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
