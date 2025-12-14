import { PokemonClient } from 'pokenode-ts';

export interface EvYield {
  hp?: number;
  attack?: number;
  defense?: number;
  specialAttack?: number;
  specialDefense?: number;
  speed?: number;
}

export interface Pokemon {
  id: number;
  name: string;
  type1: string;
  type2?: string;
  hasMega: boolean;
  canBeAlpha: boolean;
  evYield?: EvYield;
}

export const statNameMap: Record<string, keyof EvYield> = {
  'hp': 'hp',
  'attack': 'attack',
  'defense': 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  'speed': 'speed',
};

export const normalizeApiName = (pokemonName: string) => {
  let apiName = pokemonName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\./g, '')
    .replace(/'/g, '')
    .replace(/:/g, '');

  const nameMap: Record<string, string> = {
    'keldeo': 'keldeo-ordinary',
    'meloetta': 'meloetta-aria',
    'mimikyu': 'mimikyu-disguised',
    'toxtricity': 'toxtricity-amped',
    'indeedee': 'indeedee-male',
    'morpeko': 'morpeko-full-belly',
    'squawkabilly': 'squawkabilly-green-plumage',
    'tatsugiri': 'tatsugiri-curly',
  };

  if (nameMap[apiName]) {
    apiName = nameMap[apiName];
  }

  return apiName;
};

export const evYieldFromStats = (stats: any[]): EvYield | undefined => {
  const evYield: EvYield = {};
  let hasEvs = false;

  for (const stat of stats) {
    if (stat.effort > 0) {
      const statKey = statNameMap[stat.stat.name];
      if (statKey) {
        (evYield as any)[statKey] = stat.effort;
        hasEvs = true;
      }
    }
  }

  return hasEvs ? evYield : undefined;
};

export const formatPokemonForExport = (p: Pokemon) => {
  const type2Part = p.type2 ? `, type2: \"${p.type2}\"` : '';
  const evYieldPart = p.evYield
    ? `, evYield: ${JSON.stringify(p.evYield).replace(/\"(\w+)\":/g, '$1:')}`
    : '';

  return `  { id: ${p.id}, name: \"${p.name}\", type1: \"${p.type1}\"${type2Part}, hasMega: ${p.hasMega}, canBeAlpha: ${p.canBeAlpha}${evYieldPart} }`;
};

export async function fetchPokemonDataByName(name: string, client: PokemonClient) {
  try {
    const apiName = normalizeApiName(name);
    const pokemon = await client.getPokemonByName(apiName);
    const types = pokemon.types
      .sort((a, b) => a.slot - b.slot)
      .map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1));

    const evYield = evYieldFromStats(pokemon.stats);

    return {
      id: pokemon.id,
      name,
      type1: types[0],
      type2: types[1],
      hasMega: false,
      canBeAlpha: true,
      evYield,
    };
  } catch (error) {
    console.error(`Failed to fetch ${name}:`, error);
    return undefined;
  }
}
