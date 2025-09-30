import { promises as fs } from 'fs';
import path from 'path';
import { PokemonClient } from 'pokenode-ts';
import OpenAI from 'openai';
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const loadNationalDex = async () => {
    try {
        const { nationalDex } = await import('../../../data/Pokemon/NationalDex');
        return nationalDex;
    }
    catch (error) {
        console.error('Error loading National Dex:', error);
        return [];
    }
};
const findPokemonInMessage = (message, pokemonList) => {
    const normalizedMessage = message.toLowerCase();
    const foundPokemon = pokemonList.filter(pokemon => normalizedMessage.includes(pokemon.name.toLowerCase()));
    return foundPokemon.length > 0 ? foundPokemon[0] : null;
};
export async function chat(req, res) {
    const { messages, pokemonName } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
            success: false,
            error: 'Messages array is required.'
        });
    }
    try {
        const pokemonList = await loadNationalDex();
        const strategiesPath = path.join(process.cwd(), 'data/ML', 'supervision.md');
        let customStrategies = '';
        try {
            customStrategies = await fs.readFile(strategiesPath, 'utf-8');
        }
        catch {
            customStrategies = 'No custom strategies available.';
        }
        const lastMessage = messages[messages.length - 1];
        let pokemonInfo = null;
        let contextualPrompt = '';
        let targetPokemon = null;
        if (pokemonName) {
            targetPokemon = pokemonList.find(p => p && p.name.toLowerCase() === pokemonName.toLowerCase());
        }
        else if (lastMessage && lastMessage.role === 'user') {
            targetPokemon = findPokemonInMessage(lastMessage.content, pokemonList);
        }
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
            }
            catch (pokeError) {
                console.error('Error fetching Pokémon data:', pokeError);
                contextualPrompt = `
You are a Pokémon battle expert. The user mentioned ${targetPokemon.name} (#${targetPokemon.id}, ${targetPokemon.type1}${targetPokemon.type2 ? '/' + targetPokemon.type2 : ''} type). 

STRATEGIES: ${customStrategies}

Provide helpful Pokémon battle advice based on your knowledge.`;
            }
        }
        else {
            contextualPrompt = `
You are a Pokémon battle expert specializing in Tera Raids. Use these strategies to help users:

CUSTOM STRATEGIES:
${customStrategies}

Provide helpful advice about Pokémon battles, team building, and Tera Raid strategies.`;
        }
        const contextualMessages = [
            { role: 'system', content: contextualPrompt },
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
    }
    catch (error) {
        console.error('Error in chat:', error);
        if (error instanceof OpenAI.APIError) {
            let errorMessage = 'AI service error';
            let statusCode = 500;
            switch (error.status) {
                case 401:
                    errorMessage = 'AI service authentication failed. Please contact support.';
                    statusCode = 502;
                    break;
                case 429:
                    if (error.message.toLowerCase().includes('quota') ||
                        error.message.toLowerCase().includes('insufficient') ||
                        error.message.toLowerCase().includes('credits')) {
                        errorMessage = 'AI service has insufficient credits. Please try again later or contact support.';
                    }
                    else {
                        errorMessage = 'AI service is currently busy. Please try again in a moment.';
                    }
                    statusCode = 503;
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
        if (error instanceof Error && (error.message.includes('ECONNREFUSED') ||
            error.message.includes('ETIMEDOUT') ||
            error.message.includes('network') ||
            error.message.includes('connection'))) {
            return res.status(503).json({
                success: false,
                error: 'Unable to connect to AI service. Please check your internet connection and try again.',
                errorType: 'network_error'
            });
        }
        res.status(500).json({
            success: false,
            error: 'An unexpected error occurred while processing your request. Please try again.',
            errorType: 'unknown_error'
        });
    }
}
