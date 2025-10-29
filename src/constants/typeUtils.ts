import pokemonTypeChartRaw from './pokemonTypeChart-raw.json';

// Define all Pokémon types including special ones
export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' 
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' 
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy'
  | 'stellar' | 'unknown' | 'shadow';

// All standard Pokemon types (excluding special types like stellar, unknown, shadow)
export const ALL_STANDARD_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Type effectiveness multipliers
export const TYPE_EFFECTIVENESS = {
  SUPER_EFFECTIVE: 2.0,
  NORMAL: 1.0,
  NOT_VERY_EFFECTIVE: 0.5,
  NO_EFFECT: 0.0,
} as const;

export type TypeEffectiveness = typeof TYPE_EFFECTIVENESS[keyof typeof TYPE_EFFECTIVENESS];

// Type effectiveness result
export interface TypeEffectivenessResult {
  multiplier: TypeEffectiveness;
  description: 'super effective' | 'normal' | 'not very effective' | 'no effect';
  isEffective: boolean;
}

/**
 * Get the effectiveness of an attacking type against a defending type using raw API data
 * @param attackingType - The type of the attacking move
 * @param defendingType - The type of the defending Pokémon
 * @returns TypeEffectivenessResult with multiplier and description
 */
export function getTypeEffectiveness(
  attackingType: PokemonType, 
  defendingType: PokemonType
): TypeEffectivenessResult {
  const attackerData = pokemonTypeChartRaw[attackingType];
  
  if (!attackerData) {
    return {
      multiplier: TYPE_EFFECTIVENESS.NORMAL,
      description: 'normal',
      isEffective: false
    };
  }

  const { damage_relations } = attackerData;

  // Check for no effect (immunity)
  if (damage_relations.no_damage_to.some(type => type.name === defendingType)) {
    return {
      multiplier: TYPE_EFFECTIVENESS.NO_EFFECT,
      description: 'no effect',
      isEffective: false
    };
  }

  // Check for super effective (double damage)
  if (damage_relations.double_damage_to.some(type => type.name === defendingType)) {
    return {
      multiplier: TYPE_EFFECTIVENESS.SUPER_EFFECTIVE,
      description: 'super effective',
      isEffective: true
    };
  }

  // Check for not very effective (half damage)
  if (damage_relations.half_damage_to.some(type => type.name === defendingType)) {
    return {
      multiplier: TYPE_EFFECTIVENESS.NOT_VERY_EFFECTIVE,
      description: 'not very effective',
      isEffective: false
    };
  }

  // Default to normal effectiveness
  return {
    multiplier: TYPE_EFFECTIVENESS.NORMAL,
    description: 'normal',
    isEffective: false
  };
}

/**
 * Calculate damage multiplier for a dual-type Pokémon
 * @param attackingType - The type of the attacking move
 * @param defendingType1 - First type of the defending Pokémon
 * @param defendingType2 - Second type of the defending Pokémon (optional)
 * @returns Combined effectiveness multiplier
 */
export function getDualTypeEffectiveness(
  attackingType: PokemonType,
  defendingType1: PokemonType,
  defendingType2?: PokemonType
): TypeEffectivenessResult {
  const effectiveness1 = getTypeEffectiveness(attackingType, defendingType1);
  
  if (!defendingType2) {
    return effectiveness1;
  }

  const effectiveness2 = getTypeEffectiveness(attackingType, defendingType2);
  const combinedMultiplier = effectiveness1.multiplier * effectiveness2.multiplier;

  let description: TypeEffectivenessResult['description'];
  let isEffective = false;

  if (combinedMultiplier === 0) {
    description = 'no effect';
  } else if (combinedMultiplier >= 2) {
    description = 'super effective';
    isEffective = true;
  } else if (combinedMultiplier > 1) {
    description = 'super effective';
    isEffective = true;
  } else if (combinedMultiplier < 1) {
    description = 'not very effective';
  } else {
    description = 'normal';
  }

  return {
    multiplier: combinedMultiplier as TypeEffectiveness,
    description,
    isEffective
  };
}

/**
 * Get all types that are super effective against a given type
 * @param defendingType - The type to check against
 * @returns Array of types that are super effective
 */
export function getSuperEffectiveAgainst(defendingType: PokemonType): PokemonType[] {
  return (Object.keys(pokemonTypeChartRaw) as PokemonType[]).filter(attackingType => {
    const result = getTypeEffectiveness(attackingType, defendingType);
    return result.description === 'super effective';
  });
}

/**
 * Get all types that resist a given attacking type
 * @param attackingType - The attacking type
 * @returns Array of types that resist this attack
 */
export function getResistantTypes(attackingType: PokemonType): PokemonType[] {
  return (Object.keys(pokemonTypeChartRaw) as PokemonType[]).filter(defendingType => {
    const result = getTypeEffectiveness(attackingType, defendingType);
    return result.description === 'not very effective';
  });
}

/**
 * Get all types that are immune to a given attacking type
 * @param attackingType - The attacking type
 * @returns Array of types that are immune
 */
