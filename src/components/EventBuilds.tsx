import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BuildVariant } from '../types/builds';
import { Build } from './Build';

interface EventBuildData {
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

interface EventBuildsProps {
  eventPokemonName: string;
  attackerBuilds?: EventBuildData[];
  defenderBuilds?: EventBuildData[];
  colorScheme?: 'light' | 'dark';
}

export const EventBuilds: React.FC<EventBuildsProps> = ({
  eventPokemonName,
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
        {' Tera Raid Builds for '}
        Shiny {eventPokemonName}
      </Text>
      <Text style={styles.buildsCaption}>
        Here are the best Tera Raid counters and optimal builds for defeating Shiny {eventPokemonName} in Pokémon Scarlet & Violet. These strategies include both offensive attackers and defensive tanks to help you succeed in 5-star Tera Raid battles.
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
    marginTop: 24,
    marginBottom: 32,
    marginHorizontal: 'auto',
    maxWidth: 800,
    width: '90%',
    alignSelf: 'center',
  },
  buildsTitle: {
    fontSize: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  buildsCaption: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  attacker: {
    color: '#d84315',
  },
  defender: {
    color: '#19d285ff',
  },
  subSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 16,
    textAlign: 'left',
  },
  separator: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
    width: '60%',
    alignSelf: 'center',
    borderRadius: 1,
  },
});
