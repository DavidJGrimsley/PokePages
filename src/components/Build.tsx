import React, { useEffect, useState } from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import { BuildVariant } from '~/types/builds';
import ErrorMessage from 'components/Meta/Error';
import { cn } from '~/utils/cn';

interface BuildProps {
  pokemonName: string;
  variant: BuildVariant;
  pokemonVariant?: string;
  ability: string;
  nature: string;
  evs: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  ivs?: {
    hp?: number;
    attack?: number;
    defense?: number;
    specialAttack?: number;
    specialDefense?: number;
    speed?: number;
  };
  level?: number;
  heldItem: string;
  moves: string[];
  teraType?: string;
  role: string;
  notes?: string;
  colorScheme?: 'light' | 'dark';
  pokemonId?: number;
}

export const Build: React.FC<BuildProps> = ({
  pokemonName,
  variant,
  pokemonVariant,
  ability,
  nature,
  evs,
  ivs,
  level = 100,
  heldItem,
  moves,
  teraType,
  role,
  notes,
  colorScheme = 'light',
  pokemonId,
}) => {
  const [pokeImage, setPokeImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Get screen dimensions for responsive styling
  const screenWidth = Dimensions.get('window').width;
  const getBackgroundOpacity = () => {
    return screenWidth < 768 ? 0.45 : 0.65; // 45% on phone, 65% on tablet/desktop
  };

  useEffect(() => {
    const sanitizedPokemonVariant = (variant: string) => {
      return variant.replace(/\s+/g, '-').toLowerCase();
    };
    if (!pokemonId) return;
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    .then(res => res.json())
    .then(data => {
        const img = data.sprites?.other['official-artwork']?.front_default || data.sprites?.front_default || null;
        setPokeImage(img);
        setImageError(null);
      })
      .catch((err) => {
        setPokeImage(null);
        setImageError('Failed to load Pokémon image.');
      });
  }, [pokemonId]);
  //
  // trying to fetch the image for the Pokémon based on its name and variant. POKEAPI is too complex and not complex enough for this. Maybe V3 will fix it.
  // useEffect(() => {
  //   const sanitizedPokemonVariant = (variant: string) => {
  //     return variant.replace(/\s+/g, '-').toLowerCase();
  //   };
  //   if (!pokemonId) return;
  //   fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}${pokemonVariant ? `-${sanitizedPokemonVariant(pokemonVariant)}` : ''}`)
  //   .then(res => res.json())
  //   .then(data => {
  //       const img = data.sprites?.other['official-artwork']?.front_default || data.sprites?.front_default || null;
  //       setPokeImage(img);
  //     })
  //     .catch(() => setPokeImage(null));
  // }, [pokemonId]);

  const getVariantConfig = () => {
    switch (variant) {
      case 'physical-attacker':
        return {
          title: 'Physical Attacker',
          icon: '⚔️',
          primaryColor: '#e74c3c',
          backgroundColor: '#fdf2f2',
          bgClass: 'bg-app-red-bg',
          headerClass: 'bg-app-red',
          labelClass: 'text-app-red',
        };
      case 'special-attacker':
        return {
          title: 'Special Attacker',
          icon: '✨',
          primaryColor: '#582a5a',
          backgroundColor: '#E6e6fa',
          bgClass: 'bg-app-purple-bg',
          headerClass: 'bg-app-purple',
          labelClass: 'text-app-purple',
        };
      case 'physical-wall':
        return {
          title: 'Physical Wall',
          icon: '🛡️',
          primaryColor: '#3498db',
          backgroundColor: '#f2f8fd',
          bgClass: 'bg-app-blue-bg',
          headerClass: 'bg-app-blue',
          labelClass: 'text-app-blue',
        };
      case 'special-wall':
        return {
          title: 'Special Wall',
          icon: '🌟',
          primaryColor: '#959F5C',
          backgroundColor: '#f2fdf5',
          bgClass: 'bg-app-green-bg',
          headerClass: 'bg-app-green',
          labelClass: 'text-app-green',
        };
      default:
        return {
          title: 'Build',
          icon: '📋',
          primaryColor: '#582a5a',
          backgroundColor: '#E6e6fa',
          bgClass: 'bg-app-background',
          headerClass: 'bg-app-primary',
          labelClass: 'text-app-primary',
        };
    }
  };

  const formatEVs = () => {
    const evArray = [];
    if (evs.hp > 0) evArray.push(`${evs.hp} HP`);
    if (evs.attack > 0) evArray.push(`${evs.attack} Atk`);
    if (evs.defense > 0) evArray.push(`${evs.defense} Def`);
    if (evs.specialAttack > 0) evArray.push(`${evs.specialAttack} SpA`);
    if (evs.specialDefense > 0) evArray.push(`${evs.specialDefense} SpD`);
    if (evs.speed > 0) evArray.push(`${evs.speed} Spe`);
    return evArray.join(' / ');
  };

  const formatIVs = () => {
    if (!ivs) return '31/31/31/31/31/31 (Perfect)';
    
    const ivArray = [
      ivs.hp ?? 31,
      ivs.attack ?? 31,
      ivs.defense ?? 31,
      ivs.specialAttack ?? 31,
      ivs.specialDefense ?? 31,
      ivs.speed ?? 31
    ];
    
    const isAllPerfect = ivArray.every(iv => iv === 31);
    if (isAllPerfect) return '31/31/31/31/31/31 (Perfect)';
    
    return `${ivArray.join('/')} (HP/Atk/Def/SpA/SpD/Spe)`;
  };

  const config = getVariantConfig();

  return (
    <View className={cn(
      "rounded-lg my-sm mx-0 shadow-app-small overflow-hidden border border-app-secondary relative",
      config.bgClass
    )}> 
      {imageError && (
        <ErrorMessage
          title="Image Load Error"
          description={`Could not load image for ${pokemonName}.`}
          error={imageError}
        />
      )}
      {pokeImage && (
        <Image
          source={{ uri: pokeImage }}
          className="absolute w-[70%] h-[70%] z-0"
          style={{ 
            top: '18%',
            left: '50%',
            opacity: getBackgroundOpacity(),
            transform: [{ translateX: -0.5 * 0.7 * 300 }] // 300 is approx card width
          }}
          resizeMode="contain"
        />
      )}
      <View className={cn(
        "flex-row items-center p-md rounded-t-lg",
        config.headerClass
      )}> 
        <Text className="typography-subheader mr-sm">{config.icon}</Text>
        <View className="flex-1">
          <Text className="typography-header text-app-white mb-0">
            {pokemonName}{pokemonVariant ? ` (${pokemonVariant})` : ''}
          </Text>
          <Text className="typography-copy text-app-white opacity-90">{config.title}</Text>
        </View>
      </View>
      <View className="p-md">
        <View className="flex-row flex-wrap items-center mb-sm">
          <Text className={cn("typography-copy-bold mr-sm", config.labelClass)}>Level:</Text>
          <Text className="typography-copy text-app-text mr-md">{level}</Text>
        </View>
        {teraType && (
          <View className="flex-row flex-wrap items-center mb-sm">
            <Text className="typography-copy-bold mr-sm text-app-brown">Tera Type:</Text>
            <Text className="typography-copy text-app-text mr-md">{teraType}</Text>
          </View>
        )}
        <View className="flex-row flex-wrap items-center mb-sm">
          <Text className="typography-copy-bold mr-sm text-app-brown">Ability:</Text>
          <Text className="typography-copy text-app-text mr-md">{ability}</Text>
        </View>
        <View className="flex-row flex-wrap items-center mb-sm">
          <Text className="typography-copy-bold mr-sm text-app-brown">Nature:</Text>
          <Text className="typography-copy text-app-text mr-md">{nature}</Text>
        </View>
        <View className="flex-row flex-wrap items-center mb-sm">
          <Text className="typography-copy-bold mr-sm text-app-brown">Held Item:</Text>
          <Text className="typography-copy text-app-text mr-md">{heldItem}</Text>
        </View>
        <View className="flex-row flex-wrap items-center mb-sm">
          <Text className="typography-copy-bold mr-xs text-app-primary">EVs:</Text>
          <Text className="typography-copy text-app-primary mr-sm">{formatEVs()}</Text>
        </View>
        <View className="flex-row flex-wrap items-center mb-sm">
          <Text className="typography-copy-bold mr-xs text-app-primary">IVs:</Text>
          <Text className="typography-copy text-app-primary mr-sm">{formatIVs()}</Text>
        </View>
        <View className="flex-row flex-wrap my-xs mb-sm">
          {moves.map((move, idx) => (
            <Text key={idx} className="typography-copy text-app-accent bg-app-background rounded-sm px-sm py-xs mr-sm mb-xs">
              {move}
            </Text>
          ))}
        </View>
        <Text className="typography-copy text-app-brown mt-xs mb-xs">{role}</Text>
        {notes && <Text className="typography-copy text-app-brown italic mt-xs">{notes}</Text>}
      </View>
    </View>
  );
};


