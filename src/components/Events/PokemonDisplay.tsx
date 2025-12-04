import React, { useState, useEffect } from 'react';
import { View, Image, Text, ActivityIndicator } from 'react-native';
import { PokemonClient } from 'pokenode-ts';
import { cn } from '~/utils/cn';

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

interface PokemonDisplayProps {
  pokemonId: number;
  pokemonName: string;
  isShiny?: boolean;
  showStats?: boolean;
  teraType?: string;
  size?: 'small' | 'medium' | 'large';
}

export const PokemonDisplay: React.FC<PokemonDisplayProps> = ({
  pokemonId,
  pokemonName,
  isShiny = false,
  showStats = false,
  teraType,
  size = 'medium',
}) => {
  const [pokemonImage, setPokemonImage] = useState('');
  const [pokemonStats, setPokemonStats] = useState<PokemonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Size configurations
  const sizeConfig = {
    small: { container: 'w-32 h-32', image: 'w-full h-full' },
    medium: { container: 'w-48 h-48', image: 'w-full h-full' },
    large: { container: 'w-64 h-64', image: 'w-full h-full' },
  };

  // Function to get color based on stat value (red to green gradient)
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
        setLoading(true);
        const api = new PokemonClient();
        
        const pokemon = await api.getPokemonById(pokemonId);

        if (!pokemon) {
          setError('Pokemon not found');
          return;
        }
       
        // Choose shiny or normal sprite
        const imageUrl = isShiny 
          ? (pokemon.sprites.front_shiny || 
             pokemon.sprites.other?.['official-artwork']?.front_default || 
             pokemon.sprites.front_default || '')
          : (pokemon.sprites.other?.['official-artwork']?.front_default || 
             pokemon.sprites.front_default || '');
        
        setPokemonImage(imageUrl);
        
        if (showStats) {
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
        }
        
      } catch (error) {
        console.error('Error loading Pokemon data:', error);
        setError(`Failed to load ${pokemonName}`);
      } finally {
        setLoading(false);
      }
    };

    loadPokemonData();
  }, [pokemonId, isShiny, showStats, pokemonName]);

  if (loading) {
    return (
      <View className="items-center justify-center p-md">
        <ActivityIndicator size="large" color="#DC0A2D" />
        <Text className="typography-copy text-app-text dark:text-dark-app-text mt-sm">
          Loading {pokemonName}...
        </Text>
      </View>
    );
  }

  if (error || !pokemonImage) {
    return (
      <View className="bg-app-secondary dark:bg-gray-700 rounded-lg p-md items-center justify-center">
        <Text className="typography-copy text-app-brown dark:text-gray-300 text-center">
          {error || pokemonName}
        </Text>
      </View>
    );
  }

  return (
    <View className="items-center">
      {/* Pokemon Image */}
      <View className={cn(
        "bg-app-white dark:bg-dark-app-background rounded-lg items-center justify-center mb-md border-2",
        "border-app-secondary dark:border-app-accent",
        sizeConfig[size].container
      )}>
        <Image
          source={{ uri: pokemonImage }}
          className={sizeConfig[size].image}
          resizeMode="contain"
        />
      </View>

      {/* Tera Type Badge */}
      {teraType && (
        <View className="bg-app-accent dark:bg-app-primary rounded-full px-lg py-sm mb-md">
          <Text className="typography-copy-bold text-app-white">
            Tera Type: {teraType}
          </Text>
        </View>
      )}

      {/* Base Stats */}
      {showStats && pokemonStats && (
        <View className="bg-app-white dark:bg-dark-app-background w-full max-w-md p-md rounded-md border border-app-secondary dark:border-app-accent shadow-app-small mt-md">
          <Text className="typography-header text-center text-app-text dark:text-dark-app-text mb-md">Base Stats</Text>
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
