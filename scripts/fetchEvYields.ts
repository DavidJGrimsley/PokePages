#!/usr/bin/env tsx
import { PokemonClient } from 'pokenode-ts';
import * as fs from 'fs';
import * as path from 'path';

interface EvYield {
  hp?: number;
  attack?: number;
  defense?: number;
  specialAttack?: number;
  specialDefense?: number;
  speed?: number;
}

interface Pokemon {
  id: number;
  name: string;
  type1: string;
  type2?: string;
  hasMega: boolean;
  canBeAlpha: boolean;
  evYield?: EvYield;
}

const statNameMap: Record<string, keyof EvYield> = {
  'hp': 'hp',
  'attack': 'attack',
  'defense': 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  'speed': 'speed',
};

async function fetchEvYield(pokemonName: string, client: PokemonClient): Promise<EvYield | undefined> {
  try {
    const pokemon = await client.getPokemonByName(pokemonName.toLowerCase());
    const evYield: EvYield = {};
    
    let hasEvs = false;
    for (const stat of pokemon.stats) {
      if (stat.effort > 0) {
        const statKey = statNameMap[stat.stat.name];
        if (statKey) {
          evYield[statKey] = stat.effort;
          hasEvs = true;
        }
      }
    }
    
    return hasEvs ? evYield : undefined;
  } catch (error) {
    console.error(`Failed to fetch ${pokemonName}:`, error);
    return undefined;
  }
}

async function main() {
  const lumioseDexPath = path.join(__dirname, '../data/Pokemon/LumioseDex.ts');
  const fileContent = fs.readFileSync(lumioseDexPath, 'utf-8');
  
  // Extract the nationalDex array content
  const dexMatch = fileContent.match(/export const nationalDex: Pokemon\[\] = \[([\s\S]*?)\];/);
  if (!dexMatch) {
    console.error('Could not find nationalDex array in LumioseDex.ts');
    process.exit(1);
  }
  
  // Parse existing Pokemon entries
  const dexContent = dexMatch[1];
  const pokemonEntries: Pokemon[] = [];
  const entryRegex = /\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*type1:\s*"([^"]+)"(?:,\s*type2:\s*"([^"]+)")?,\s*hasMega:\s*(true|false),\s*canBeAlpha:\s*(true|false)\s*\}/g;
  
  let match;
  while ((match = entryRegex.exec(dexContent)) !== null) {
    pokemonEntries.push({
      id: parseInt(match[1]),
      name: match[2],
      type1: match[3],
      type2: match[4] || undefined,
      hasMega: match[5] === 'true',
      canBeAlpha: match[6] === 'true',
    });
  }
  
  console.log(`Found ${pokemonEntries.length} Pokemon in LumioseDex`);
  console.log('Fetching EV yields from PokeAPI...\n');
  
  const client = new PokemonClient();
  let processed = 0;
  
  for (const pokemon of pokemonEntries) {
    const evYield = await fetchEvYield(pokemon.name, client);
    if (evYield) {
      pokemon.evYield = evYield;
      console.log(`✓ ${pokemon.name.padEnd(20)} → ${JSON.stringify(evYield)}`);
    } else {
      console.log(`  ${pokemon.name.padEnd(20)} → No EV yield`);
    }
    
    processed++;
    
    // Rate limiting: wait 100ms between requests to be respectful to PokeAPI
    if (processed < pokemonEntries.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`\n✓ Processed ${processed} Pokemon`);
  console.log('Updating LumioseDex.ts...\n');
  
  // Update the interface
  const updatedInterface = `export interface Pokemon {
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
}`;
  
  // Generate the updated nationalDex array
  const updatedEntries = pokemonEntries.map(p => {
    const type2Part = p.type2 ? `, type2: "${p.type2}"` : '';
    const evYieldPart = p.evYield 
      ? `, evYield: ${JSON.stringify(p.evYield).replace(/"(\w+)":/g, '$1:')}`
      : '';
    
    return `  { id: ${p.id}, name: "${p.name}", type1: "${p.type1}"${type2Part}, hasMega: ${p.hasMega}, canBeAlpha: ${p.canBeAlpha}${evYieldPart} }`;
  }).join(',\n');
  
  const updatedDexArray = `export const nationalDex: Pokemon[] = [\n${updatedEntries},\n];`;
  
  // Preserve helper functions
  const helperFunctionsMatch = fileContent.match(/(\/\/ Helper functions[\s\S]*$)/);
  const helperFunctions = helperFunctionsMatch ? helperFunctionsMatch[1] : '';
  
  // Write the updated file
  const updatedContent = `${updatedInterface}\n\n${updatedDexArray}\n\n${helperFunctions}`;
  fs.writeFileSync(lumioseDexPath, updatedContent, 'utf-8');
  
  console.log('✓ LumioseDex.ts updated successfully!');
  
  // Calculate size impact
  const oldSize = fileContent.length;
  const newSize = updatedContent.length;
  const increase = newSize - oldSize;
  const increaseKb = (increase / 1024).toFixed(2);
  
  console.log(`\nBundle size impact:`);
  console.log(`  Before: ${(oldSize / 1024).toFixed(2)} KB`);
  console.log(`  After:  ${(newSize / 1024).toFixed(2)} KB`);
  console.log(`  Increase: +${increaseKb} KB (${((increase / oldSize) * 100).toFixed(1)}%)`);
}

main().catch(console.error);
