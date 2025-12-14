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

// Basic list extracted from megadimension.md
const regularPokemonNames = [
  'Jigglypuff', 'Wigglytuff',
  'Zubat', 'Golbat', 'Crobat',
  'Meowth', 'Persian', 'Perrserker',
  'Mankey', 'Primeape', 'Annihilape',
  'Farfetchd', 'Sirfetchd',
  'Cubone', 'Marowak',
  'Mr. Mime', 'Mr. Rime',
  'Porygon', 'Porygon2', 'Porygon-Z',
  'Qwilfish', 'Overqwil',
  'Treecko', 'Grovyle', 'Sceptile',
  'Torchic', 'Combusken', 'Blaziken',
  'Mudkip', 'Marshtomp', 'Swampert',
  'Gulpin', 'Swalot',
  'Grumpig',
  'Zangoose', 'Seviper',
  'Feebas', 'Milotic',
  'Kecleon',
  'Chingling', 'Chimecho',
  'Kyogre', 'Groudon', 'Rayquaza',
  'Latias', 'Latios',
  'Bonsly', 'Mime Jr.', 'Happiny',
  'Starly', 'Staravia', 'Staraptor',
  'Rotom',
  'Heatran', 'Darkrai',
  'Purrloin', 'Liepard',
  'Throh', 'Sawk',
  'Maractus',
  'Yamask', 'Cofagrigus', 'Runerigus',
  'Trubbish', 'Garbodor',
  'Klink', 'Klang', 'Klinklang',
  'Cryogonal',
  'Golett', 'Golurk',
  'Cobalion', 'Terrakion', 'Virizion', 'Keldeo',
  'Meloetta',
  'Genesect',
  'Crabrawler', 'Crabominable',
  'Wimpod', 'Golisopod',
  'Sandygast', 'Palossand',
  'Mimikyu',
  'Magearna',
  'Marshadow',
  'Zeraora',
  'Meltan', 'Melmetal',
  'Rookidee', 'Corvisquire', 'Corviknight',
  'Toxel', 'Toxtricity',
  'Clobbopus', 'Grapploct',
  'Cursola',
  'Indeedee',
  'Morpeko',
  'Kleavor',
  'Fidough', 'Dachsbun',
  'Squawkabilly',
  'Nacli', 'Naclstack', 'Garganacl',
  'Charcadet', 'Armarouge', 'Ceruledge',
  'Maschiff', 'Mabosstiff',
  'Greavard', 'Houndstone',
  'Flamigo',
  'Capsakid', 'Scovillain',
  'Tinkatink', 'Tinkatuff', 'Tinkaton',
  'Cyclizar',
  'Glimmet', 'Glimmora',
  'Cetoddle', 'Cetitan',
  'Tatsugiri',
  'Dondozo',
  'Frigibax', 'Arctibax', 'Baxcalibur',
  'Gimmighoul', 'Gholdengo',
];

