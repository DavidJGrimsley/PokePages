// Event configuration data for all Treasures of Ruin events
export const eventConfig = {
  'wo-chien': {
    pokemonName: 'Shiny Wo-Chien',
    pokemonId: 1001,
    eventTitle: 'Shiny Wo-Chien Defeat Counter',
    eventDescription: "Click the button to increment the counter. Only click it if you've really defeated it AND you were the host. This is the best way I can think of tracking it but it requires us to use the honor system. Please share this page!",
    apiEndpoint: 'https://api.pokepages.app',
    startDate: '2025-07-22T17:00:00-07:00', // Tuesday, July 22, 2025, at 5:00 p.m. PDT
    endDate: '2025-08-03T16:59:59-07:00',   // Sunday, August 3, 2025, at 4:59 p.m. PDT
    distributionStart: '2025-08-07T17:00:00-07:00', // August 7, 2025
    distributionEnd: '2025-09-30T23:59:59-07:00',   // September 30, 2025
    targetCount: 1000000,
    maxRewards: 2000000,
    timezone: 'America/Los_Angeles', // PDT timezone
    teraType: 'Grass',
  },
  'chien-pao': {
    pokemonName: 'Shiny Chien-Pao',
    pokemonId: 1002,
    eventTitle: 'Shiny Chien-Pao Defeat Counter',
    eventDescription: "Click the button to increment the counter. Only click it if you've really defeated it AND you were the host. This is the best way I can think of tracking it but it requires us to use the honor system. Please share this page!",
    apiEndpoint: 'https://api.pokepages.app',
    startDate: '2025-08-03T17:00:00-07:00', // Sunday, August 3, 2025, at 5:00 p.m. PDT
    endDate: '2025-08-17T16:59:59-07:00',   // Sunday, August 17, 2025, at 4:59 p.m. PDT
    distributionStart: '2025-08-21T17:00:00-07:00',
    distributionEnd: '2025-09-30T16:59:59-07:00',
    targetCount: 1000000,
    maxRewards: 2000000,
    timezone: 'America/Los_Angeles', // PDT timezone
    teraType: 'Ice',
  },
  'ting-lu': {
    pokemonName: 'Shiny Ting-Lu',
    pokemonId: 1003,
    eventTitle: 'Shiny Ting-Lu Defeat Counter',
    eventDescription: "Click the button to increment the counter. Only click it if you've really defeated it AND you were the host. This is the best way I can think of tracking it but it requires us to use the honor system. Please share this page!",
    apiEndpoint: 'https://api.pokepages.app',
    startDate: '2025-08-17T17:00:00-07:00', // Sunday, August 17, 2025, at 5:00 p.m. PDT
    endDate: '2025-08-31T16:59:59-07:00',   // Sunday, August 31, 2025, at 4:59 p.m. PDT
    distributionStart: '2025-09-04T17:00:00-07:00', // September 4, 2025
    distributionEnd: '2025-10-29T23:59:59-07:00',   // October 29, 2025
    targetCount: 1000000,
    maxRewards: 2000000,
    timezone: 'America/Los_Angeles', // PDT timezone
    teraType: 'Ground',
  },
  'chi-yu': {
    pokemonName: 'Shiny Chi-Yu',
    pokemonId: 1004,
    eventTitle: 'Shiny Chi-Yu Defeat Counter',
    eventDescription: "Click the button to increment the counter. Only click it if you've really defeated it AND you were the host. This is the best way I can think of tracking it but it requires us to use the honor system. Please share this page!",
    apiEndpoint: 'https://api.pokepages.app',
    startDate: '2025-08-31T17:00:00-07:00', // Sunday, August 31, 2025, at 5:00 p.m. PDT
    endDate: '2025-09-14T16:59:59-07:00',   // Sunday, September 14, 2025, at 4:59 p.m. PDT
    distributionStart: '2025-09-18T17:00:00-07:00', // September 18, 2025
    distributionEnd: '2025-11-12T23:59:59-08:00',   // November 12, 2025 (PST)
    targetCount: 1000000,
    maxRewards: 2000000,
    timezone: 'America/Los_Angeles', // PDT timezone
    teraType: 'Fire',
  },
};

export type EventConfigKey = keyof typeof eventConfig;
export type EventConfig = typeof eventConfig[EventConfigKey];
