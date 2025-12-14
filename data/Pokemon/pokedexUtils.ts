import type { Pokemon } from '@/data/Pokemon/types';
import { lumioseDex } from '@/data/Pokemon/LegendsZA/LumioseDex';
import { hyperspaceDex } from '@/data/Pokemon/LegendsZA/HyperspaceDex';
import { megaDex } from '@/data/Pokemon/MegaDex';

// Pokemon search and lookup utilities

/**
 * Find a Pokemon by its ID from the Lumiose Dex
 */
export const findPokemonById = (id: number): Pokemon | undefined => {
  return lumioseDex.find((pokemon: Pokemon) => pokemon.id === id);
};

/**
 * Find a Pokemon by its name from the Lumiose Dex
 */
export const findPokemonByName = (name: string): Pokemon | undefined => {
  return lumioseDex.find((pokemon: Pokemon) => 
    pokemon.name.toLowerCase() === name.toLowerCase()
  );
};

/**
 * Find a Mega Pokemon by its ID from the Mega Dex
 */
export const findMegaPokemonById = (id: number): Pokemon | undefined => {
  return megaDex.find((pokemon: Pokemon) => pokemon.id === id);
};

/**
 * Find a Mega Pokemon by its name from the Mega Dex
 */
export const findMegaPokemonByName = (name: string): Pokemon | undefined => {
  return megaDex.find((pokemon: Pokemon) => 
    pokemon.name.toLowerCase() === name.toLowerCase()
  );
};

/**
 * Check if a Pokemon has a Mega Evolution
 */
export const hasMegaEvolution = (id: number): boolean => {
  return megaDex.some((pokemon: Pokemon) => pokemon.id === id);
};

/**
 * Get all Mega forms for a Pokemon by its base ID
 */
export const getMegaFormsForPokemon = (id: number): Pokemon[] => {
  return megaDex.filter((pokemon: Pokemon) => pokemon.id === id);
};

/**
 * Search across all Pokedexes (Lumiose, Hyperspace, and Mega) by name or type
 */
export const searchAllPokemon = (query: string): Pokemon[] => {
  const lowerQuery = query.toLowerCase();
  
  const regularResults = lumioseDex.filter(pokemon =>
    pokemon.name.toLowerCase().includes(lowerQuery) ||
    pokemon.type1.toLowerCase().includes(lowerQuery) ||
    pokemon.type2?.toLowerCase().includes(lowerQuery)
  );
  
  const hyperspaceResults = hyperspaceDex.filter((pokemon: Pokemon) =>
    pokemon.name.toLowerCase().includes(lowerQuery) ||
    pokemon.type1.toLowerCase().includes(lowerQuery) ||
    pokemon.type2?.toLowerCase().includes(lowerQuery)
  );

  const megaResults = megaDex.filter((pokemon: Pokemon) =>
    pokemon.name.toLowerCase().includes(lowerQuery) ||
    pokemon.type1.toLowerCase().includes(lowerQuery) ||
    pokemon.type2?.toLowerCase().includes(lowerQuery)
  );
  
  return [...regularResults, ...hyperspaceResults, ...megaResults];
};

/**
 * Get all Pokemon of a specific type
 */
export const findPokemonByType = (type: string): Pokemon[] => {
  return lumioseDex.filter(pokemon =>
    pokemon.type1.toLowerCase() === type.toLowerCase() ||
    pokemon.type2?.toLowerCase() === type.toLowerCase()
  );
};

/**
 * Get count of all Pokemon across all dexes
 */
export const getTotalPokemonCount = (): { lumiose: number, hyperspace: number, mega: number, total: number } => {
  return {
    lumiose: lumioseDex.length,
    hyperspace: hyperspaceDex.length,
    mega: megaDex.length,
    total: lumioseDex.length + hyperspaceDex.length + megaDex.length
  };
};
