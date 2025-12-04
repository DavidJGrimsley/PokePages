export interface Pokemon {
  id: number;
  name: string;
  type1: string;
  type2?: string;
  hasMega: boolean;
  canBeAlpha: boolean;
  evYield?: {
    hp?: number;
    attack?: number;
    defense?: number;
    specialAttack?: number;
    specialDefense?: number;
    speed?: number;
  };
}

export const lumioseDex: Pokemon[] = [
  { id: 1, name: "Chikorita", type1: "Grass", hasMega: false, canBeAlpha: true, evYield: {specialDefense:1} },
  { id: 2, name: "Bayleef", type1: "Grass", hasMega: false, canBeAlpha: true, evYield: {defense:1,specialDefense:1} },
  { id: 3, name: "Meganium", type1: "Grass", hasMega: true, canBeAlpha: true, evYield: {defense:1,specialDefense:2} },
  { id: 4, name: "Tepig", type1: "Fire", hasMega: false, canBeAlpha: true, evYield: {hp:1} },
  { id: 5, name: "Pignite", type1: "Fire", type2: "Fighting", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 6, name: "Emboar", type1: "Fire", type2: "Fighting", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 7, name: "Totodile", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 8, name: "Croconaw", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {attack:1,defense:1} },
  { id: 9, name: "Feraligatr", type1: "Water", hasMega: true, canBeAlpha: true, evYield: {attack:2,defense:1} },
  { id: 10, name: "Fletchling", type1: "Normal", type2: "Flying", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 11, name: "Fletchinder", type1: "Fire", type2: "Flying", hasMega: false, canBeAlpha: true, evYield: {speed:2} },
  { id: 12, name: "Talonflame", type1: "Fire", type2: "Flying", hasMega: false, canBeAlpha: true, evYield: {speed:3} },
  { id: 13, name: "Bunnelby", type1: "Normal", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 14, name: "Diggersby", type1: "Normal", type2: "Ground", hasMega: false, canBeAlpha: true, evYield: {hp:2} },
  { id: 15, name: "Scatterbug", type1: "Bug", hasMega: false, canBeAlpha: true, evYield: {defense:1} },
  { id: 16, name: "Spewpa", type1: "Bug", hasMega: false, canBeAlpha: true, evYield: {defense:2} },
  { id: 17, name: "Vivillon", type1: "Bug", type2: "Flying", hasMega: false, canBeAlpha: true, evYield: {hp:1,specialAttack:1,speed:1} },
  { id: 18, name: "Weedle", type1: "Bug", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 19, name: "Kakuna", type1: "Bug", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {defense:2} },
  { id: 20, name: "Beedrill", type1: "Bug", type2: "Poison", hasMega: true, canBeAlpha: true, evYield: {attack:2,specialDefense:1} },
  { id: 21, name: "Pidgey", type1: "Normal", type2: "Flying", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 22, name: "Pidgeotto", type1: "Normal", type2: "Flying", hasMega: false, canBeAlpha: true, evYield: {speed:2} },
  { id: 23, name: "Pidgeot", type1: "Normal", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {speed:3} },
  { id: 24, name: "Mareep", type1: "Electric", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 25, name: "Flaaffy", type1: "Electric", hasMega: false, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 26, name: "Ampharos", type1: "Electric", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 27, name: "Patrat", type1: "Normal", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 28, name: "Watchog", type1: "Normal", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 29, name: "Budew", type1: "Grass", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 30, name: "Roselia", type1: "Grass", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 31, name: "Roserade", type1: "Grass", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 32, name: "Magikarp", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 33, name: "Gyarados", type1: "Water", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {attack:2} },
  { id: 34, name: "Binacle", type1: "Rock", type2: "Water", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 35, name: "Barbaracle", type1: "Rock", type2: "Water", hasMega: true, canBeAlpha: true, evYield: {attack:2} },
  { id: 36, name: "Staryu", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 37, name: "Starmie", type1: "Water", type2: "Psychic", hasMega: true, canBeAlpha: true, evYield: {speed:2} },
  { id: 38, name: "Flabébé", type1: "Fairy", hasMega: false, canBeAlpha: true ,evYield: {specialDefense:1} },
  { id: 39, name: "Floette", type1: "Fairy", hasMega: false, canBeAlpha: true, evYield: {specialDefense:2} },
  { id: 40, name: "Florges", type1: "Fairy", hasMega: false, canBeAlpha: true, evYield: {specialDefense:3} },
  { id: 41, name: "Skiddo", type1: "Grass", hasMega: false, canBeAlpha: true, evYield: {hp:1} },
  { id: 42, name: "Gogoat", type1: "Grass", hasMega: false, canBeAlpha: true, evYield: {hp:2} },
  { id: 43, name: "Espurr", type1: "Psychic", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 44, name: "Meowstic", type1: "Psychic", hasMega: false, canBeAlpha: true },
  { id: 45, name: "Litleo", type1: "Fire", type2: "Normal", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 46, name: "Pyroar", type1: "Fire", type2: "Normal", hasMega: true, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 47, name: "Pancham", type1: "Fighting", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 48, name: "Pangoro", type1: "Fighting", type2: "Dark", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 49, name: "Trubbish", type1: "Poison", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 50, name: "Garbodor", type1: "Poison", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 51, name: "Dedenne", type1: "Electric", type2: "Fairy", hasMega: false, canBeAlpha: true, evYield: {speed:2} },
  { id: 52, name: "Pichu", type1: "Electric", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 53, name: "Pikachu", type1: "Electric", hasMega: false, canBeAlpha: true, evYield: {speed:2} },
  { id: 54, name: "Raichu", type1: "Electric", hasMega: false, canBeAlpha: true, evYield: {speed:3} },
  { id: 55, name: "Cleffa", type1: "Fairy", hasMega: false, canBeAlpha: true, evYield: {specialDefense:1} },
  { id: 56, name: "Clefairy", type1: "Fairy", hasMega: false, canBeAlpha: true, evYield: {hp:2} },
  { id: 57, name: "Clefable", type1: "Fairy", hasMega: true, canBeAlpha: true, evYield: {hp:3} },
  { id: 58, name: "Spinarak", type1: "Bug", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 59, name: "Ariados", type1: "Bug", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 60, name: "Ekans", type1: "Poison", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 61, name: "Arbok", type1: "Poison", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 62, name: "Abra", type1: "Psychic", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 63, name: "Kadabra", type1: "Psychic", hasMega: false, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 64, name: "Alakazam", type1: "Psychic", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 65, name: "Gastly", type1: "Ghost", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 66, name: "Haunter", type1: "Ghost", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 67, name: "Gengar", type1: "Ghost", type2: "Poison", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 68, name: "Venipede", type1: "Bug", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {defense:1} },
  { id: 69, name: "Whirlipede", type1: "Bug", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {defense:2} },
  { id: 70, name: "Scolipede", type1: "Bug", type2: "Poison", hasMega: true, canBeAlpha: true, evYield: {speed:3} },
  { id: 71, name: "Honedge", type1: "Steel", type2: "Ghost", hasMega: false, canBeAlpha: true, evYield: {defense:1} },
  { id: 72, name: "Doublade", type1: "Steel", type2: "Ghost", hasMega: false, canBeAlpha: true, evYield: {defense:2} },
  { id: 73, name: "Aegislash", type1: "Steel", type2: "Ghost", hasMega: false, canBeAlpha: true },
  { id: 74, name: "Bellsprout", type1: "Grass", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 75, name: "Weepinbell", type1: "Grass", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 76, name: "Victreebel", type1: "Grass", type2: "Poison", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 77, name: "Pansage", type1: "Grass", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 78, name: "Simisage", type1: "Grass", hasMega: false, canBeAlpha: true, evYield: {speed:2} },
  { id: 79, name: "Pansear", type1: "Fire", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 80, name: "Simisear", type1: "Fire", hasMega: false, canBeAlpha: true, evYield: {speed:2} },
  { id: 81, name: "Panpour", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 82, name: "Simipour", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {speed:2} },
  { id: 83, name: "Meditite", type1: "Fighting", type2: "Psychic", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 84, name: "Medicham", type1: "Fighting", type2: "Psychic", hasMega: true, canBeAlpha: true, evYield: {speed:2} },
  { id: 85, name: "Electrike", type1: "Electric", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 86, name: "Manectric", type1: "Electric", hasMega: true, canBeAlpha: true, evYield: {speed:2} },
  { id: 87, name: "Ralts", type1: "Psychic", type2: "Fairy", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 88, name: "Kirlia", type1: "Psychic", type2: "Fairy", hasMega: false, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 89, name: "Gardevoir", type1: "Psychic", type2: "Fairy", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 90, name: "Gallade", type1: "Psychic", type2: "Fighting", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 91, name: "Houndour", type1: "Dark", type2: "Fire", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 92, name: "Houndoom", type1: "Dark", type2: "Fire", hasMega: true, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 93, name: "Swablu", type1: "Normal", type2: "Flying", hasMega: false, canBeAlpha: true, evYield: {specialDefense:1} },
  { id: 94, name: "Altaria", type1: "Dragon", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {specialDefense:2} },
  { id: 95, name: "Audino", type1: "Normal", hasMega: true, canBeAlpha: true, evYield: {hp:2} },
  { id: 96, name: "Spritzee", type1: "Fairy", hasMega: false, canBeAlpha: true, evYield: {hp:1} },
  { id: 97, name: "Aromatisse", type1: "Fairy", hasMega: false, canBeAlpha: true, evYield: {hp:2} },
  { id: 98, name: "Swirlix", type1: "Fairy", hasMega: false, canBeAlpha: true, evYield: {defense:1} },
  { id: 99, name: "Slurpuff", type1: "Fairy", hasMega: false, canBeAlpha: true, evYield: {defense:2} },
  { id: 100, name: "Eevee", type1: "Normal", hasMega: false, canBeAlpha: true, evYield: {specialDefense:1} },
  { id: 101, name: "Vaporeon", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {hp:2} },
  { id: 102, name: "Jolteon", type1: "Electric", hasMega: false, canBeAlpha: true, evYield: {speed:2} },
  { id: 103, name: "Flareon", type1: "Fire", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 104, name: "Espeon", type1: "Psychic", hasMega: false, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 105, name: "Umbreon", type1: "Dark", hasMega: false, canBeAlpha: true, evYield: {specialDefense:2} },
  { id: 106, name: "Leafeon", type1: "Grass", hasMega: false, canBeAlpha: true, evYield: {defense:2} },
  { id: 107, name: "Glaceon", type1: "Ice", hasMega: false, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 108, name: "Sylveon", type1: "Fairy", hasMega: false, canBeAlpha: true, evYield: {specialDefense:2} },
  { id: 109, name: "Buneary", type1: "Normal", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 110, name: "Lopunny", type1: "Normal", hasMega: true, canBeAlpha: true, evYield: {speed:2} },
  { id: 111, name: "Shuppet", type1: "Ghost", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 112, name: "Banette", type1: "Ghost", hasMega: true, canBeAlpha: true, evYield: {attack:2} },
  { id: 113, name: "Vanillite", type1: "Ice", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 114, name: "Vanillish", type1: "Ice", hasMega: false, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 115, name: "Vanilluxe", type1: "Ice", hasMega: false, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 116, name: "Numel", type1: "Fire", type2: "Ground", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 117, name: "Camerupt", type1: "Fire", type2: "Ground", hasMega: true, canBeAlpha: true, evYield: {attack:1,specialAttack:1} },
  { id: 118, name: "Hippopotas", type1: "Ground", hasMega: false, canBeAlpha: true, evYield: {defense:1} },
  { id: 119, name: "Hippowdon", type1: "Ground", hasMega: false, canBeAlpha: true, evYield: {defense:2} },
  { id: 120, name: "Drilbur", type1: "Ground", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 121, name: "Excadrill", type1: "Ground", type2: "Steel", hasMega: true, canBeAlpha: true, evYield: {attack:2} },
  { id: 122, name: "Sandile", type1: "Ground", type2: "Dark", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 123, name: "Krokorok", type1: "Ground", type2: "Dark", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 124, name: "Krookodile", type1: "Ground", type2: "Dark", hasMega: false, canBeAlpha: true, evYield: {attack:3} },
  { id: 125, name: "Machop", type1: "Fighting", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 126, name: "Machoke", type1: "Fighting", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 127, name: "Machamp", type1: "Fighting", hasMega: false, canBeAlpha: true, evYield: {attack:3} },
  { id: 128, name: "Gible", type1: "Dragon", type2: "Ground", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 129, name: "Gabite", type1: "Dragon", type2: "Ground", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 130, name: "Garchomp", type1: "Dragon", type2: "Ground", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 131, name: "Carbink", type1: "Rock", type2: "Fairy", hasMega: false, canBeAlpha: true, evYield: {defense:1,specialDefense:1} },
  { id: 132, name: "Sableye", type1: "Dark", type2: "Ghost", hasMega: true, canBeAlpha: true, evYield: {attack:1,defense:1} },
  { id: 133, name: "Mawile", type1: "Steel", type2: "Fairy", hasMega: true, canBeAlpha: true, evYield: {attack:1,defense:1} },
  { id: 134, name: "Absol", type1: "Dark", hasMega: true, canBeAlpha: true, evYield: {attack:2} },
  { id: 135, name: "Riolu", type1: "Fighting", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 136, name: "Lucario", type1: "Fighting", type2: "Steel", hasMega: true, canBeAlpha: true, evYield: {attack:1,specialAttack:1} },
  { id: 137, name: "Slowpoke", type1: "Water", type2: "Psychic", hasMega: false, canBeAlpha: true, evYield: {hp:1} },
  { id: 138, name: "Slowbro", type1: "Water", type2: "Psychic", hasMega: true, canBeAlpha: true, evYield: {defense:2} },
  { id: 139, name: "Slowking", type1: "Water", type2: "Psychic", hasMega: false, canBeAlpha: true, evYield: {specialDefense:2} },
  { id: 140, name: "Carvanha", type1: "Water", type2: "Dark", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 141, name: "Sharpedo", type1: "Water", type2: "Dark", hasMega: true, canBeAlpha: true, evYield: {attack:2} },
  { id: 142, name: "Tynamo", type1: "Electric", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 143, name: "Eelektrik", type1: "Electric", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 144, name: "Eelektross", type1: "Electric", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 145, name: "Dratini", type1: "Dragon", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 146, name: "Dragonair", type1: "Dragon", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 147, name: "Dragonite", type1: "Dragon", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 148, name: "Bulbasaur", type1: "Grass", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 149, name: "Ivysaur", type1: "Grass", type2: "Poison", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1,specialDefense:1} },
  { id: 150, name: "Venusaur", type1: "Grass", type2: "Poison", hasMega: true, canBeAlpha: true, evYield: {specialAttack:2,specialDefense:1} },
  { id: 151, name: "Charmander", type1: "Fire", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 152, name: "Charmeleon", type1: "Fire", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1,speed:1} },
  { id: 153, name: "Charizard", type1: "Fire", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 154, name: "Squirtle", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {defense:1} },
  { id: 155, name: "Wartortle", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {defense:1,specialDefense:1} },
  { id: 156, name: "Blastoise", type1: "Water", hasMega: true, canBeAlpha: true, evYield: {specialDefense:3} },
  { id: 157, name: "Stunfisk", type1: "Ground", type2: "Electric", hasMega: false, canBeAlpha: true, evYield: {hp:2} },
  { id: 158, name: "Furfrou", type1: "Normal", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 159, name: "Inkay", type1: "Dark", type2: "Psychic", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 160, name: "Malamar", type1: "Dark", type2: "Psychic", hasMega: true, canBeAlpha: true, evYield: {attack:2} },
  { id: 161, name: "Skrelp", type1: "Poison", type2: "Water", hasMega: false, canBeAlpha: true, evYield: {specialDefense:1} },
  { id: 162, name: "Dragalge", type1: "Poison", type2: "Dragon", hasMega: true, canBeAlpha: true, evYield: {specialDefense:2} },
  { id: 163, name: "Clauncher", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 164, name: "Clawitzer", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 165, name: "Goomy", type1: "Dragon", hasMega: false, canBeAlpha: true, evYield: {specialDefense:1} },
  { id: 166, name: "Sliggoo", type1: "Dragon", hasMega: false, canBeAlpha: true, evYield: {specialDefense:2} },
  { id: 167, name: "Goodra", type1: "Dragon", hasMega: false, canBeAlpha: true, evYield: {specialDefense:3} },
  { id: 168, name: "Delibird", type1: "Ice", type2: "Flying", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 169, name: "Snorunt", type1: "Ice", hasMega: false, canBeAlpha: true, evYield: {hp:1} },
  { id: 170, name: "Glalie", type1: "Ice", hasMega: true, canBeAlpha: true, evYield: {hp:2} },
  { id: 171, name: "Froslass", type1: "Ice", type2: "Ghost", hasMega: true, canBeAlpha: true, evYield: {speed:2} },
  { id: 172, name: "Snover", type1: "Grass", type2: "Ice", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 173, name: "Abomasnow", type1: "Grass", type2: "Ice", hasMega: true, canBeAlpha: true, evYield: {attack:1,specialAttack:1} },
  { id: 174, name: "Bergmite", type1: "Ice", hasMega: false, canBeAlpha: true, evYield: {defense:1} },
  { id: 175, name: "Avalugg", type1: "Ice", hasMega: false, canBeAlpha: true, evYield: {defense:2} },
  { id: 176, name: "Scyther", type1: "Bug", type2: "Flying", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 177, name: "Scizor", type1: "Bug", type2: "Steel", hasMega: true, canBeAlpha: true, evYield: {attack:2} },
  { id: 178, name: "Pinsir", type1: "Bug", hasMega: true, canBeAlpha: true, evYield: {attack:2} },
  { id: 179, name: "Heracross", type1: "Bug", type2: "Fighting", hasMega: true, canBeAlpha: true, evYield: {attack:2} },
  { id: 180, name: "Emolga", type1: "Electric", type2: "Flying", hasMega: false, canBeAlpha: true, evYield: {speed:2} },
  { id: 181, name: "Hawlucha", type1: "Fighting", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {attack:2} },
  { id: 182, name: "Phantump", type1: "Ghost", type2: "Grass", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 183, name: "Trevenant", type1: "Ghost", type2: "Grass", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 184, name: "Scraggy", type1: "Dark", type2: "Fighting", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 185, name: "Scrafty", type1: "Dark", type2: "Fighting", hasMega: true, canBeAlpha: true, evYield: {defense:1,specialDefense:1} },
  { id: 186, name: "Noibat", type1: "Flying", type2: "Dragon", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 187, name: "Noivern", type1: "Flying", type2: "Dragon", hasMega: false, canBeAlpha: true, evYield: {speed:2} },
  { id: 188, name: "Klefki", type1: "Steel", type2: "Fairy", hasMega: false, canBeAlpha: true, evYield: {defense:1} },
  { id: 189, name: "Litwick", type1: "Ghost", type2: "Fire", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 190, name: "Lampent", type1: "Ghost", type2: "Fire", hasMega: false, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 191, name: "Chandelure", type1: "Ghost", type2: "Fire", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 192, name: "Aerodactyl", type1: "Rock", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {speed:2} },
  { id: 193, name: "Tyrunt", type1: "Rock", type2: "Dragon", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 194, name: "Tyrantrum", type1: "Rock", type2: "Dragon", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 195, name: "Amaura", type1: "Rock", type2: "Ice", hasMega: false, canBeAlpha: true, evYield: {hp:1} },
  { id: 196, name: "Aurorus", type1: "Rock", type2: "Ice", hasMega: false, canBeAlpha: true, evYield: {hp:2} },
  { id: 197, name: "Onix", type1: "Rock", type2: "Ground", hasMega: false, canBeAlpha: true, evYield: {defense:1} },
  { id: 198, name: "Steelix", type1: "Steel", type2: "Ground", hasMega: true, canBeAlpha: true, evYield: {defense:2} },
  { id: 199, name: "Aron", type1: "Steel", type2: "Rock", hasMega: false, canBeAlpha: true, evYield: {defense:1} },
  { id: 200, name: "Lairon", type1: "Steel", type2: "Rock", hasMega: false, canBeAlpha: true, evYield: {defense:2} },
  { id: 201, name: "Aggron", type1: "Steel", type2: "Rock", hasMega: true, canBeAlpha: true, evYield: {defense:3} },
  { id: 202, name: "Helioptile", type1: "Electric", type2: "Normal", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 203, name: "Heliolisk", type1: "Electric", type2: "Normal", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1,speed:1} },
  { id: 204, name: "Pumpkaboo", type1: "Ghost", type2: "Grass", hasMega: false, canBeAlpha: true, evYield: {defense: 1} },
  { id: 205, name: "Gourgeist", type1: "Ghost", type2: "Grass", hasMega: false, canBeAlpha: true, evYield: {defense: 2} },
  { id: 206, name: "Larvitar", type1: "Rock", type2: "Ground", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 207, name: "Pupitar", type1: "Rock", type2: "Ground", hasMega: false, canBeAlpha: true, evYield: {attack:2} },
  { id: 208, name: "Tyranitar", type1: "Rock", type2: "Dark", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 209, name: "Froakie", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {speed:1} },
  { id: 210, name: "Frogadier", type1: "Water", hasMega: false, canBeAlpha: true, evYield: {speed:2} },
  { id: 211, name: "Greninja", type1: "Water", type2: "Dark", hasMega: true, canBeAlpha: true, evYield: {speed:3} },
  { id: 212, name: "Falinks", type1: "Fighting", hasMega: true, canBeAlpha: true, evYield: {attack:2,specialDefense:1} },
  { id: 213, name: "Chespin", type1: "Grass", hasMega: false, canBeAlpha: true, evYield: {defense:1} },
  { id: 214, name: "Quilladin", type1: "Grass", hasMega: false, canBeAlpha: true, evYield: {defense:2} },
  { id: 215, name: "Chesnaught", type1: "Grass", type2: "Fighting", hasMega: true, canBeAlpha: true, evYield: {defense:3} },
  { id: 216, name: "Skarmory", type1: "Steel", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {defense:2} },
  { id: 217, name: "Fennekin", type1: "Fire", hasMega: false, canBeAlpha: true, evYield: {specialAttack:1} },
  { id: 218, name: "Braixen", type1: "Fire", hasMega: false, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 219, name: "Delphox", type1: "Fire", type2: "Psychic", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 220, name: "Bagon", type1: "Dragon", hasMega: false, canBeAlpha: true, evYield: {attack:1} },
  { id: 221, name: "Shelgon", type1: "Dragon", hasMega: false, canBeAlpha: true, evYield: {defense:2} },
  { id: 222, name: "Salamence", type1: "Dragon", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 223, name: "Kangaskhan", type1: "Normal", hasMega: true, canBeAlpha: true, evYield: {hp:2} },
  { id: 224, name: "Drampa", type1: "Normal", type2: "Dragon", hasMega: true, canBeAlpha: true, evYield: {specialAttack:2} },
  { id: 225, name: "Beldum", type1: "Steel", type2: "Psychic", hasMega: false, canBeAlpha: true, evYield: {defense:1} },
  { id: 226, name: "Metang", type1: "Steel", type2: "Psychic", hasMega: false, canBeAlpha: true, evYield: {defense:2} },
  { id: 227, name: "Metagross", type1: "Steel", type2: "Psychic", hasMega: true, canBeAlpha: true, evYield: {defense:3} },
  { id: 228, name: "Xerneas", type1: "Fairy", hasMega: false, canBeAlpha: false, evYield: {hp:3} },
  { id: 229, name: "Yveltal", type1: "Dark", type2: "Flying", hasMega: false, canBeAlpha: false, evYield: {hp:3} },
  { id: 230, name: "Zygarde", type1: "Dragon", type2: "Ground", hasMega: true, canBeAlpha: false, evYield: {hp:3} },
  { id: 231, name: "Diancie", type1: "Rock", type2: "Fairy", hasMega: true, canBeAlpha: false, evYield: {defense:3} },
  { id: 232, name: "Mewtwo", type1: "Psychic", hasMega: true, canBeAlpha: false, evYield: {specialAttack:3} },
];

