/**
 * Event Type System for PokePages
 * All event data lives in config files (offline-first)
 * Only user claim status syncs to Supabase
 */

export enum EventType {
  COUNTER = 'counter',
  TERA_RAID = 'tera-raid',
  MYSTERY_GIFT = 'mystery-gift',
  PROMO_CODE = 'promo-code',
}

export enum EventStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  LIMBO = 'limbo',
  DISTRIBUTION = 'distribution',
  PERIOD1_ACTIVE = 'period1-active',
  PERIOD1_ENDED = 'period1-ended',
  PERIOD2_ACTIVE = 'period2-active',
  ENDED = 'ended',
  EXPIRED = 'expired',
}

/**
 * Base event interface - common fields for all event types
 */
export interface BaseEvent {
  eventKey: string;
  eventType: EventType;
  title: string;
  description: string;
  startDate: string; // ISO 8601 with timezone
  endDate: string;
  timezone?: string;
  game: 'scarlet-violet' | 'legends-za' | 'go' | 'unite' | 'masters' | 'all';
  tags?: string[];
  youtubeVideos?: string[]; // Array of YouTube video IDs
  officialLinks?: string[]; // Array of official Pokemon.com URLs
  externalLinks?: {
    officialAnnouncement?: string;
    serebii?: string;
    bulbapedia?: string;
    youtubeGuide?: string;
  };
}

/**
 * Counter Event (Global Participation Challenges)
 * Users increment a global counter by defeating Pokemon
 */
export interface CounterEvent extends BaseEvent {
  eventType: EventType.COUNTER;
  pokemonName: string;
  pokemonId: number;
  isShiny?: boolean;
  teraType: string;
  distributionStart: string;
  distributionEnd: string;
  targetCount: number;
  maxRewards: number;
  rewardDetails?: {
    baseReward: string;
    bonusRewards?: string[];
  };
}

/**
 * Tera Raid Event (7-star, 6-star, 5-star raids)
 * High-level raids with special Pokemon and rewards
 */
export interface TeraRaidEvent extends BaseEvent {
  eventType: EventType.TERA_RAID;
  pokemonName: string;
  pokemonId: number;
  isShiny?: boolean;
  teraType: string;
  raidLevel: 5 | 6 | 7;
  hasMightiestMark?: boolean;
  periods: {
    period1: {
      start: string;
      end: string;
    };
    period2?: {
      start: string;
      end: string;
    };
  };
  catchable: boolean;
  catchLimit?: 'once' | 'unlimited';
  requirements?: string[];
  rewards: string[];
  concurrentEvents?: {
    pokemonName: string;
    raidLevel: number;
    notes: string;
  }[];
}

/**
 * Mystery Gift Event
 * Distributions via internet, local wireless, or serial codes
 */
export interface MysteryGiftEvent extends BaseEvent {
  eventType: EventType.MYSTERY_GIFT;
  rewardType: 'pokemon' | 'item' | 'unlock';
  pokemonName?: string;
  isShiny?: boolean;
  teraType?: string;
  rewardName: string;
  rewardDetails: {
    species?: string;
    level?: number;
    ability?: string;
    moves?: string[];
    heldItem?: string;
    pokemonId?: number;
    isShiny?: boolean;
  } | {
    itemName?: string;
    quantity?: number;
    unlocks?: string;
  };
  distributionMethod: 'internet' | 'local' | 'serial-code';
  serialCode?: string;
  isOngoing?: boolean; // No specific end date
  howToRedeem?: {
    steps: string[];
    menuPath?: string;
  };
}

/**
 * Promo Code Event
 * Redeemable codes for in-game rewards
 */
export interface PromoCodeEvent extends BaseEvent {
  eventType: EventType.PROMO_CODE;
  code: string;
  codeType: 'in-game' | 'online' | 'app';
  rewards: {
    type: 'pokemon' | 'item' | 'currency';
    name: string;
    quantity?: number;
    details?: string;
    pokemonId?: number;
    isShiny?: boolean;
  }[];
  redemptionLimit?: 'once' | 'multiple';
  expirationDate: string; // ISO 8601 - when code stops working
  howToRedeem?: {
    steps: string[];
    menuPath?: string;
  };
}

/**
 * Union type for all event types
 */
export type AnyEvent = CounterEvent | TeraRaidEvent | MysteryGiftEvent | PromoCodeEvent;

/**
 * Type guard functions
 */
export function isCounterEvent(event: AnyEvent): event is CounterEvent {
  return event.eventType === EventType.COUNTER;
}

export function isTeraRaidEvent(event: AnyEvent): event is TeraRaidEvent {
  return event.eventType === EventType.TERA_RAID;
}

export function isMysteryGiftEvent(event: AnyEvent): event is MysteryGiftEvent {
  return event.eventType === EventType.MYSTERY_GIFT;
}

export function isPromoCodeEvent(event: AnyEvent): event is PromoCodeEvent {
  return event.eventType === EventType.PROMO_CODE;
}
