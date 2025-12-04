import { TeraRaidEvent, EventType } from './types';

/**
 * Tera Raid Events (7-star, 6-star, 5-star raids)
 * Special limited-time raids with powerful Pokemon
 */
export const teraRaidEvents: Record<string, TeraRaidEvent> = {
  'dragapult-dec-2025': {
    eventKey: 'dragapult-dec-2025',
    eventType: EventType.TERA_RAID,
    title: 'Dragapult with the Mightiest Mark',
    description: 'Battle Dragon-Tera Type Dragapult in black crystal 7-star Tera Raids! Earn significant Exp. Candy, treasures, stat-boosting items, and Dragon Tera Shards. Catch Dragapult once per save file!',
    pokemonName: 'Dragapult',
    pokemonId: 887,
    teraType: 'Dragon',
    raidLevel: 7,
    hasMightiestMark: true,
    periods: {
      period1: {
        start: '2025-12-04T16:00:00-08:00', // Thursday, Dec 4, 4:00 PM PST
        end: '2025-12-07T15:59:59-08:00',   // Sunday, Dec 7, 3:59 PM PST
      },
      period2: {
        start: '2025-12-11T16:00:00-08:00', // Thursday, Dec 11, 4:00 PM PST
        end: '2025-12-14T15:59:59-08:00',   // Sunday, Dec 14, 3:59 PM PST
      },
    },
    catchable: true,
    catchLimit: 'once',
    requirements: [
      'Complete postgame events',
      'Or join a raid hosted by someone who has',
    ],
    rewards: [
      'Exp. Candy (significant amounts)',
      'Sellable treasures',
      'Stat-boosting items',
      'Dragon Tera Shards',
      'Chance of Herba Mystica and Ability Capsules',
    ],
    concurrentEvents: [
      {
        pokemonName: 'Blissey',
        raidLevel: 5,
        notes: 'Available during Period 2 only, various Tera Types',
      },
    ],
    startDate: '2025-12-04T16:00:00-08:00',
    endDate: '2025-12-14T15:59:59-08:00',
    timezone: 'America/Los_Angeles',
    game: 'scarlet-violet',
    youtubeVideos: [
      // Add your YouTube video IDs here for event guides/coverage
      // Example: 'dQw4w9WgXcQ'
    ],
    officialLinks: [
      'https://www.pokemon.com/us/pokemon-news/dragapult-with-the-mightiest-mark-is-coming-to-7-star-tera-raid-battles',
    ],
    externalLinks: {
      officialAnnouncement: 'https://www.pokemon.com/us/pokemon-news/dragapult-with-the-mightiest-mark-is-coming-to-7-star-tera-raid-battles',
    },
  },
};
