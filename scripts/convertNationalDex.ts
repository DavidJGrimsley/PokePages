import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface Pokemon {
  id: number;
  name: string;
  type1: string;
  type2?: string;
}

async function convertNationalDex() {
  try {
    // Read the original file
    const filePath = join(process.cwd(), 'data/Pokemon/NationalDex.ts');
    const content = await readFile(filePath, 'utf-8');
    
    // Extract only the tab-delimited data lines (skip the TypeScript parts)
    const lines = content.split('\n');
    const dataLines = lines.filter(line => {
      const trimmed = line.trim();
      // Look for lines that start with a number followed by tab
      return /^\d+\t/.test(trimmed);
    });
    
    console.log(`Found ${dataLines.length} Pokémon entries to convert`);
    
    // Convert each line to Pokemon object
    const pokemon: Pokemon[] = dataLines.map(line => {
      const parts = line.split('\t');
      const id = parseInt(parts[0]);
      const name = parts[1];
      const type1 = parts[2];
      const type2 = parts[3]?.trim();
      
      return {
        id,
        name,
        type1,
        ...(type2 && type2 !== '' ? { type2 } : {})
      };
    });
    
    // Generate the new TypeScript file content
    const newContent = `export interface Pokemon {
  id: number;
  name: string;
  type1: string;
  type2?: string;
}

export const nationalDex: Pokemon[] = [
${pokemon.map(p => {
  const type2Part = p.type2 ? `, type2: "${p.type2}"` : '';
  return `  { id: ${p.id}, name: "${p.name}", type1: "${p.type1}"${type2Part} },`;
}).join('\n')}
];

// Helper functions for easier searching
export const findPokemonById = (id: number): Pokemon | undefined => {
  return nationalDex.find(pokemon => pokemon.id === id);
};

export const findPokemonByName = (name: string): Pokemon | undefined => {
  return nationalDex.find(pokemon => 
    pokemon.name.toLowerCase() === name.toLowerCase()
  );
};

export const findPokemonByType = (type: string): Pokemon[] => {
  return nationalDex.filter(pokemon => 
    pokemon.type1.toLowerCase() === type.toLowerCase() ||
    pokemon.type2?.toLowerCase() === type.toLowerCase()
  );
};

export const searchPokemon = (query: string): Pokemon[] => {
  const lowerQuery = query.toLowerCase();
  return nationalDex.filter(pokemon =>
    pokemon.name.toLowerCase().includes(lowerQuery) ||
    pokemon.type1.toLowerCase().includes(lowerQuery) ||
    pokemon.type2?.toLowerCase().includes(lowerQuery)
  );
};
`;

    // Write the new file
    await writeFile(filePath, newContent, 'utf-8');
    console.log(`✅ Successfully converted ${pokemon.length} Pokémon to TypeScript format!`);
    console.log(`📁 Updated: ${filePath}`);
    
    // Show a sample
    console.log('\n📋 Sample entries:');
    pokemon.slice(0, 5).forEach(p => {
      console.log(`  ${p.id}: ${p.name} (${p.type1}${p.type2 ? `/${p.type2}` : ''})`);
    });
    
  } catch (error) {
    console.error('❌ Error converting file:', error);
  }
}

// Run the conversion
convertNationalDex();