// Mega forms with their specified types from the markdown
const megaFormsData = [
  { name: 'Mega Raichu X', id: 26, type1: 'Electric', type2: undefined },
  { name: 'Mega Raichu Y', id: 26, type1: 'Electric', type2: undefined },
  { name: 'Mega Clefable', id: 36, type1: 'Fairy', type2: 'Flying' },
  { name: 'Mega Victreebel', id: 71, type1: 'Grass', type2: 'Poison' },
  { name: 'Mega Starmie', id: 121, type1: 'Water', type2: 'Psychic' },
  { name: 'Mega Dragonite', id: 149, type1: 'Dragon', type2: 'Flying' },
  { name: 'Mega Meganium', id: 154, type1: 'Grass', type2: 'Fairy' },
  { name: 'Mega Feraligatr', id: 160, type1: 'Water', type2: 'Dragon' },
  { name: 'Mega Skarmory', id: 227, type1: 'Steel', type2: 'Flying' },
  { name: 'Mega Sceptile', id: 254, type1: 'Grass', type2: 'Dragon' },
  { name: 'Mega Blaziken', id: 257, type1: 'Fire', type2: 'Fighting' },
  { name: 'Mega Swampert', id: 260, type1: 'Water', type2: 'Ground' },
  { name: 'Mega Chimecho', id: 358, type1: 'Psychic', type2: 'Steel' },
  { name: 'Mega Absol Z', id: 359, type1: 'Dark', type2: undefined },
  { name: 'Mega Latias', id: 380, type1: 'Dragon', type2: 'Psychic' },
  { name: 'Mega Latios', id: 381, type1: 'Dragon', type2: 'Psychic' },
  { name: 'Primal Kyogre', id: 382, type1: 'Water', type2: undefined },
  { name: 'Primal Groudon', id: 383, type1: 'Ground', type2: 'Fire' },
  { name: 'Mega Rayquaza', id: 384, type1: 'Dragon', type2: 'Flying' },
  { name: 'Mega Staraptor', id: 398, type1: 'Normal', type2: 'Flying' },
  { name: 'Mega Garchomp Z', id: 445, type1: 'Dragon', type2: 'Ground' },
  { name: 'Mega Lucario Z', id: 448, type1: 'Fighting', type2: 'Steel' },
  { name: 'Mega Froslass', id: 478, type1: 'Ice', type2: 'Ghost' },
  { name: 'Mega Heatran', id: 485, type1: 'Fire', type2: 'Steel' },
  { name: 'Mega Darkrai', id: 491, type1: 'Dark', type2: undefined },
  { name: 'Mega Emboar', id: 500, type1: 'Fire', type2: 'Fighting' },
  { name: 'Mega Excadrill', id: 530, type1: 'Ground', type2: 'Steel' },
  { name: 'Mega Scolipede', id: 545, type1: 'Bug', type2: 'Poison' },
  { name: 'Mega Scrafty', id: 560, type1: 'Dark', type2: 'Fighting' },
  { name: 'Mega Eelektross', id: 604, type1: 'Electric', type2: undefined },
  { name: 'Mega Chandelure', id: 609, type1: 'Ghost', type2: 'Fire' },
  { name: 'Mega Golurk', id: 623, type1: 'Ground', type2: 'Ghost' },
  { name: 'Mega Chesnaught', id: 652, type1: 'Grass', type2: 'Fighting' },
  { name: 'Mega Delphox', id: 655, type1: 'Fire', type2: 'Psychic' },
  { name: 'Mega Greninja', id: 658, type1: 'Water', type2: 'Dark' },
  { name: 'Mega Pyroar', id: 668, type1: 'Fire', type2: 'Normal' },
  { name: 'Mega Meowstic', id: 678, type1: 'Psychic', type2: undefined },
  { name: 'Mega Malamar', id: 687, type1: 'Dark', type2: 'Psychic' },
  { name: 'Mega Barbaracle', id: 689, type1: 'Rock', type2: 'Fighting' },
  { name: 'Mega Dragalge', id: 691, type1: 'Poison', type2: 'Dragon' },
  { name: 'Mega Hawlucha', id: 701, type1: 'Fighting', type2: 'Flying' },
  { name: 'Mega Zygarde', id: 718, type1: 'Dragon', type2: 'Ground' },
  { name: 'Mega Crabominable', id: 740, type1: 'Fighting', type2: 'Ice' },
  { name: 'Mega Golisopod', id: 768, type1: 'Bug', type2: 'Water' },
  { name: 'Mega Drampa', id: 780, type1: 'Normal', type2: 'Dragon' },
  { name: 'Mega Magearna', id: 801, type1: 'Steel', type2: 'Fairy' },
  { name: 'Mega Zeraora', id: 807, type1: 'Electric', type2: undefined },
  { name: 'Mega Falinks', id: 870, type1: 'Fighting', type2: 'Steel' },
  { name: 'Mega Scovillain', id: 952, type1: 'Grass', type2: 'Fire' },
  { name: 'Mega Glimmora', id: 970, type1: 'Rock', type2: 'Poison' },
  { name: 'Mega Tatsugiri', id: 978, type1: 'Dragon', type2: 'Water' },
  { name: 'Mega Baxcalibur', id: 998, type1: 'Dragon', type2: 'Ice' },
];

async function fetchPokemonData(pokemonName: string, client: PokemonClient): Promise<Pokemon | undefined> {
  try {
    // Convert name to PokeAPI format
    let apiName = pokemonName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/\./g, '');
    
    // Special cases
    const nameMap: Record<string, string> = {
      'keldeo': 'keldeo-ordinary',
      'meloetta': 'meloetta-aria',
      'mimikyu': 'mimikyu-disguised',
      'toxtricity': 'toxtricity-amped',
      'indeedee': 'indeedee-male',
      'morpeko': 'morpeko-full-belly',
      'squawkabilly': 'squawkabilly-green-plumage',
      'tatsugiri': 'tatsugiri-curly',
    };
    
    if (nameMap[apiName]) {
      apiName = nameMap[apiName];
    }
    
    const pokemon = await client.getPokemonByName(apiName);
    
    // Get ID
    const id = pokemon.id;
    
    // Get types
    const types = pokemon.types
      .sort((a, b) => a.slot - b.slot)
      .map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1));
    
    // Get EV yield
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
    
    // Check if this Pokemon has a mega evolution (existing in main games)
    const hasMega = ['Sceptile', 'Blaziken', 'Swampert', 'Latias', 'Latios', 
                     'Kyogre', 'Groudon', 'Rayquaza'].includes(pokemonName);
    
    return {
      id,
      name: pokemonName,
      type1: types[0],
      type2: types[1],
      hasMega,
      canBeAlpha: !['Kyogre', 'Groudon', 'Rayquaza', 'Latias', 'Latios', 
                    'Heatran', 'Darkrai', 'Cobalion', 'Terrakion', 'Virizion', 
                    'Keldeo', 'Meloetta', 'Genesect', 'Magearna', 'Marshadow', 
                    'Zeraora'].includes(pokemonName),
      evYield: hasEvs ? evYield : undefined
    };
  } catch (error) {
    console.error(`Failed to fetch ${pokemonName}:`, error instanceof Error ? error.message : error);
    return undefined;
  }
}

