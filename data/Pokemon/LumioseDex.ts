export interface Pokemon {
  id: number;
  name: string;
  type1: string;
  type2?: string;
  hasMega: boolean;
  canBeAlpha: boolean;
}

export const nationalDex: Pokemon[] = [
  { id: 11, name: "Metapod", type1: "Bug", hasMega: false, canBeAlpha: false },
  { id: 12, name: "Butterfree", type1: "Bug", type2: "Flying", hasMega: false, canBeAlpha: false },
  { id: 13, name: "Weedle", type1: "Bug", type2: "Poison", hasMega: false, canBeAlpha: false },
  { id: 14, name: "Kakuna", type1: "Bug", type2: "Poison", hasMega: false, canBeAlpha: false },
  { id: 15, name: "Beedrill", type1: "Bug", type2: "Poison", hasMega: true, canBeAlpha: true },
  { id: 16, name: "Pidgey", type1: "Normal", type2: "Flying", hasMega: false, canBeAlpha: false },
  { id: 17, name: "Pidgeotto", type1: "Normal", type2: "Flying", hasMega: false, canBeAlpha: false },
  { id: 18, name: "Pidgeot", type1: "Normal", type2: "Flying", hasMega: true, canBeAlpha: false },
  { id: 19, name: "Rattata", type1: "Normal", hasMega: false, canBeAlpha: false },
];

// Helper functions for easier searching
export const findPokemonById = (id: number): Pokemon | undefined => {
  return nationalDex.find(pokemon => pokemon.id === id);
};

export const findPokemonByName = (name: string): Pokemon | undefined => {
  return nationalDex.find(pokemon => 
    pokemon.name.toLowerCase() === name.toLowerCase()
  );
};

export const findPokemonByType = (type: string): Pokemon[] => {
  return nationalDex.filter(pokemon => 
    pokemon.type1.toLowerCase() === type.toLowerCase() ||
    pokemon.type2?.toLowerCase() === type.toLowerCase()
  );
};

export const searchPokemon = (query: string): Pokemon[] => {
  const lowerQuery = query.toLowerCase();
  return nationalDex.filter(pokemon =>
    pokemon.name.toLowerCase().includes(lowerQuery) ||
    pokemon.type1.toLowerCase().includes(lowerQuery) ||
    pokemon.type2?.toLowerCase().includes(lowerQuery)
  );
};
