import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, Dimensions } from 'react-native';
import { PokemonClient } from 'pokenode-ts';

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

interface PokemonStatsDisplayProps {
  pokemonId: number;
  pokemonName: string;
  isShiny?: boolean;
  teraType?: string;
  initialShowStats?: boolean;
}

export const PokemonStatsDisplay: React.FC<PokemonStatsDisplayProps> = ({
  pokemonId,
  pokemonName,
  isShiny = false,
  teraType,
  initialShowStats = false,
}) => {
  const [pokemonImage, setPokemonImage] = useState('');
  const [pokemonStats, setPokemonStats] = useState<PokemonStats | null>(null);
  const [showBaseStats, setShowBaseStats] = useState(initialShowStats);
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState('');

  const screenWidth = Dimensions.get('window').width;
  const getStatsContainerWidth = () => {
    if (screenWidth < 768) return '90%';
    if (screenWidth < 1024) return '75%';
    return '60%';
  };

  const getStatColor = (statValue: number): string => {
    const normalized = Math.min(statValue / 180, 1);
    
    if (normalized <= 0.5) {
      const redToOrange = normalized * 2;
      const red = 220;
      const green = Math.floor(120 * redToOrange);
      return `rgb(${red}, ${green}, 50)`;
    } else {
      const orangeToGreen = (normalized - 0.5) * 2;
      const red = Math.floor(220 * (1 - orangeToGreen) + 60 * orangeToGreen);
      const green = Math.floor(120 + 100 * orangeToGreen);
      const blue = Math.floor(50 + 30 * orangeToGreen);
      return `rgb(${red}, ${green}, ${blue})`;
    }
  };

  useEffect(() => {
    const loadPokemonData = async () => {
      try {
        const pokemonClient = new PokemonClient();
        const pokemon = await pokemonClient.getPokemonById(pokemonId)
          .catch((error: any) => {
            console.error('Error fetching Pokemon from pokenode-ts:', error);
            return null;
          });

        if (!pokemon) {
          setPokemonImage('');
          setPokemonStats(null);
          return;
        }
       
        const imageUrl = isShiny 
          ? (pokemon.sprites.front_shiny || 
             pokemon.sprites.other?.['official-artwork']?.front_default || 
             pokemon.sprites.front_default || '')
          : (pokemon.sprites.other?.['official-artwork']?.front_default || 
             pokemon.sprites.front_default || '');
        setPokemonImage(imageUrl);
        
        const statsArray = Array.isArray(pokemon.stats) ? pokemon.stats : [];
        const stats: PokemonStats = {
          hp: statsArray.find((stat: any) => stat?.stat?.name === 'hp')?.base_stat || 0,
          attack: statsArray.find((stat: any) => stat?.stat?.name === 'attack')?.base_stat || 0,
          defense: statsArray.find((stat: any) => stat?.stat?.name === 'defense')?.base_stat || 0,
          specialAttack: statsArray.find((stat: any) => stat?.stat?.name === 'special-attack')?.base_stat || 0,
          specialDefense: statsArray.find((stat: any) => stat?.stat?.name === 'special-defense')?.base_stat || 0,
          speed: statsArray.find((stat: any) => stat?.stat?.name === 'speed')?.base_stat || 0,
        };
        
        setPokemonStats(stats);
        
      } catch (error) {
        console.error('Error in loadPokemonData:', error);
        setError(`${error instanceof Error ? error.message : String(error)}`);
        setPokemonImage('');
        setPokemonStats(null);
      } finally {
        setImageLoading(false);
      }
    };

    loadPokemonData();
  }, [pokemonId, isShiny]);

  if (error) {
    return (
      <View className="items-center p-md">
        <Text className="typography-copy text-red-500">Error loading Pokémon data</Text>
      </View>
    );
  }

  return (
    <View className="items-center mb-md">
      {/* Pokemon Image */}
      {imageLoading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : pokemonImage ? (
        <Image
          source={{ uri: pokemonImage }}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      ) : (
        <View style={{ width: 200, height: 200 }} className="items-center justify-center">
          <Text className="typography-copy text-app-secondary">No image available</Text>
        </View>
      )}

      {/* Pokemon Name & Tera Type */}
      <View className="items-center mt-sm mb-md">
        <Text 
          className="text-app-text dark:text-dark-app-text text-center mb-xs"
          style={{ fontFamily: 'Modak', fontSize: 28 }}
        >
          {isShiny ? '✨ ' : ''}{pokemonName}{isShiny ? ' ✨' : ''}
        </Text>
        {teraType && (
          <View className="bg-app-accent dark:bg-app-primary px-md py-xs rounded-full">
            <Text className="typography-copy-bold text-app-white">
              Tera {teraType} Type
            </Text>
          </View>
        )}
      </View>

      {/* Toggle Stats Button */}
      {pokemonStats && (
        <Pressable
          onPress={() => setShowBaseStats(!showBaseStats)}
          className="bg-app-accent dark:bg-app-primary py-sm px-lg rounded-md mb-md"
        >
          <Text 
            className="text-app-white text-center"
            style={{ fontFamily: 'PressStart2P', fontSize: 10 }}
          >
            {showBaseStats ? 'Hide base stats' : 'Show base stats'}
          </Text>
        </Pressable>
      )}

      {/* Base Stats Display */}
      {showBaseStats && pokemonStats && (
        <View 
          className="bg-app-white dark:bg-dark-app-background my-md p-md rounded-md border border-app-secondary dark:border-app-accent shadow-app-small self-center"
          style={{ width: getStatsContainerWidth() }}
        >
          <Text className="typography-header text-center text-app-text dark:text-dark-app-text mb-md">
            Base Stats
          </Text>
          <View className="flex-row flex-wrap justify-between">
            <View className="w-[30%] p-sm rounded-md mb-sm items-center" style={{ backgroundColor: getStatColor(pokemonStats.hp) }}>
              <Text className="typography-copy text-app-text dark:text-app-text mb-xs">HP</Text>
              <Text className="typography-copy-bold text-app-text dark:text-app-text">{pokemonStats.hp}</Text>
            </View>
            <View className="w-[30%] p-sm rounded-md mb-sm items-center" style={{ backgroundColor: getStatColor(pokemonStats.attack) }}>
              <Text className="typography-copy text-app-text dark:text-app-text mb-xs">Attack</Text>
              <Text className="typography-copy-bold text-app-text dark:text-app-text">{pokemonStats.attack}</Text>
            </View>
            <View className="w-[30%] p-sm rounded-md mb-sm items-center" style={{ backgroundColor: getStatColor(pokemonStats.defense) }}>
              <Text className="typography-copy text-app-text dark:text-app-text mb-xs">Defense</Text>
              <Text className="typography-copy-bold text-app-text dark:text-app-text">{pokemonStats.defense}</Text>
            </View>
            <View className="w-[30%] p-sm rounded-md mb-sm items-center" style={{ backgroundColor: getStatColor(pokemonStats.specialAttack) }}>
              <Text className="typography-copy text-app-text dark:text-app-text mb-xs">Sp. Atk</Text>
              <Text className="typography-copy-bold text-app-text dark:text-app-text">{pokemonStats.specialAttack}</Text>
            </View>
            <View className="w-[30%] p-sm rounded-md mb-sm items-center" style={{ backgroundColor: getStatColor(pokemonStats.specialDefense) }}>
              <Text className="typography-copy text-app-text dark:text-app-text mb-xs">Sp. Def</Text>
              <Text className="typography-copy-bold text-app-text dark:text-app-text">{pokemonStats.specialDefense}</Text>
            </View>
            <View className="w-[30%] p-sm rounded-md mb-sm items-center" style={{ backgroundColor: getStatColor(pokemonStats.speed) }}>
              <Text className="typography-copy text-app-text dark:text-app-text mb-xs">Speed</Text>
              <Text className="typography-copy-bold text-app-text dark:text-app-text">{pokemonStats.speed}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
