"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = chat;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const pokenode_ts_1 = require("pokenode-ts");
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const loadNationalDex = async () => {
    try {
        const { nationalDex } = await Promise.resolve().then(() => __importStar(require('../../../data/Pokemon/NationalDex')));
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
async function chat(req, res) {
    const { messages, pokemonName } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
            success: false,
            error: 'Messages array is required.'
        });
    }
    try {
        const pokemonList = await loadNationalDex();
        const strategiesPath = path_1.default.join(process.cwd(), 'data/ML', 'supervision.md');
        let customStrategies = '';
        try {
            customStrategies = await fs_1.promises.readFile(strategiesPath, 'utf-8');
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
                const pokemonClient = new pokenode_ts_1.PokemonClient();
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
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'AI chat error'
        });
    }
}
