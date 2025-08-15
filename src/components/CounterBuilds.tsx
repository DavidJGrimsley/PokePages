import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BuildVariant } from '@/types/builds';
import { Build } from './Build';
import { theme } from '../../constants/style/theme';

interface CounterBuildData {
  pokemonName: string;
  pokemonId: number;
  pokemonVariant?: string;
  variant: BuildVariant;
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
}

interface CounterBuildsProps {
  bossPokemonName?: string;
  attackerBuilds?: CounterBuildData[];
  defenderBuilds?: CounterBuildData[];
  colorScheme?: 'light' | 'dark';
}

export const CounterBuilds: React.FC<CounterBuildsProps> = ({
  bossPokemonName,
  attackerBuilds = [],
  defenderBuilds = [],
  colorScheme = 'light'
}) => {
  if (attackerBuilds.length === 0 && defenderBuilds.length === 0) {
    return null;
  }

  return (
    <View style={styles.buildsSection}>
      <Text style={styles.buildsTitle}>
        Best <Text style={styles.attacker}>Attacker</Text>
        {' & '}
        <Text style={styles.defender}>Defender</Text>
        {bossPokemonName ? ' Tera Raid Builds for ' : ' Tera Raid Builds'}
        {bossPokemonName}
      </Text>
      <Text style={styles.buildsCaption}>
        {bossPokemonName 
          ? `Here are the best Tera Raid counters and optimal builds for defeating ${bossPokemonName} in Pokémon Scarlet & Violet. These strategies include both offensive attackers and defensive tanks to help you succeed in 5-star Tera Raid battles.`
          : 'Here are the best counters for most Tera Raid bosses! These strategies include both offensive attackers and defensive tanks to help you succeed in 5-star Tera Raid battles.'
        }
      </Text>

      {attackerBuilds.length > 0 && (
        <View>
          <Text style={[styles.subSectionTitle, styles.attacker]}>
            Best Attacker Builds & Counters
          </Text>
          {attackerBuilds.map((build, index) => (
            <Build
              key={`attacker-${index}`}
              pokemonName={build.pokemonName}
              pokemonId={build.pokemonId}
              pokemonVariant={build.pokemonVariant}
              variant={build.variant}
              ability={build.ability}
              nature={build.nature}
              evs={build.evs}
              ivs={build.ivs}
              level={build.level}
              heldItem={build.heldItem}
              moves={build.moves}
              teraType={build.teraType}
              role={build.role}
              notes={build.notes}
              colorScheme={colorScheme}
            />
          ))}
        </View>
      )}

      {defenderBuilds.length > 0 && (
        <View>
          <Text style={[styles.subSectionTitle, styles.defender]}>
            Best Defender Builds & Tank Strategies
          </Text>
          {defenderBuilds.map((build, index) => (
            <Build
              key={`defender-${index}`}
              pokemonName={build.pokemonName}
              pokemonId={build.pokemonId}
              pokemonVariant={build.pokemonVariant}
              variant={build.variant}
              ability={build.ability}
              nature={build.nature}
              evs={build.evs}
              ivs={build.ivs}
              level={build.level}
              heldItem={build.heldItem}
              moves={build.moves}
              teraType={build.teraType}
              role={build.role}
              notes={build.notes}
              colorScheme={colorScheme}
            />
          ))}
        </View>
      )}

      <View style={styles.separator} />
    </View>
  );
};

const styles = StyleSheet.create({
  buildsSection: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    marginHorizontal: 'auto',
    maxWidth: 1000,
    width: '90%',
    alignSelf: 'center',
  },
  buildsTitle: {
    ...theme.typography.subheader,
    fontSize: theme.fontSizes.xxxl,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    color: theme.colors.light.text,
  },
  buildsCaption: {
    ...theme.typography.copy,
    textAlign: 'center',
    color: theme.colors.light.brown,
  },
  attacker: {
    color: theme.colors.light.red,
  },
  defender: {
    color: theme.colors.light.accent,
  },
  subSectionTitle: {
    ...theme.typography.header,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
    textAlign: 'left',
  },
  separator: {
    height: 2,
    backgroundColor: theme.colors.light.secondary,
    marginVertical: theme.spacing.md,
    width: '60%',
    alignSelf: 'center',
    borderRadius: theme.borderRadius.sm,
  },
});
