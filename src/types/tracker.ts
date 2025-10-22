// Shared tracker types used across client and server

export type FormType = 'normal' | 'shiny' | 'alpha' | 'alphaShiny';

export interface RegisteredStatus {
  normal: boolean;
  shiny: boolean;
  alpha: boolean;
  alphaShiny: boolean;
}
