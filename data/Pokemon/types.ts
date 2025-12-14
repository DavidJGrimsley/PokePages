// Shared Pokemon types for Legends Z-A

export interface Pokemon {
  id: number;
  name: string;
  type1: string;
  type2?: string;
  hasMega: boolean;
  canBeAlpha: boolean;
  evYield?: {
    hp?: number;
    attack?: number;
    defense?: number;
    specialAttack?: number;
    specialDefense?: number;
    speed?: number;
  };
}
