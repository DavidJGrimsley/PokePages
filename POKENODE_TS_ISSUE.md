# Pokenode-ts Missing Property Issue

## Issue Overview

This document tracks an ignored pull request submitted to the pokenode-ts library that fixes a missing TypeScript type definition.

## Original Pull Request

- **Repository**: [Gabb-c/pokenode-ts](https://github.com/Gabb-c/pokenode-ts)
- **PR Number**: [#1321](https://github.com/Gabb-c/pokenode-ts/pull/1321)
- **Status**: Closed (marked as "wontfix")
- **Submitted**: August 18, 2025
- **Closed**: October 25, 2025 (automatically closed by stale bot)

## Problem Description

The `OfficialArtwork` interface in pokenode-ts was missing the `front_shiny` property, which exists in the actual PokéAPI response. This caused TypeScript errors when trying to access the shiny official artwork sprite:

```typescript
// This would show a TypeScript error even though it works at runtime
pokemon.sprites.other?.['official-artwork']?.front_shiny
// Error: Property 'front_shiny' does not exist on type 'OfficialArtwork'
```

## The Fix

The pull request added the missing property to the TypeScript interface:

```typescript
export interface OfficialArtwork {
  /** The default depiction of this Pokémon from the front in battle */
  front_default: string | null;
  /** The shiny depiction of this Pokémon from the front in battle */
  front_shiny: string | null;
}
```

**Files Changed**: `src/models/Pokemon/pokemon.ts`
**Lines Changed**: +2 additions, 0 deletions

## Impact on PokePages

This project (PokePages) uses pokenode-ts as a dependency and may encounter TypeScript errors when accessing the `front_shiny` property on official artwork sprites.

## Workarounds

Until this fix is merged upstream, the following workarounds can be used:

### Option 1: Type Assertion
```typescript
const artwork = pokemon.sprites.other?.['official-artwork'] as any;
const shinySprite = artwork?.front_shiny;
```

### Option 2: Fork and Use Custom Version
Fork the pokenode-ts repository with the fix applied and use it as a dependency:
```json
{
  "dependencies": {
    "pokenode-ts": "github:DavidJGrimsley/pokenode-ts#DJ-pokemon-sprite-update"
  }
}
```

### Option 3: Local Type Augmentation
Create a type declaration file to extend the interface:
```typescript
// types/pokenode-ts.d.ts
declare module 'pokenode-ts' {
  interface OfficialArtwork {
    front_shiny: string | null;
  }
}
```

## PR Review Notes

- ✅ Linting passed
- ✅ Build passed  
- ✅ Tests passed (unrelated test failure existed before changes)
- ✅ Quality gate passed (SonarQube)
- ❌ Marked as "wontfix" and automatically closed after 60 days of inactivity

## Next Steps

1. Monitor the upstream repository for activity
2. Consider submitting a new PR with additional context
3. Implement one of the workarounds mentioned above if needed
4. Document any TypeScript errors encountered in PokePages related to this issue

## References

- [Original PR #1321](https://github.com/Gabb-c/pokenode-ts/pull/1321/commits)
- [PokéAPI Official Documentation](https://pokeapi.co/docs/v2)
- [Pokenode-ts Repository](https://github.com/Gabb-c/pokenode-ts)
- [PokePages.app](https://pokepages.app) - Where this library is used

## Notes

This was my first ever pull request and contribution to open source! While it wasn't merged, the learning experience was valuable. The fix is technically correct and the property does exist in the actual PokéAPI response data.
