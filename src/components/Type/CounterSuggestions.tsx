import React from 'react';
import { View, Text } from 'react-native';
import { nationalDex, type Pokemon } from '@/data/Pokemon/NationalDex';
import { 
  getTypeMatchups,
  getWeaknesses,
  getResistances,
  type PokemonType,
} from '~/constants/typeUtils';
import { getTypeColor } from '~/utils/typeColors';

interface CounterPokemon {
  id: number;
  name: string;
  type1: string;
  type2?: string;
  score: number;
  reasons: string[];
  category: 'ideal' | 'strong' | 'good';
}

interface CounterSuggestionsProps {
  selectedType: PokemonType;
  secondType?: PokemonType | null;
}

// Helper component to render a type badge
function TypeBadge({ typeName }: { typeName: string }) {
  const typeColor = getTypeColor(typeName);
  const capitalizedType = typeName.charAt(0).toUpperCase() + typeName.slice(1);
  
  const getLuminance = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const textColor = getLuminance(typeColor) > 0.6 ? '#141115' : '#FFFFFF';
  
  return (
    <Text 
      style={{ 
        backgroundColor: typeColor,
        color: textColor,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
      }}
      className="font-semibold text-xs"
    >
      {capitalizedType}
    </Text>
  );
}

function evaluateCounter(
  pokemon: Pokemon,
  targetType1: PokemonType,
  targetType2: PokemonType | null
): CounterPokemon | null {
  const pokemonType1 = pokemon.type1.toLowerCase() as PokemonType;
  const pokemonType2 = pokemon.type2 ? (pokemon.type2.toLowerCase() as PokemonType) : null;
  
  // Get matchups for the counter Pokémon
  const type1Matchups = getTypeMatchups(pokemonType1);
  const type2Matchups = pokemonType2 ? getTypeMatchups(pokemonType2) : null;
  
  // Get weaknesses and resistances of the counter Pokémon
  const counterWeaknesses = getWeaknesses(pokemonType1, pokemonType2 || undefined);
  const counterResistances = getResistances(pokemonType1, pokemonType2 || undefined);
  
  // Get counter's immunities
  const counterType1Matchups = getTypeMatchups(pokemonType1);
  const counterType2Matchups = pokemonType2 ? getTypeMatchups(pokemonType2) : null;
  const counterImmunities = [
    ...counterType1Matchups.defensive.immuneTo,
    ...(counterType2Matchups ? counterType2Matchups.defensive.immuneTo : [])
  ];
  
  let score = 0;
  const reasons: string[] = [];
  
  // Check if counter is weak to the target types (BAD - immediate disqualification)
  if (counterWeaknesses.includes(targetType1) || (targetType2 && counterWeaknesses.includes(targetType2))) {
    return null; // Don't suggest Pokémon weak to the target types
  }
  
  // Check if counter type moves are super effective against target
  const superEffectiveAgainstType1 = type1Matchups.offensive.superEffectiveAgainst.includes(targetType1);
  const superEffectiveAgainstType2 = targetType2 ? type1Matchups.offensive.superEffectiveAgainst.includes(targetType2) : false;
  const type2SuperEffectiveAgainstType1 = type2Matchups ? type2Matchups.offensive.superEffectiveAgainst.includes(targetType1) : false;
  const type2SuperEffectiveAgainstType2 = targetType2 && type2Matchups ? type2Matchups.offensive.superEffectiveAgainst.includes(targetType2) : false;
  
  // IDEAL: Super effective against BOTH target types
  if (targetType2 && superEffectiveAgainstType1 && superEffectiveAgainstType2) {
    score += 100;
    reasons.push(`${pokemonType1.charAt(0).toUpperCase() + pokemonType1.slice(1)} type moves are super effective against both ${targetType1.charAt(0).toUpperCase() + targetType1.slice(1)} and ${targetType2.charAt(0).toUpperCase() + targetType2.slice(1)}`);
  } else if (targetType2 && type2SuperEffectiveAgainstType1 && type2SuperEffectiveAgainstType2 && pokemonType2) {
    score += 100;
    reasons.push(`${pokemonType2.charAt(0).toUpperCase() + pokemonType2.slice(1)} type moves are super effective against both ${targetType1.charAt(0).toUpperCase() + targetType1.slice(1)} and ${targetType2.charAt(0).toUpperCase() + targetType2.slice(1)}`);
  } else if (superEffectiveAgainstType1 || superEffectiveAgainstType2 || type2SuperEffectiveAgainstType1 || type2SuperEffectiveAgainstType2) {
    score += 50;
    if (superEffectiveAgainstType1 || type2SuperEffectiveAgainstType1) {
      const effectiveType = superEffectiveAgainstType1 ? pokemonType1 : pokemonType2!;
      reasons.push(`${effectiveType.charAt(0).toUpperCase() + effectiveType.slice(1)} type moves are super effective against ${targetType1.charAt(0).toUpperCase() + targetType1.slice(1)}`);
    }
    if (superEffectiveAgainstType2 || type2SuperEffectiveAgainstType2) {
      const effectiveType = superEffectiveAgainstType2 ? pokemonType1 : pokemonType2!;
      reasons.push(`${effectiveType.charAt(0).toUpperCase() + effectiveType.slice(1)} type moves are super effective against ${targetType2!.charAt(0).toUpperCase() + targetType2!.slice(1)}`);
    }
  }
  
  // Check if counter is immune to the target types (BEST CASE)
  const immuneToType1 = counterImmunities.includes(targetType1);
  const immuneToType2 = targetType2 ? counterImmunities.includes(targetType2) : false;
  
  if (immuneToType1 && targetType2 && immuneToType2) {
    score += 80;
    reasons.push(`Immune to both ${targetType1.charAt(0).toUpperCase() + targetType1.slice(1)} and ${targetType2.charAt(0).toUpperCase() + targetType2.slice(1)} type moves`);
  } else if (immuneToType1) {
    score += 50;
    reasons.push(`Immune to ${targetType1.charAt(0).toUpperCase() + targetType1.slice(1)} type moves`);
  } else if (immuneToType2) {
    score += 50;
    reasons.push(`Immune to ${targetType2!.charAt(0).toUpperCase() + targetType2!.slice(1)} type moves`);
  }
  
  // Check if counter resists the target types
  const resistsType1 = counterResistances.includes(targetType1);
  const resistsType2 = targetType2 ? counterResistances.includes(targetType2) : false;
  
  if (resistsType1 && targetType2 && resistsType2) {
    score += 60;
    reasons.push(`Resists both ${targetType1.charAt(0).toUpperCase() + targetType1.slice(1)} and ${targetType2.charAt(0).toUpperCase() + targetType2.slice(1)} type moves`);
  } else if (resistsType1) {
    score += 30;
    reasons.push(`Resists ${targetType1.charAt(0).toUpperCase() + targetType1.slice(1)} type moves`);
  } else if (resistsType2) {
    score += 30;
    reasons.push(`Resists ${targetType2!.charAt(0).toUpperCase() + targetType2!.slice(1)} type moves`);
  }
  
  // Only suggest if score is meaningful
  if (score < 20) {
    return null;
  }
  
  // Determine category
  let category: 'ideal' | 'strong' | 'good';
  if (score >= 100) {
    category = 'ideal';
  } else if (score >= 60) {
    category = 'strong';
  } else {
    category = 'good';
  }
  
  return {
    ...pokemon,
    score,
    reasons,
    category,
  };
}

