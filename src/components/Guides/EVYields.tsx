import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/src/components/TextTheme/AppText';
import { lumioseDex, Pokemon } from '@/data/Pokemon/LumioseDex';

interface EVYieldsProps {
  game: 'PLZA' | 'SV' | 'BDSP';
}

interface EVCategory {
  name: string;
  key: keyof NonNullable<Pokemon['evYield']>;
  color: string;
  bgColor: string;
  icon: string;
  bgClass?: string;
  borderClass?: string;
  colorBgClass?: string;
  textClass?: string;
}

const evCategories: (EVCategory & { bgClass: string; borderClass: string; colorBgClass: string })[] = [
  // Use theme classes from tailwind.config for consistency
  { name: 'HP', key: 'hp', color: '#FF5959', bgColor: '#FFE5E5', icon: '❤️', bgClass: 'bg-app-hp-bg', borderClass: 'border-l-app-hp', colorBgClass: 'bg-app-hp', textClass: 'text-app-hp' },
  { name: 'Attack', key: 'attack', color: '#F08030', bgColor: '#FFF0E5', icon: '💥', bgClass: 'bg-app-attack-bg', borderClass: 'border-l-app-attack', colorBgClass: 'bg-app-attack', textClass: 'text-app-attack' },
  { name: 'Defense', key: 'defense', color: '#F8D030', bgColor: '#FFFAE5', icon: '🛡️', bgClass: 'bg-app-blue-bg', borderClass: 'border-l-app-blue', colorBgClass: 'bg-app-blue', textClass: 'text-app-blue' },
  { name: 'Sp. Atk', key: 'specialAttack', color: '#6890F0', bgColor: '#E5F0FF', icon: '🌀', bgClass: 'bg-app-purple-bg', borderClass: 'border-l-app-purple', colorBgClass: 'bg-app-purple', textClass: 'text-app-purple' },
  { name: 'Sp. Def', key: 'specialDefense', color: '#78C850', bgColor: '#F0FFE5', icon: '🔰', bgClass: 'bg-app-green-bg', borderClass: 'border-l-app-green', colorBgClass: 'bg-app-green', textClass: 'text-app-green' },
  { name: 'Speed', key: 'speed', color: '#F85888', bgColor: '#FFE5F0', icon: '⚡', bgClass: 'bg-app-speed-bg', borderClass: 'border-l-app-speed', colorBgClass: 'bg-app-speed', textClass: 'text-app-speed' },
];

export function EVYields({ game }: EVYieldsProps) {
  // Filter Pokemon by EV yield and amount
  const getPokemonByEV = (evKey: keyof NonNullable<Pokemon['evYield']>, amount: number) => {
    return lumioseDex.filter(pokemon => 
      pokemon.evYield && pokemon.evYield[evKey] === amount
    );
  };

  return (
    <View className="w-full mt-8 mb-8">
      <AppText className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-500">
        EV Training Guide - {game}
      </AppText>
      <AppText className="text-base mb-6 text-gray-600">
        Find the best Pokémon to train specific stats. Numbers indicate EV yield per defeat.
      </AppText>

      <View className="flex-row flex-wrap justify-between gap-4">
        {evCategories.map((category) => {
          const pokemon1 = getPokemonByEV(category.key, 1);
          const pokemon2 = getPokemonByEV(category.key, 2);
          const pokemon3 = getPokemonByEV(category.key, 3);
          const totalCount = pokemon1.length + pokemon2.length + pokemon3.length;

          return (
            <View 
              key={category.key}
              className={`rounded-2xl p-4 shadow-md mb-4 w-full max-w-[500px] border-l-4 ${category.bgClass} ${category.borderClass}`}
            >
              {/* Header */}
              <View className="flex-row items-center mb-3">
                <AppText className="text-3xl mr-2">{category.icon}</AppText>
                <View className="flex-1">
                  <AppText 
                    className={`text-xl font-bold ${category.textClass || ''}`}
                    noMargin
                  >
                    {category.name}
                  </AppText>
                  <AppText className="text-sm text-gray-600">
                    {totalCount} Pokémon available
                  </AppText>
                </View>
              </View>

              {/* Pokemon lists by EV amount */}
              <View 
                className="flex-row flex-wrap gap-2">
                {[3, 2, 1].map(evAmount => {
                  const pokemonList = getPokemonByEV(category.key, evAmount);
                  if (pokemonList.length === 0) return null;

                  return (
                    <View key={evAmount} className="flex-1 min-w-[120px]">
                      <View 
                        className={`rounded-full mb-1 flex items-center justify-center ${category.colorBgClass}`}
                      >
                        <AppText className="text-white font-bold" noMargin>
                          +{evAmount} EV
                        </AppText>
                      </View>
                      <View className="bg-white rounded-xl p-2 shadow-sm">
                        {pokemonList.map((pokemon, idx) => (
                          <View 
                            key={pokemon.id}
                            className={idx < pokemonList.length - 1 ? ' pb-2 border-b border-gray-200' : ''}
                          >
                            <AppText className="font-semibold text-gray-800">
                              {pokemon.name}
                            </AppText>
                            <View className="flex-row flex-wrap gap-1">
                              <View 
                                className="rounded-full px-2 py-1 flex items-center justify-center"
                                style={{ backgroundColor: getTypeColor(pokemon.type1) }}
                              >
                                <AppText className="text-xs text-white font-semibold leading-tight" noMargin>
                                  {pokemon.type1}
                                </AppText>
                              </View>
                              {pokemon.type2 && (
                                <View 
                                  className="rounded-full px-2 py-1 flex items-center justify-center"
                                  style={{ backgroundColor: getTypeColor(pokemon.type2) }}
                                >
                                  <AppText className="text-xs text-white font-semibold leading-tight" noMargin>
                                    {pokemon.type2}
                                  </AppText>
                                </View>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>

              {totalCount === 0 && (
                <AppText className="text-sm text-gray-500 italic text-center mt-2">
                  No Pokémon yield this EV in {game}
                </AppText>
              )}
            </View>
          );
        })}
      </View>

      <View className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <AppText className="text-sm text-gray-700">
          <AppText className="font-bold">💡 Tip: </AppText>
          Defeat Pokémon that yield +3 EVs for the fastest training. Each Pokémon can earn up to 510 total EVs, with a maximum of 252 in any single stat.
        </AppText>
      </View>
    </View>
  );
}

// Helper function to get type colors
function getTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    Normal: '#A8A878',
    Fire: '#F08030',
    Water: '#6890F0',
    Electric: '#F8D030',
    Grass: '#78C850',
    Ice: '#98D8D8',
    Fighting: '#C03028',
    Poison: '#A040A0',
    Ground: '#E0C068',
    Flying: '#A890F0',
    Psychic: '#F85888',
    Bug: '#A8B820',
    Rock: '#B8A038',
    Ghost: '#705898',
    Dragon: '#7038F8',
    Dark: '#705848',
    Steel: '#B8B8D0',
    Fairy: '#EE99AC',
  };
  return typeColors[type] || '#68A090';
}