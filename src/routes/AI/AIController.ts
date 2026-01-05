import { Request, Response } from 'express';
import path from 'path';
import { PokemonClient } from 'pokenode-ts';
import OpenAI from 'openai';
import type { Pokemon } from '../../../data/Pokemon/NationalDex.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MCP Server URL - defaults to production
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://davidjgrimsley.com/mcp/mrdj-pokemon-mcp';

/**
 * Fetch a strategy guide from the MCP server
 * @param guideId - The guide ID (e.g., 'tera-raid', 'general')
 * @returns The guide content
 */
const fetchGuideFromMCP = async (guideId: string): Promise<string | null> => {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'get_strategy',
          arguments: { guideId }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`MCP server returned ${response.status}`);
    }

    const data = await response.json();
    
    // Extract text from MCP response format
    if (data.result?.content?.[0]?.text) {
      return data.result.content[0].text;
    }
    
    throw new Error('Invalid MCP response format');
  } catch (error) {
    console.error(`Error fetching guide ${guideId} from MCP:`, error);
    return null;
  }
};

/**
 * Fetch multiple strategy guides from MCP server
 * @param guideIds - Array of guide IDs to fetch
 * @returns Combined guide content
 */
const fetchMultipleGuides = async (guideIds: string[]): Promise<string> => {
  const guides = await Promise.all(
    guideIds.map(id => fetchGuideFromMCP(id))
  );
  
  return guides
    .filter(guide => guide !== null)
    .join('\n\n---\n\n');
};

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
    // Load National Dex and fetch strategies from MCP server
    const pokemonList = await loadNationalDex();
    let customStrategies = '';
    
    try {
      // Fetch both tera-raid and general guides for comprehensive context
      customStrategies = await fetchMultipleGuides(['tera-raid', 'general']);
      if (!customStrategies) {
        customStrategies = 'Strategy guides temporarily unavailable.';
      }
    } catch (error) {
      console.error('Error fetching strategies from MCP:', error);
      customStrategies = 'Strategy guides temporarily unavailable.';
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
    
    // Handle specific OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      let errorMessage = 'AI service error';
      let statusCode = 500;
      
      switch (error.status) {
        case 401:
          errorMessage = 'AI service authentication failed. Please contact support.';
          statusCode = 502; // Bad Gateway - external service issue
          break;
        case 429:
          if (error.message.toLowerCase().includes('quota') || 
              error.message.toLowerCase().includes('insufficient') ||
              error.message.toLowerCase().includes('credits')) {
            errorMessage = 'AI service has insufficient credits. Please try again later or contact support.';
          } else {
            errorMessage = 'AI service is currently busy. Please try again in a moment.';
          }
          statusCode = 503; // Service Unavailable
          break;
        case 400:
          errorMessage = 'Invalid request to AI service. Please try rephrasing your message.';
          statusCode = 400;
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'AI service is temporarily unavailable. Please try again later.';
          statusCode = 503;
          break;
        default:
          errorMessage = `AI service error: ${error.message}`;
          statusCode = 502;
      }
      
      return res.status(statusCode).json({
        success: false,
        error: errorMessage,
        errorType: 'ai_service_error'
      });
    }
    
    // Handle network/connection errors
    if (error instanceof Error && (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('network') ||
      error.message.includes('connection')
    )) {
      return res.status(503).json({
        success: false,
        error: 'Unable to connect to AI service. Please check your internet connection and try again.',
        errorType: 'network_error'
      });
    }
    
    // Generic error fallback
    res.status(500).json({ 
      success: false,
      error: 'An unexpected error occurred while processing your request. Please try again.',
      errorType: 'unknown_error'
    });
  }
}