export function CounterSuggestions({ selectedType, secondType = null }: CounterSuggestionsProps) {
  // Evaluate all Pokémon and get top counters
  const counters: CounterPokemon[] = [];
  
  for (const pokemon of nationalDex) {
    // Only suggest final form Pokémon
    if (!pokemon.isFinalForm) {
      continue;
    }
    
    const evaluation = evaluateCounter(pokemon, selectedType, secondType);
    if (evaluation) {
      counters.push(evaluation);
    }
  }
  
  // Sort by score (highest first) and take top 3
  const topCounters = counters
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  if (topCounters.length === 0) {
    return null; // Don't render if no counters found
  }
  
  return (
    <View className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-400 dark:border-blue-700">
      <Text className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1.5">
        🎯 Top Counters <Text className="text-xs font-normal">(Does not take stats into account)</Text>
      </Text>
      
      {topCounters.map((counter, index) => (
        <View 
          key={counter.id}
          className="mb-1.5 last:mb-0"
        >
          <View className="flex-row items-center gap-1.5 flex-wrap">
            <Text className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              #{index + 1} {counter.name}
            </Text>
            <TypeBadge typeName={counter.type1} />
            {counter.type2 && <TypeBadge typeName={counter.type2} />}
          </View>
          
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">
            {counter.reasons.join(' • ')}
          </Text>
        </View>
      ))}
    </View>
  );
}