export const lumioseMegaDex: Pokemon[] = [
  { id: 3, name: "Mega Meganium", type1: "Grass", type2: "Fairy", hasMega: true, canBeAlpha: true, evYield: {defense:2,specialDefense:2} },
  { id: 6, name: "Mega Emboar", type1: "Fire", type2: "Fighting", hasMega: true, canBeAlpha: true, evYield: {attack:3,specialDefense:1} },
  { id: 9, name: "Mega Feraligatr", type1: "Water", type2: "Dragon", hasMega: true, canBeAlpha: true, evYield: {attack:3,defense:1} },
  { id: 20, name: "Mega Beedrill", type1: "Bug", type2: "Poison", hasMega: true, canBeAlpha: true, evYield: {attack:3,speed:1} },
  { id: 23, name: "Mega Pidgeot", type1: "Normal", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {speed:3} },
  { id: 26, name: "Mega Ampharos", type1: "Electric", type2: "Dragon", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 33, name: "Mega Gyarados", type1: "Water", type2: "Dark", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 35, name: "Mega Barbaracle", type1: "Rock", type2: "Fighting", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 37, name: "Mega Starmie", type1: "Water", type2: "Psychic", hasMega: true, canBeAlpha: true, evYield: {speed:3} },
  { id: 46, name: "Mega Pyroar", type1: "Fire", type2: "Normal", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 57, name: "Mega Clefable", type1: "Fairy", hasMega: true, canBeAlpha: true, evYield: {hp:3} },
  { id: 64, name: "Mega Alakazam", type1: "Psychic", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 67, name: "Mega Gengar", type1: "Ghost", type2: "Poison", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 70, name: "Mega Scolipede", type1: "Bug", type2: "Poison", hasMega: true, canBeAlpha: true, evYield: {attack:2,speed:2} },
  { id: 76, name: "Mega Victreebel", type1: "Grass", type2: "Poison", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 84, name: "Mega Medicham", type1: "Fighting", type2: "Psychic", hasMega: true, canBeAlpha: true, evYield: {speed:3} },
  { id: 86, name: "Mega Manectric", type1: "Electric", hasMega: true, canBeAlpha: true, evYield: {speed:3} },
  { id: 89, name: "Mega Gardevoir", type1: "Psychic", type2: "Fairy", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 90, name: "Mega Gallade", type1: "Psychic", type2: "Fighting", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 92, name: "Mega Houndoom", type1: "Dark", type2: "Fire", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 94, name: "Mega Altaria", type1: "Dragon", type2: "Fairy", hasMega: true, canBeAlpha: true, evYield: {specialDefense:3} },
  { id: 95, name: "Mega Audino", type1: "Normal", type2: "Fairy", hasMega: true, canBeAlpha: true, evYield: {hp:3} },
  { id: 110, name: "Mega Lopunny", type1: "Normal", type2: "Fighting", hasMega: true, canBeAlpha: true, evYield: {speed:3} },
  { id: 112, name: "Mega Banette", type1: "Ghost", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 117, name: "Mega Camerupt", type1: "Fire", type2: "Ground", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 121, name: "Mega Excadrill", type1: "Ground", type2: "Steel", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 130, name: "Mega Garchomp", type1: "Dragon", type2: "Ground", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 132, name: "Mega Sableye", type1: "Dark", type2: "Ghost", hasMega: true, canBeAlpha: true, evYield: {defense:3} },
  { id: 133, name: "Mega Mawile", type1: "Steel", type2: "Fairy", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 134, name: "Mega Absol", type1: "Dark", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 136, name: "Mega Lucario", type1: "Fighting", type2: "Steel", hasMega: true, canBeAlpha: true, evYield: {attack:2,specialAttack:2} },
  { id: 138, name: "Mega Slowbro", type1: "Water", type2: "Psychic", hasMega: true, canBeAlpha: true, evYield: {defense:3} },
  { id: 141, name: "Mega Sharpedo", type1: "Water", type2: "Dark", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 144, name: "Mega Eelektross", type1: "Electric", type2: "Dragon", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 147, name: "Mega Dragonite", type1: "Dragon", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 150, name: "Mega Venusaur", type1: "Grass", type2: "Poison", hasMega: true, canBeAlpha: true, evYield: {specialAttack:2,specialDefense:2} },
  { id: 153, name: "Mega Charizard X", type1: "Fire", type2: "Dragon", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 153, name: "Mega Charizard Y", type1: "Fire", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 156, name: "Mega Blastoise", type1: "Water", hasMega: true, canBeAlpha: true, evYield: {specialDefense:3} },
  { id: 160, name: "Mega Malamar", type1: "Dark", type2: "Psychic", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 162, name: "Mega Dragalge", type1: "Poison", type2: "Dragon", hasMega: true, canBeAlpha: true, evYield: {specialAttack:2,specialDefense:2} },
  { id: 170, name: "Mega Glalie", type1: "Ice", hasMega: true, canBeAlpha: true, evYield: {hp:3} },
  { id: 171, name: "Mega Froslass", type1: "Ice", type2: "Ghost", hasMega: true, canBeAlpha: true, evYield: {speed:3} },
  { id: 173, name: "Mega Abomasnow", type1: "Grass", type2: "Ice", hasMega: true, canBeAlpha: true, evYield: {attack:2,specialAttack:2} },
  { id: 177, name: "Mega Scizor", type1: "Bug", type2: "Steel", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 178, name: "Mega Pinsir", type1: "Bug", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 179, name: "Mega Heracross", type1: "Bug", type2: "Fighting", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 181, name: "Mega Hawlucha", type1: "Fighting", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 185, name: "Mega Scrafty", type1: "Dark", type2: "Fighting", hasMega: true, canBeAlpha: true, evYield: {defense:2,specialDefense:2} },
  { id: 191, name: "Mega Chandelure", type1: "Ghost", type2: "Fire", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 192, name: "Mega Aerodactyl", type1: "Rock", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {speed:3} },
  { id: 198, name: "Mega Steelix", type1: "Steel", type2: "Ground", hasMega: true, canBeAlpha: true, evYield: {defense:3} },
  { id: 201, name: "Mega Aggron", type1: "Steel", hasMega: true, canBeAlpha: true, evYield: {defense:3} },
  { id: 208, name: "Mega Tyranitar", type1: "Rock", type2: "Dark", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 211, name: "Mega Greninja", type1: "Water", type2: "Dark", hasMega: true, canBeAlpha: true, evYield: {speed:3} },
  { id: 212, name: "Mega Falinks", type1: "Fighting", type2: "Steel", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 215, name: "Mega Chesnaught", type1: "Grass", type2: "Fighting", hasMega: true, canBeAlpha: true, evYield: {defense:3} },
  { id: 216, name: "Mega Skarmory", type1: "Steel", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {defense:3} },
  { id: 219, name: "Mega Delphox", type1: "Fire", type2: "Psychic", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 222, name: "Mega Salamence", type1: "Dragon", type2: "Flying", hasMega: true, canBeAlpha: true, evYield: {attack:3} },
  { id: 223, name: "Mega Kangaskhan", type1: "Normal", hasMega: true, canBeAlpha: true, evYield: {hp:3} },
  { id: 224, name: "Mega Drampa", type1: "Normal", type2: "Dragon", hasMega: true, canBeAlpha: true, evYield: {specialAttack:3} },
  { id: 227, name: "Mega Metagross", type1: "Steel", type2: "Psychic", hasMega: true, canBeAlpha: true, evYield: {defense:3} },
  { id: 230, name: "Mega Zygarde", type1: "Dragon", type2: "Ground", hasMega: true, canBeAlpha: false, evYield: {hp:3} },
  { id: 231, name: "Mega Diancie", type1: "Rock", type2: "Fairy", hasMega: true, canBeAlpha: false, evYield: {defense:3} },
  { id: 232, name: "Mega Mewtwo X", type1: "Psychic", type2: "Fighting", hasMega: true, canBeAlpha: false, evYield: {attack:3} },
  { id: 232, name: "Mega Mewtwo Y", type1: "Psychic", hasMega: true, canBeAlpha: false, evYield: {specialAttack:3} },
];


