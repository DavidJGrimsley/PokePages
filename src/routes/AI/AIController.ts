import { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { PokemonClient } from 'pokenode-ts';
import OpenAI from 'openai';
import type { Pokemon } from '../../../data/Pokemon/NationalDex';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load and parse the National Dex data
const loadNationalDex = async (): Promise<Pokemon[]> => {
  try {
    // Import the properly formatted National Dex
    const { nationalDex } = await import('../../../data/Pokemon/NationalDex');
    return nationalDex;
  } catch (error) {
    console.error('Error loading National Dex:', error);
    return [];
  }
};

// Function to find Pokemon names in a message
const findPokemonInMessage = (message: string, pokemonList: Pokemon[]): Pokemon | null => {
  const normalizedMessage = message.toLowerCase();
  const foundPokemon = pokemonList.filter(pokemon => 
    normalizedMessage.includes(pokemon.name.toLowerCase())
  );
  
  // Return the first match for now, could be enhanced to handle multiple
  return foundPokemon.length > 0 ? foundPokemon[0] : null;
};

export async function chat(req: Request, res: Response) {
  const { messages, pokemonName } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ 
      success: false,
      error: 'Messages array is required.' 
    });
  }

  try {
    // Load National Dex and strategies
    const pokemonList = await loadNationalDex();
    const strategiesPath = path.join(process.cwd(), 'data/ML', 'supervision.md');
    let customStrategies = '';
    
    try {
      customStrategies = await fs.readFile(strategiesPath, 'utf-8');
    } catch {
      customStrategies = 'No custom strategies available.';
    }

    // Get the latest user message
    const lastMessage = messages[messages.length - 1];
    let pokemonInfo = null;
    let contextualPrompt = '';

    // Check if a specific Pokémon was provided or can be found in the message
    let targetPokemon = null;
    if (pokemonName) {
      targetPokemon = pokemonList.find(p => 
        p && p.name.toLowerCase() === pokemonName.toLowerCase()
      );
    } else if (lastMessage && lastMessage.role === 'user') {
      targetPokemon = findPokemonInMessage(lastMessage.content, pokemonList);
    }

    // If we found a Pokémon, get detailed info from PokéAPI
    if (targetPokemon) {
      try {
        const pokemonClient = new PokemonClient();
        const pokemonData = await pokemonClient.getPokemonByName(targetPokemon.name.toLowerCase());
        
        pokemonInfo = {
          name: pokemonData.name,
          types: pokemonData.types.map((t) => t.type.name),
          stats: pokemonData.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
          abilities: pokemonData.abilities.map((a) => a.ability.name),
          nationalDexInfo: targetPokemon
        };

        // Build contextual system message
        contextualPrompt = `
You are a Pokémon battle expert specializing in Tera Raids. Use this context to provide helpful answers:

CUSTOM STRATEGIES:
${customStrategies}

POKÉMON DATA for ${pokemonInfo.name}:
- National Dex #${targetPokemon.id}
- Types: ${pokemonInfo.types.join(', ')}
- Base Stats: ${pokemonInfo.stats.map((s) => `${s.name}: ${s.value}`).join(', ')}
- Abilities: ${pokemonInfo.abilities.join(', ')}

Provide specific, actionable advice based on this Pokémon's data and general Tera Raid strategies.`;

      } catch (pokeError) {
        console.error('Error fetching Pokémon data:', pokeError);
        contextualPrompt = `
You are a Pokémon battle expert. The user mentioned ${targetPokemon.name} (#${targetPokemon.id}, ${targetPokemon.type1}${targetPokemon.type2 ? '/' + targetPokemon.type2 : ''} type). 

STRATEGIES: ${customStrategies}

Provide helpful Pokémon battle advice based on your knowledge.`;
      }
    } else {
      // No specific Pokémon found, use general context
      contextualPrompt = `
You are a Pokémon battle expert specializing in Tera Raids. Use these strategies to help users:

CUSTOM STRATEGIES:
${customStrategies}

Provide helpful advice about Pokémon battles, team building, and Tera Raid strategies.`;
    }

    // Prepare messages with system context
    const contextualMessages = [
      { role: 'system' as const, content: contextualPrompt },
      ...messages
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: contextualMessages,
      max_tokens: 400,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    
    res.json({ 
      success: true,
      data: { 
        reply: reply || 'No response from AI',
        detectedPokemon: targetPokemon,
        pokemonInfo: pokemonInfo
      }
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'AI chat error' 
    });
  }
}