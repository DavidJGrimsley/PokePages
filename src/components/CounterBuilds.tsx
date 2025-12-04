import React from 'react';
import { View, Text } from 'react-native';
import { Build } from 'components/Build';
import { buildsConfig } from '~/constants/buildsConfig';
import type { Build as BuildType } from '../types/builds';

interface CounterBuildsProps {
  pokemonName?: string;
  attackerBuilds?: BuildType[];
  defenderBuilds?: BuildType[];
  colorScheme?: 'light' | 'dark';
}

export const CounterBuilds: React.FC<CounterBuildsProps> = ({
  pokemonName,
  attackerBuilds: propAttackerBuilds,
  defenderBuilds: propDefenderBuilds,
  colorScheme = 'light'
}) => {
  // Support two usage patterns:
  // 1. Pass pokemonName - looks up builds from config (for event pages)
  // 2. Pass attackerBuilds/defenderBuilds directly (for top-50 page)
  
  let attackerBuilds = propAttackerBuilds;
  let defenderBuilds = propDefenderBuilds;
  let displayName = pokemonName || 'Pokémon';

  // If no builds provided directly, look them up from config
  if (!attackerBuilds && !defenderBuilds && pokemonName) {
    // Convert pokemon name to kebab-case for config lookup
    // Remove 'Shiny' prefix if present since configs use base pokemon names
    const configKey = pokemonName.toLowerCase().replace(/^shiny\s+/, '').replace(/\s+/g, '-');
    const buildsData = buildsConfig[configKey];

    if (buildsData) {
      attackerBuilds = buildsData.attackers;
      defenderBuilds = buildsData.defenders;
    }
  }

  // Return null if no builds available from either source
  if ((!attackerBuilds || attackerBuilds.length === 0) && (!defenderBuilds || defenderBuilds.length === 0)) {
    return null;
  }

  return (
    <View className="mt-lg mb-xxl mx-auto max-w-[1000px] w-[90%] self-center">
      <Text className="typography-subheader text-4xl text-center mb-lg text-app-text dark:text-dark-app-text">
        Best <Text className="text-app-red dark:text-red-400">Attacker</Text>
        {' & '}
        <Text className="text-app-accent dark:text-app-accent">Defender</Text>
        {' Tera Raid Builds for '}
        {displayName}
      </Text>
      <Text className="typography-copy text-center text-app-brown dark:text-gray-400">
        Here are the best Tera Raid counters and optimal builds for defeating {displayName} in Pokémon Scarlet & Violet. These strategies include both offensive attackers and defensive tanks to help you succeed in 5-star Tera Raid battles.
      </Text>

      {attackerBuilds && attackerBuilds.length > 0 && (
        <View>
          <Text className="typography-header mb-md mt-md text-left text-app-red dark:text-red-400">
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

      {defenderBuilds && defenderBuilds.length > 0 && (
        <View>
          <Text className="typography-header mb-md mt-md text-left text-app-accent dark:text-app-accent">
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

      <View className="h-0.5 bg-app-secondary dark:bg-gray-700 my-md w-3/5 self-center rounded-sm" />
    </View>
  );
};