async function main() {
  console.log('🔍 Fetching Mega Dimension DLC Pokémon data from PokeAPI...\n');
  
  const client = new PokemonClient();
  const regularPokemon: Pokemon[] = [];
  
  // Fetch regular Pokemon
  console.log('=== Regular Pokémon ===\n');
  for (const name of regularPokemonNames) {
    const data = await fetchPokemonData(name, client);
    if (data) {
      regularPokemon.push(data);
      const typeStr = data.type2 ? `${data.type1}/${data.type2}` : data.type1;
      const evStr = data.evYield ? JSON.stringify(data.evYield) : 'No EVs';
      console.log(`✓ ${data.name.padEnd(20)} #${data.id.toString().padStart(3)} → ${typeStr.padEnd(20)} ${evStr}`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Process mega forms (using manual data)
  const megaPokemon: Pokemon[] = megaFormsData.map(m => ({
    id: m.id,
    name: m.name,
    type1: m.type1,
    type2: m.type2,
    hasMega: true,
    canBeAlpha: !['Primal Kyogre', 'Primal Groudon', 'Mega Rayquaza', 'Mega Latias', 'Mega Latios',
                  'Mega Heatran', 'Mega Darkrai', 'Mega Magearna', 'Mega Zeraora', 'Mega Zygarde'].includes(m.name),
    evYield: undefined
  }));
  
  console.log('\n=== Mega Forms ===\n');
  for (const mega of megaPokemon) {
    const typeStr = mega.type2 ? `${mega.type1}/${mega.type2}` : mega.type1;
    console.log(`  ${mega.name.padEnd(25)} #${mega.id.toString().padStart(3)} → ${typeStr}`);
  }
  
  console.log(`\n✓ Processing complete!`);
  console.log(`  Regular Pokémon: ${regularPokemon.length}`);
  console.log(`  Mega Forms: ${megaPokemon.length}`);
  console.log(`  Total: ${regularPokemon.length + megaPokemon.length}`);
  
  // Build TypeScript export arrays for Hyperspace and MegaDex
  const formatPokemon = (p: Pokemon) => {
    const type2Part = p.type2 ? `, type2: "${p.type2}"` : '';
    const evYieldPart = p.evYield 
      ? `, evYield: ${JSON.stringify(p.evYield).replace(/"(\w+)":/g, '$1:')}`
      : '';
    
    return `  { id: ${p.id}, name: "${p.name}", type1: "${p.type1}"${type2Part}, hasMega: ${p.hasMega}, canBeAlpha: ${p.canBeAlpha}${evYieldPart} }`;
  };
  
  // Hyperspace (formerly megaDimensionDex) - write to HyperspaceDex.ts
  const hyperspaceDexPath = path.join(__dirname, '../data/Pokemon/LegendsZA/HyperspaceDex.ts');
  const hyperspaceContent = `import type { Pokemon } from '@/data/Pokemon/LegendsZA/LumioseDex';\n\nexport const hyperspaceDex: Pokemon[] = [\n${regularPokemon.map(formatPokemon).join(',\n')}\n];\n`;
  fs.writeFileSync(hyperspaceDexPath, hyperspaceContent, 'utf-8');
  console.log('✅ HyperspaceDex.ts written successfully!');

  // Mega forms - write to MegaDex.ts
  const megaDexPath = path.join(__dirname, '../data/Pokemon/MegaDex.ts');
  const megaDexContent = `import type { Pokemon } from '@/data/Pokemon/LegendsZA/LumioseDex';\n\nexport const megaDex: Pokemon[] = [\n${megaPokemon.map(formatPokemon).join(',\n')}\n];\n`;
  fs.writeFileSync(megaDexPath, megaDexContent, 'utf-8');
  console.log('✅ MegaDex.ts written successfully!');
  
  console.log('\n📊 Files written:');
  console.log(`  - ${hyperspaceDexPath}`);
  console.log(`  - ${megaDexPath}`);
}

main().catch(console.error);
