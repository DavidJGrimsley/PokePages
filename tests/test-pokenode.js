const { PokemonClient } = require('pokenode-ts');

async function testAPI() {
  try {
    const api = new PokemonClient();
    
    // Test getting a specific type
    console.log('Testing getTypeByName...');
    const fireType = await api.getTypeByName('fire');
    
    console.log('Fire type damage relations:');
    console.log('Double damage to:', fireType.damage_relations.double_damage_to.map(t => t.name));
    console.log('Double damage from:', fireType.damage_relations.double_damage_from.map(t => t.name));
    
    // Test listing types
    console.log('\nTesting listTypes...');
    const typesList = await api.listTypes();
    console.log('Available types:', typesList.results.slice(0, 5).map(t => t.name));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();