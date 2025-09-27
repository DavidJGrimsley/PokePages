import { PokemonClient } from 'pokenode-ts';
import { writeFile } from 'fs/promises';
import { join } from 'path';

interface TypeData {
  superEffectiveAgainst: string[];
  notVeryEffectiveAgainst: string[];
  noEffectAgainst: string[];
  weakTo: string[];
  resistsFrom: string[];
  immuneTo: string[];
}

/**
 * Fetch complete type effectiveness data from PokéAPI and generate JSON file
 * This script generates the pokemonTypeChart.json file used by typeUtils.ts
 */
async function generateTypeChart() {
  console.log('🔄 Fetching Pokémon type data from API...');
  
  const api = new PokemonClient();
  const typeChart: Record<string, TypeData> = {};

  try {
    // Get all types
    const allTypesResponse = await api.listTypes();
    const typeNames = allTypesResponse.results
      .map(t => t.name)
      .filter(name => name !== 'unknown' && name !== 'shadow'); // Filter out unused types

    console.log(`📊 Processing ${typeNames.length} types...`);

    for (const typeName of typeNames) {
      console.log(`  Processing ${typeName}...`);
      
      const typeData = await api.getTypeByName(typeName);
      
      typeChart[typeName] = {
        // What this type is super effective against
        superEffectiveAgainst: typeData.damage_relations.double_damage_to.map(t => t.name),
        
        // What this type is not very effective against  
        notVeryEffectiveAgainst: typeData.damage_relations.half_damage_to.map(t => t.name),
        
        // What this type has no effect against
        noEffectAgainst: typeData.damage_relations.no_damage_to.map(t => t.name),
        
        // What types this type is weak to (takes double damage from)
        weakTo: typeData.damage_relations.double_damage_from.map(t => t.name),
        
        // What types this type resists (takes half damage from)
        resistsFrom: typeData.damage_relations.half_damage_from.map(t => t.name),
        
        // What types this type is immune to (takes no damage from)
        immuneTo: typeData.damage_relations.no_damage_from.map(t => t.name),
      };

      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Write the data to the constants folder
    const outputPath = join(process.cwd(), 'src', 'constants', 'pokemonTypeChart.json');
    await writeFile(outputPath, JSON.stringify(typeChart, null, 2));

    console.log('✅ Type effectiveness data saved to src/constants/pokemonTypeChart.json');
    console.log(`📈 Generated data for ${Object.keys(typeChart).length} types`);
    
    // Log some sample data
    console.log('\n🔍 Sample data preview:');
    console.log('Fire type data:', JSON.stringify(typeChart.fire, null, 2));
    
  } catch (error) {
    console.error('❌ Error fetching type data:', error);
    process.exit(1);
  }
}

/**
 * Validate the generated type chart data
 */
async function validateTypeChart() {
  console.log('\n🔍 Validating type chart data...');
  
  try {
    const { getTypeEffectiveness, getSuperEffectiveAgainst } = await import('../src/constants/typeUtils');
    
    // Test some known interactions
    const fireVsGrass = getTypeEffectiveness('fire', 'grass');
    const waterVsFire = getTypeEffectiveness('water', 'fire');
    const electricVsGround = getTypeEffectiveness('electric', 'ground');
    
    console.log('🧪 Testing known type interactions:');
    console.log(`  Fire vs Grass: ${fireVsGrass.description} (${fireVsGrass.multiplier}x)`);
    console.log(`  Water vs Fire: ${waterVsFire.description} (${waterVsFire.multiplier}x)`);
    console.log(`  Electric vs Ground: ${electricVsGround.description} (${electricVsGround.multiplier}x)`);
    
    // Test utility function
    const superEffectiveAgainstFire = getSuperEffectiveAgainst('fire');
    console.log(`  Types super effective vs Fire: ${superEffectiveAgainstFire.join(', ')}`);
    
    console.log('✅ Validation complete!');
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

// Run the script
if (require.main === module) {
  generateTypeChart()
    .then(() => validateTypeChart())
    .catch(console.error);
}

export { generateTypeChart, validateTypeChart };