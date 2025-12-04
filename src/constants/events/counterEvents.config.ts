import { CounterEvent, EventType } from './types';

/**
 * Global Participation Counter Events
 * Players defeat Pokemon and increment a global counter
 * Rewards are distributed during distribution period after raid ends
 */
export const counterEvents: Record<string, CounterEvent> = {
  'wo-chien': {
    eventKey: 'wo-chien',
    eventType: EventType.COUNTER,
    title: 'Shiny Wo-Chien Global Challenge',
    description: "Help defeat Shiny Wo-Chien 1 million times worldwide to unlock Mystery Gift rewards! Click the counter button if you've defeated it AND you were the host. This is the best way we can think of tracking it but it requires us to use the honor system. Please share this page!",
    pokemonName: 'Shiny Wo-Chien',
    pokemonId: 1001,
    isShiny: true,
    teraType: 'Grass',
    startDate: '2024-07-23T00:00:00Z',
    endDate: '2024-08-03T23:59:59Z',
    distributionStart: '2024-08-07T17:00:00-07:00',
    distributionEnd: '2024-09-30T23:59:59-07:00',
    targetCount: 1000000,
    maxRewards: 2000000,
    timezone: 'America/Los_Angeles',
    game: 'scarlet-violet',
    youtubeVideos: [
      // Add your YouTube video IDs here for event guides/coverage
      // Example: 'dQw4w9WgXcQ'
    ],
    officialLinks: [],
    rewardDetails: {
      baseReward: 'Mystery Gift Pokémon',
      bonusRewards: ['Additional Mystery Gift for every 100K defeats past 1M'],
    },
  },
  'chien-pao': {
    eventKey: 'chien-pao',
    eventType: EventType.COUNTER,
    title: 'Shiny Chien-Pao Global Challenge',
    description: "Help defeat Shiny Chien-Pao 1 million times worldwide to unlock Mystery Gift rewards! Click the counter button if you've defeated it AND you were the host. This is the best way we can think of tracking it but it requires us to use the honor system. Please share this page!",
    pokemonName: 'Shiny Chien-Pao',
    pokemonId: 1002,
    isShiny: true,
    teraType: 'Ice',
    startDate: '2024-08-04T00:00:00Z',
    endDate: '2024-08-17T23:59:59Z',
    distributionStart: '2024-08-21T17:00:00-07:00',
    distributionEnd: '2024-09-30T23:59:59-07:00',
    targetCount: 1000000,
    maxRewards: 2000000,
    timezone: 'America/Los_Angeles',
    game: 'scarlet-violet',
    youtubeVideos: [
      // Add your YouTube video IDs here for event guides/coverage
      // Example: 'dQw4w9WgXcQ'
    ],
    officialLinks: [],
    rewardDetails: {
      baseReward: 'Mystery Gift Pokémon',
      bonusRewards: ['Additional Mystery Gift for every 100K defeats past 1M'],
    },
  },
  'ting-lu': {
    eventKey: 'ting-lu',
    eventType: EventType.COUNTER,
    title: 'Shiny Ting-Lu Global Challenge',
    description: "Help defeat Shiny Ting-Lu 1 million times worldwide to unlock Mystery Gift rewards! Click the counter button if you've defeated it AND you were the host. This is the best way we can think of tracking it but it requires us to use the honor system. Please share this page!",
    pokemonName: 'Shiny Ting-Lu',
    pokemonId: 1003,
    isShiny: true,
    teraType: 'Ground',
    startDate: '2024-08-18T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
    distributionStart: '2024-09-04T17:00:00-07:00',
    distributionEnd: '2024-09-30T23:59:59-07:00',
    targetCount: 1000000,
    maxRewards: 2000000,
    timezone: 'America/Los_Angeles',
    game: 'scarlet-violet',
    youtubeVideos: [
      // Add your YouTube video IDs here for event guides/coverage
      // Example: 'dQw4w9WgXcQ'
    ],
    officialLinks: [],
    rewardDetails: {
      baseReward: 'Mystery Gift Pokémon',
      bonusRewards: ['Additional Mystery Gift for every 100K defeats past 1M'],
    },
  },
  'chi-yu': {
    eventKey: 'chi-yu',
    eventType: EventType.COUNTER,
    title: 'Shiny Chi-Yu Global Challenge',
    description: "Help defeat Shiny Chi-Yu 1 million times worldwide to unlock Mystery Gift rewards! Click the counter button if you've defeated it AND you were the host. This is the best way we can think of tracking it but it requires us to use the honor system. Please share this page!",
    pokemonName: 'Shiny Chi-Yu',
    pokemonId: 1004,
    isShiny: true,
    teraType: 'Fire',
    startDate: '2024-09-01T00:00:00Z',
    endDate: '2024-09-14T23:59:59Z',
    distributionStart: '2024-09-18T17:00:00-07:00',
    distributionEnd: '2024-09-30T23:59:59-07:00',
    targetCount: 1000000,
    maxRewards: 2000000,
    timezone: 'America/Los_Angeles',
    game: 'scarlet-violet',
    youtubeVideos: [
      // Add your YouTube video IDs here for event guides/coverage
      // Example: 'dQw4w9WgXcQ'
    ],
    officialLinks: [],
    rewardDetails: {
      baseReward: 'Mystery Gift Pokémon',
      bonusRewards: ['Additional Mystery Gift for every 100K defeats past 1M'],
    },
  },
};
