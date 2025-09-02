import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { BuildVariant } from '@/types/builds';
import { theme } from '@/constants/style/theme';
import ErrorMessage from './Error';

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
  const [imageError, setImageError] = useState<string | null>(null);

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
        setImageError(null);
      })
      .catch((err) => {
        setPokeImage(null);
        setImageError('Failed to load Pokémon image.');
      });
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
          primaryColor: theme.colors.light.red,
          backgroundColor: theme.colors.light.lightRed,
        };
      case 'special-attacker':
        return {
          title: 'Special Attacker',
          icon: '✨',
          primaryColor: theme.colors.light.purple,
          backgroundColor: theme.colors.light.purpleBackground,
        };
      case 'physical-wall':
        return {
          title: 'Physical Wall',
          icon: '🛡️',
          primaryColor: theme.colors.light.blue,
          backgroundColor: theme.colors.light.blueBackground
        };
      case 'special-wall':
        return {
          title: 'Special Wall',
          icon: '🌟',
          primaryColor: theme.colors.light.green,
          backgroundColor: theme.colors.light.greenBackground
        };
      default:
        return {
          title: 'Build',
          icon: '📋',
          primaryColor: theme.colors.light.primary,
          backgroundColor: theme.colors.light.background
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
      {imageError && (
        <ErrorMessage
          title="Image Load Error"
          description={`Could not load image for ${pokemonName}.`}
          error={imageError}
        />
      )}
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
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.sm,
    marginHorizontal: 0,
    ...theme.shadows.small,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
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
    padding: theme.spacing.md,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  headerIcon: {
    ...theme.typography.subheader,
    marginRight: theme.spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  pokemonName: {
    ...theme.typography.header,
    color: theme.colors.light.white,
    marginBottom: 0,
  },
  buildType: {
    ...theme.typography.copy,
    color: theme.colors.light.white,
    opacity: 0.9,
  },
  content: {
    padding: theme.spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statLabel: {
    ...theme.typography.copyBold,
    marginRight: theme.spacing.sm,
    color: theme.colors.light.brown,
  },
  statValue: {
    ...theme.typography.copy,
    color: theme.colors.light.text,
    marginRight: theme.spacing.md,
  },
  evIvLabel: {
    ...theme.typography.copyBold,
    marginRight: theme.spacing.xs,
    color: theme.colors.light.primary,
  },
  evIvValue: {
    ...theme.typography.copy,
    color: theme.colors.light.primary,
    marginRight: theme.spacing.sm,
  },
  movesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  moveName: {
    ...theme.typography.copy,
    color: theme.colors.light.accent,
    backgroundColor: theme.colors.light.background,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  roleText: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  notesText: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
});
