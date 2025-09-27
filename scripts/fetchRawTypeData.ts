import { PokemonClient } from 'pokenode-ts';
import { writeFile } from 'fs/promises';

async function fetchRawTypeData() {
  const api = new PokemonClient();
  
  try {
    console.log('🔄 Fetching raw type data from pokenode-ts...');
    
    // Get list of all types
    const typesList = await api.listTypes(0, 50);
    const rawTypeData: Record<string, any> = {};
    
    for (const typeResource of typesList.results) {
      console.log(`  Fetching ${typeResource.name}...`);
      const typeData = await api.getTypeByName(typeResource.name);
      
      rawTypeData[typeResource.name] = {
        id: typeData.id,
        name: typeData.name,
        damage_relations: typeData.damage_relations
      };
    }
    
    const outputPath = 'src/constants/pokemonTypeChart-raw.json';
    await writeFile(outputPath, JSON.stringify(rawTypeData, null, 2));
    
    console.log(`✅ Raw pokenode-ts data saved to ${outputPath}`);
    console.log(`📊 Fetched ${Object.keys(rawTypeData).length} types`);
    
    // Show example structure
    console.log('\n🔍 Example raw structure (Fire type):');
    console.log(JSON.stringify(rawTypeData.fire?.damage_relations, null, 2));
    
  } catch (error) {
    console.error('❌ Error fetching raw type data:', error);
  }
}

fetchRawTypeData();