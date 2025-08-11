import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { BuildVariant } from '../types/builds';

interface BuildProps {
  pokemonName: string;
  variant: BuildVariant;
  pokemonVariant?: string;
  ability: string;
  nature: string;
  evs: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  ivs?: {
    hp?: number;
    attack?: number;
    defense?: number;
    specialAttack?: number;
    specialDefense?: number;
    speed?: number;
  };
  level?: number;
  heldItem: string;
  moves: string[];
  teraType?: string;
  role: string;
  notes?: string;
  colorScheme?: 'light' | 'dark';
  pokemonId?: number;
}

export const Build: React.FC<BuildProps> = ({
  pokemonName,
  variant,
  pokemonVariant,
  ability,
  nature,
  evs,
  ivs,
  level = 100,
  heldItem,
  moves,
  teraType,
  role,
  notes,
  colorScheme = 'light',
  pokemonId,
}) => {
  const [pokeImage, setPokeImage] = useState<string | null>(null);

  // Get screen dimensions for responsive styling
  const screenWidth = Dimensions.get('window').width;
  const getBackgroundOpacity = () => {
    return screenWidth < 768 ? 0.45 : 0.65; // 45% on phone, 65% on tablet/desktop
  };

  useEffect(() => {
    const sanitizedPokemonVariant = (variant: string) => {
      return variant.replace(/\s+/g, '-').toLowerCase();
    };
    if (!pokemonId) return;
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    .then(res => res.json())
    .then(data => {
        console.log(`Fetching image for: ${pokemonName}${pokemonVariant ? ` (${sanitizedPokemonVariant(pokemonVariant)})` : ''}`);
        const img = data.sprites?.other['official-artwork']?.front_default || data.sprites?.front_default || null;
        setPokeImage(img);
      })
      .catch(() => setPokeImage(null));
  }, [pokemonId]);
  //
  // trying to fetch the image for the Pokémon based on its name and variant.
  // useEffect(() => {
  //   const sanitizedPokemonVariant = (variant: string) => {
  //     return variant.replace(/\s+/g, '-').toLowerCase();
  //   };
  //   if (!pokemonId) return;
  //   fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}${pokemonVariant ? `-${sanitizedPokemonVariant(pokemonVariant)}` : ''}`)
  //   .then(res => res.json())
  //   .then(data => {
  //       console.log(`Fetching image for: ${pokemonName}${pokemonVariant ? ` (${sanitizedPokemonVariant(pokemonVariant)})` : ''}`);
  //       const img = data.sprites?.other['official-artwork']?.front_default || data.sprites?.front_default || null;
  //       setPokeImage(img);
  //     })
  //     .catch(() => setPokeImage(null));
  // }, [pokemonId]);

  const getVariantConfig = () => {
    switch (variant) {
      case 'physical-attacker':
        return {
          title: 'Physical Attacker',
          icon: '⚔️',
          primaryColor: '#e74c3c',
          secondaryColor: '#c0392b',
          backgroundColor: '#fdf2f2'
        };
      case 'special-attacker':
        return {
          title: 'Special Attacker',
          icon: '✨',
          primaryColor: '#9b59b6',
          secondaryColor: '#8e44ad',
          backgroundColor: '#f8f4fd'
        };
      case 'physical-wall':
        return {
          title: 'Physical Wall',
          icon: '🛡️',
          primaryColor: '#3498db',
          secondaryColor: '#2980b9',
          backgroundColor: '#f2f8fd'
        };
      case 'special-wall':
        return {
          title: 'Special Wall',
          icon: '🌟',
          primaryColor: '#2ecc71',
          secondaryColor: '#27ae60',
          backgroundColor: '#f2fdf5'
        };
      default:
        return {
          title: 'Build',
          icon: '📋',
          primaryColor: '#34495e',
          secondaryColor: '#2c3e50',
          backgroundColor: '#f8f9fa'
        };
    }
  };

  const formatEVs = () => {
    const evArray = [];
    if (evs.hp > 0) evArray.push(`${evs.hp} HP`);
    if (evs.attack > 0) evArray.push(`${evs.attack} Atk`);
    if (evs.defense > 0) evArray.push(`${evs.defense} Def`);
    if (evs.specialAttack > 0) evArray.push(`${evs.specialAttack} SpA`);
    if (evs.specialDefense > 0) evArray.push(`${evs.specialDefense} SpD`);
    if (evs.speed > 0) evArray.push(`${evs.speed} Spe`);
    return evArray.join(' / ');
  };

  const formatIVs = () => {
    if (!ivs) return '31/31/31/31/31/31 (Perfect)';
    
    const ivArray = [
      ivs.hp ?? 31,
      ivs.attack ?? 31,
      ivs.defense ?? 31,
      ivs.specialAttack ?? 31,
      ivs.specialDefense ?? 31,
      ivs.speed ?? 31
    ];
    
    const isAllPerfect = ivArray.every(iv => iv === 31);
    if (isAllPerfect) return '31/31/31/31/31/31 (Perfect)';
    
    return `${ivArray.join('/')} (HP/Atk/Def/SpA/SpD/Spe)`;
  };

  const config = getVariantConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}> 
      {pokeImage && (
        <Image
          source={{ uri: pokeImage }}
          style={[styles.bgImage, { opacity: getBackgroundOpacity() }]}
          resizeMode="contain"
          // pointerEvents="none"
        />
      )}
      <View style={[styles.header, { backgroundColor: config.primaryColor }]}> 
        <Text style={styles.headerIcon}>{config.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.pokemonName}>
            {pokemonName}{pokemonVariant ? ` (${pokemonVariant})` : ''}
          </Text>
          <Text style={styles.buildType}>{config.title}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.sectionRow}>
          <Text style={[styles.statLabel, { color: config.primaryColor }]}>Level:</Text>
          <Text style={styles.statValue}>{level}</Text>
        </View>
        {teraType && (
          <View style={styles.sectionRow}>
            <Text style={styles.statLabel}>Tera Type:</Text>
            <Text style={styles.statValue}>{teraType}</Text>
          </View>
        )}
        <View style={styles.sectionRow}>
          <Text style={styles.statLabel}>Ability:</Text>
          <Text style={styles.statValue}>{ability}</Text>
        </View>
        <View style={styles.sectionRow}>
          <Text style={styles.statLabel}>Nature:</Text>
          <Text style={styles.statValue}>{nature}</Text>
        </View>
        <View style={styles.sectionRow}>
          <Text style={styles.statLabel}>Held Item:</Text>
          <Text style={styles.statValue}>{heldItem}</Text>
        </View>
        <View style={styles.sectionRow}>
          <Text style={styles.evIvLabel}>EVs:</Text>
          <Text style={styles.evIvValue}>{formatEVs()}</Text>
        </View>
        <View style={styles.sectionRow}>
          <Text style={styles.evIvLabel}>IVs:</Text>
          <Text style={styles.evIvValue}>{formatIVs()}</Text>
        </View>
        <View style={styles.movesRow}>
          {moves.map((move, idx) => (
            <Text key={idx} style={styles.moveName}>{move}</Text>
          ))}
        </View>
        <Text style={styles.roleText}>{role}</Text>
        {notes && <Text style={styles.notesText}>{notes}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  bgImage: {
    position: 'absolute',
    top: '18%',
    left: '50%',
    width: '70%',
    height: '70%',
    zIndex: 0,
    transform: [{ translateX: -0.5 * 0.7 * 300 }], // 300 is approx card width
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerIcon: {
    fontSize: 26,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 0,
  },
  buildType: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 6,
    color: '#555',
  },
  statValue: {
    fontSize: 15,
    color: '#333',
    marginRight: 12,
  },
  evIvLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
    color: '#1976D2',
  },
  evIvValue: {
    fontSize: 14,
    color: '#1976D2',
    marginRight: 8,
  },
  movesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 4,
    marginBottom: 6,
  },
  moveName: {
    fontSize: 14,
    color: '#4CAF50',
    backgroundColor: '#f1f8e9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 3,
  },
  roleText: {
    fontSize: 14,
    color: '#6d4c41',
    marginTop: 4,
    marginBottom: 2,
    lineHeight: 18,
  },
  notesText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
});
