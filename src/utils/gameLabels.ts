export const getGameLabel = (game: string, isAbbreviated: boolean = true): string => {
  switch (game) {
    case 'scarlet-violet':
      return isAbbreviated ? 'SV' : 'Pokémon Scarlet & Violet';
    case 'legends-za':
      return isAbbreviated ? 'Z-A' : 'Pokémon Legends: Z-A';
    case 'go':
      return isAbbreviated ? 'GO' : 'Pokémon GO';
    case 'unite':
      return isAbbreviated ? 'UNITE' : 'Pokémon UNITE';
    case 'masters':
      return isAbbreviated ? 'MASTERS' : 'Pokémon Masters EX';
    case 'all':
      return isAbbreviated ? 'ALL' : 'All Games';
    default:
      return game.toUpperCase();
  }
};