export function getImmuneTypes(attackingType: PokemonType): PokemonType[] {
  return (Object.keys(pokemonTypeChartRaw) as PokemonType[]).filter(defendingType => {
    const result = getTypeEffectiveness(attackingType, defendingType);
    return result.description === 'no effect';
  });
}

/**
 * Get comprehensive type matchup information for a type using raw API data
 * @param type - The type to analyze
 * @returns Complete type matchup data
 */
export function getTypeMatchups(type: PokemonType) {
  const typeData = pokemonTypeChartRaw[type];
  
  if (!typeData) {
    return {
      offensive: { superEffectiveAgainst: [], notVeryEffectiveAgainst: [], noEffectAgainst: [] },
      defensive: { weakTo: [], resistsFrom: [], immuneTo: [] }
    };
  }

  const { damage_relations } = typeData;
  
  return {
    // Offensive matchups (when this type attacks)
    offensive: {
      superEffectiveAgainst: damage_relations.double_damage_to.map(t => t.name as PokemonType),
      notVeryEffectiveAgainst: damage_relations.half_damage_to.map(t => t.name as PokemonType),
      noEffectAgainst: damage_relations.no_damage_to.map(t => t.name as PokemonType),
    },
    // Defensive matchups (when this type defends)
    defensive: {
      weakTo: damage_relations.double_damage_from.map(t => t.name as PokemonType),
      resistsFrom: damage_relations.half_damage_from.map(t => t.name as PokemonType),
      immuneTo: damage_relations.no_damage_from.map(t => t.name as PokemonType),
    }
  };
}

/**
 * Check if a type combination has any weaknesses
 * @param type1 - First type
 * @param type2 - Second type (optional)
 * @returns Array of types that are super effective against this combination
 */
export function getWeaknesses(type1: PokemonType, type2?: PokemonType): PokemonType[] {
  const allTypes = Object.keys(pokemonTypeChartRaw) as PokemonType[];
  
  return allTypes.filter(attackingType => {
    const effectiveness = type2 
      ? getDualTypeEffectiveness(attackingType, type1, type2)
      : getTypeEffectiveness(attackingType, type1);
    
    return effectiveness.multiplier > 1;
  });
}

/**
 * Check if a type combination resists any types
 * @param type1 - First type
 * @param type2 - Second type (optional)
 * @returns Array of types that this combination resists
 */
export function getResistances(type1: PokemonType, type2?: PokemonType): PokemonType[] {
  const allTypes = Object.keys(pokemonTypeChartRaw) as PokemonType[];
  
  return allTypes.filter(attackingType => {
    const effectiveness = type2 
      ? getDualTypeEffectiveness(attackingType, type1, type2)
      : getTypeEffectiveness(attackingType, type1);
    
    return effectiveness.multiplier < 1 && effectiveness.multiplier > 0;
  });
}

/**
 * Get types that both types in a combination are super effective against (4x damage when dual-typed attacks)
 * @param type1 - First attacking type
 * @param type2 - Second attacking type (optional)
 * @returns Array of dual-type combinations that would take 4x damage
 */
export function getDualSuperEffectiveTargets(type1: PokemonType, type2?: PokemonType): PokemonType[] {
  if (!type2) {
    // For single type, return targets where type combos would take 4x
    const superEffective = getTypeMatchups(type1).offensive.superEffectiveAgainst;
    return ALL_STANDARD_TYPES.filter(targetType => {
      return superEffective.includes(targetType);
    });
  }
  
  // For dual-type attacker, find targets weak to both
  const type1Super = getTypeMatchups(type1).offensive.superEffectiveAgainst;
  const type2Super = getTypeMatchups(type2).offensive.superEffectiveAgainst;
  
  // Return types that appear in both super effective lists
  return type1Super.filter(type => type2Super.includes(type));
}

/**
 * Get types that a dual-type Pokemon is 4x weak to (both types weak to the attacking type)
 * @param type1 - First defending type
 * @param type2 - Second defending type
 * @returns Array of attacking types that deal 4x damage
 */
export function getQuadrupleWeaknesses(type1: PokemonType, type2: PokemonType): PokemonType[] {
  const allTypes = Object.keys(pokemonTypeChartRaw) as PokemonType[];
  
  return allTypes.filter(attackingType => {
    const effectiveness = getDualTypeEffectiveness(attackingType, type1, type2);
    return effectiveness.multiplier >= 4;
  });
}

/**
 * Get types that a dual-type Pokemon is 4x resistant to (both types resist the attacking type)
 * @param type1 - First defending type
 * @param type2 - Second defending type
 * @returns Array of attacking types that deal 0.25x damage
 */
export function getQuadrupleResistances(type1: PokemonType, type2: PokemonType): PokemonType[] {
  const allTypes = Object.keys(pokemonTypeChartRaw) as PokemonType[];
  
  return allTypes.filter(attackingType => {
    const effectiveness = getDualTypeEffectiveness(attackingType, type1, type2);
    return effectiveness.multiplier <= 0.25 && effectiveness.multiplier > 0;
  });
}

// Export the raw type chart data for direct access if needed
export { pokemonTypeChartRaw as typeChart };