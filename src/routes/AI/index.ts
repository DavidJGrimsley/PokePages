// ...existing code...
import { promises as fs } from 'fs';
import path from 'path';
import { PokemonClient } from 'pokenode-ts';

// ...existing code...

// API route to handle AI questions
app.post('/api/ask-ai', async (req, res) => {
  const { question, pokemonName } = req.body;

  if (!question || !pokemonName) {
    return res.status(400).json({ error: 'Question and pokemonName are required.' });
  }

  try {
    // 1. Retrieve your custom knowledge
    const strategiesPath = path.join(process.cwd(), 'data', 'raid-strategies.md');
    const customStrategies = await fs.readFile(strategiesPath, 'utf-8');

    // 2. Retrieve live data from PokéAPI
    const api = new PokemonClient();
    const pokemonData = await api.getPokemonByName(pokemonName.toLowerCase());
    const pokemonInfo = {
      name: pokemonData.name,
      types: pokemonData.types.map((t) => t.type.name),
      stats: pokemonData.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
      abilities: pokemonData.abilities.map((a) => a.ability.name),
    };

    // 3. Construct the prompt for the AI
    const prompt = `
      You are a Pokémon battle expert for Tera Raids. Using the provided context, answer the user's question.

      --- START OF CONTEXT ---

      ### General Strategies ###
      ${customStrategies}

      ### Data for ${pokemonInfo.name} ###
      - Types: ${pokemonInfo.types.join(', ')}
      - Base Stats: ${pokemonInfo.stats.map((s) => `${s.name}: ${s.value}`).join(', ')}
      - Abilities: ${pokemonInfo.abilities.join(', ')}

      --- END OF CONTEXT ---

      User's Question: "${question}"

      Based on all the context, provide a detailed strategy:
    `;

    // 4. Send to an AI service and get the response (MOCKED)
    // In a real app, you would use the 'openai' or '@google/generative-ai' package here.
    // e.g., const aiResponse = await openai.chat.completions.create({ messages: [{ role: 'user', content: prompt }], model: 'gpt-4o' });
    // const answer = aiResponse.choices[0].message.content;

    const mockedAnswer = `To counter a Tera Fire Charizard, you should exploit its new single weakness to Water, Rock, and Ground types. A great choice is Azumarill with the Huge Power ability. A moveset of Belly Drum and Liquidation can deal massive damage. Remember to be careful of Charizard's potential Solar Beam if the sun is up! Our general strategies note that survival is key, so consider bringing a support Pokémon with Light Screen.`;

    console.log('--- Generated Prompt for AI ---');
    console.log(prompt);
    console.log('--- Mocked AI Response ---');
    console.log(mockedAnswer);

    res.json({ answer: mockedAnswer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process AI request.' });
  }
});

