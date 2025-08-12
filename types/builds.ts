export type BuildVariant = 'physical-attacker' | 'special-attacker' | 'physical-wall' | 'special-wall';

export interface Build {
  pokemonName: string;
  pokemonId: number;
  pokemonVariant?: string;
  variant: BuildVariant;
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
}

export interface Builds {
  [eventName: string]: {
    attackers: Build[];
    defenders: Build[];
  };
}
