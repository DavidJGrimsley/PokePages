import { makeRedirectUri } from 'expo-auth-session';

console.log('=== Deep Linking Test ===');

// Test different redirect URI configurations
const configs = [
  {
    name: 'Basic with custom scheme',
    config: { scheme: 'pokepages' }
  },
  {
    name: 'With path',
    config: { scheme: 'pokepages', path: '/auth/callback' }
  },
  {
    name: 'Native style',
    config: { scheme: 'pokepages', path: '/auth/callback', isTripleSlashed: true }
  },
  {
    name: 'Default (no scheme)',
    config: {}
  }
];

configs.forEach(({ name, config }) => {
  try {
    const uri = makeRedirectUri(config);
    console.log(`${name}: ${uri}`);
  } catch (error) {
    console.log(`${name}: ERROR - ${error.message}`);
  }
});

console.log('\nExpected Supabase redirect URL format: pokepages://**');
console.log('Your configured scheme in app.json: pokepages');
console.log('\nIn Supabase dashboard, make sure redirect URLs include:');
console.log('- pokepages://** (for development)');
console.log('- Your production URLs when ready');