// Helper functions for easier searching
export const findPokemonById = (id: number): Pokemon | undefined => {
  return lumioseDex.find(pokemon => pokemon.id === id);
};

export const findPokemonByName = (name: string): Pokemon | undefined => {
  return lumioseDex.find(pokemon => 
    pokemon.name.toLowerCase() === name.toLowerCase()
  );
};

export const findPokemonByType = (type: string): Pokemon[] => {
  return lumioseDex.filter(pokemon => 
    pokemon.type1.toLowerCase() === type.toLowerCase() ||
    pokemon.type2?.toLowerCase() === type.toLowerCase()
  );
};

export const searchPokemon = (query: string): Pokemon[] => {
  const lowerQuery = query.toLowerCase();
  return lumioseDex.filter(pokemon =>
    pokemon.name.toLowerCase().includes(lowerQuery) ||
    pokemon.type1.toLowerCase().includes(lowerQuery) ||
    pokemon.type2?.toLowerCase().includes(lowerQuery)
  );
};

// Mega Evolution Helper Functions
export const findMegaPokemonById = (id: number): Pokemon[] => {
  return lumioseMegaDex.filter(pokemon => pokemon.id === id);
};

export const findMegaPokemonByName = (name: string): Pokemon | undefined => {
  return lumioseMegaDex.find(pokemon => 
    pokemon.name.toLowerCase() === name.toLowerCase()
  );
};

export const hasMegaEvolution = (id: number): boolean => {
  return lumioseMegaDex.some(pokemon => pokemon.id === id);
};

export const getMegaFormsForPokemon = (id: number): Pokemon[] => {
  return lumioseMegaDex.filter(pokemon => pokemon.id === id);
};

// Combined search including mega evolutions
export const searchAllPokemon = (query: string): Pokemon[] => {
  const lowerQuery = query.toLowerCase();
  const regularResults = lumioseDex.filter(pokemon =>
    pokemon.name.toLowerCase().includes(lowerQuery) ||
    pokemon.type1.toLowerCase().includes(lowerQuery) ||
    pokemon.type2?.toLowerCase().includes(lowerQuery)
  );
  
  const megaResults = lumioseMegaDex.filter(pokemon =>
    pokemon.name.toLowerCase().includes(lowerQuery) ||
    pokemon.type1.toLowerCase().includes(lowerQuery) ||
    pokemon.type2?.toLowerCase().includes(lowerQuery)
  );
  
  return [...regularResults, ...megaResults];
};
