# Mega Evolution Type Analyzer Feature

## Overview
This feature adds support for Mega Evolution forms in the Pokémon Type Analyzer, allowing users to search for and analyze the type effectiveness of Mega-evolved Pokémon with their modified type combinations.

## What Was Implemented

### 1. Lumiose Mega Dex (`data/Pokemon/LumioseDex.ts`)
Created a comprehensive `lumioseMegaDex` array containing all Mega Evolution forms with their updated type combinations:

#### Key Type Changes:
- **Mega Barbaracle**: Rock/Water → **Rock/Fighting** (as requested in the example)
- **Mega Ampharos**: Electric → **Electric/Dragon**
- **Mega Gyarados**: Water/Flying → **Water/Dark**
- **Mega Charizard X**: Fire/Flying → **Fire/Dragon**
- **Mega Charizard Y**: Fire/Flying (stays the same, but different stats)
- **Mega Altaria**: Dragon/Flying → **Dragon/Fairy**
- **Mega Pinsir**: Bug → **Bug/Flying**
- **Mega Aggron**: Steel/Rock → **Steel** (loses Rock type)
- **Mega Lopunny**: Normal → **Normal/Fighting**
- **Mega Audino**: Normal → **Normal/Fairy**
- And many more...

### 2. Helper Functions
Added several utility functions to work with Mega Evolutions:

```typescript
// Find all mega forms for a specific Pokémon ID
findMegaPokemonById(id: number): Pokemon[]

// Find a specific mega form by name
findMegaPokemonByName(name: string): Pokemon | undefined

// Check if a Pokémon has mega evolution(s)
hasMegaEvolution(id: number): boolean

// Get all mega forms for a Pokémon
getMegaFormsForPokemon(id: number): Pokemon[]

// Search across both regular and mega forms
searchAllPokemon(query: string): Pokemon[]
```

### 3. Updated Type Analyzer Search
Modified `src/components/Type/PokemonSearch.tsx` to:
- Include mega evolution forms in search results
- Display a purple "M" badge next to Mega Evolution names
- Show the correct types for mega forms (e.g., Mega Barbaracle shows Rock/Fighting)
- Support searching by typing "Mega" + Pokémon name

## How to Use

### In the Type Analyzer:
1. Navigate to Resources → Type → Analyzer
2. In the search bar, type a Pokémon name with "Mega" prefix:
   - "Mega Barbaracle" - will show Rock/Fighting types
   - "Mega Ampharos" - will show Electric/Dragon types
   - "Mega Charizard" - will show both X and Y forms
3. Select the mega form from the dropdown
4. The type analyzer will automatically populate with the mega form's types
5. You can now see type effectiveness for the mega-evolved form

### Visual Indicators:
- Mega Evolution entries have a purple "M" badge
- Type badges show the mega form's actual types
- Multiple mega forms (like Charizard X/Y) appear as separate entries

## Example Use Cases

### Mega Barbaracle
- **Regular Form**: Rock/Water
- **Mega Form**: Rock/Fighting
- Now you can see that Mega Barbaracle gains different type matchups with its Fighting secondary type

### Mega Ampharos
- **Regular Form**: Electric
- **Mega Form**: Electric/Dragon
- Gains Dragon type weaknesses and resistances

### Mega Gyarados
- **Regular Form**: Water/Flying
- **Mega Form**: Water/Dark
- Loses Flying type, gains Dark type

## Technical Details

### Data Structure
Each mega form entry follows the same `Pokemon` interface:
```typescript
{
  id: number;          // Same ID as base form
  name: string;        // "Mega [Name]" or "Mega [Name] X/Y"
  type1: string;       // Primary type (may change)
  type2?: string;      // Secondary type (may change)
  hasMega: boolean;    // Always true for mega forms
  canBeAlpha: boolean; // Inheritance from base form
  evYield?: object;    // EV yields (typically enhanced)
}
```

### Search Implementation
The search now queries two arrays:
1. `nationalDex` - Regular Pokémon forms
2. `lumioseMegaDex` - Mega Evolution forms

Results are combined and limited to 15 entries for performance.

## Future Enhancements
Possible additions:
- Gigantamax forms
- Regional variants with type changes
- Primal Reversions (Kyogre, Groudon)
- Ultra Burst forms
- Tera type analysis

## Files Modified
1. `data/Pokemon/LumioseDex.ts` - Added lumioseMegaDex array and helper functions
2. `src/components/Type/PokemonSearch.tsx` - Updated to include mega forms in search

## Testing
To test the feature:
1. Search for "Mega Barbaracle" in the Type Analyzer
2. Verify it shows Rock/Fighting types (not Rock/Water)
3. Check that the type effectiveness calculations are correct
4. Try other mega forms like "Mega Ampharos" (Electric/Dragon)
5. Verify the purple "M" badge appears for all mega forms
