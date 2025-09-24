import React from 'react';
import { View, Text } from 'react-native';
import { BuildVariant } from '~/types/builds';
import { Build } from 'components/Build';
import { cn } from '~/utils/cn';

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
    <View className="mt-lg mb-xxl mx-auto max-w-[1000px] w-[90%] self-center">
      <Text className="typography-subheader text-4xl text-center mb-lg text-app-text">
        Best <Text className="text-app-red">Attacker</Text>
        {' & '}
        <Text className="text-app-accent">Defender</Text>
        {bossPokemonName ? ' Tera Raid Builds for ' : ' Tera Raid Builds'}
        {bossPokemonName}
      </Text>
      <Text className="typography-copy text-center text-app-brown">
        {bossPokemonName 
          ? `Here are the best Tera Raid counters and optimal builds for defeating ${bossPokemonName} in Pokémon Scarlet & Violet. These strategies include both offensive attackers and defensive tanks to help you succeed in 5-star Tera Raid battles.`
          : 'Here are the best counters for most Tera Raid bosses! These strategies include both offensive attackers and defensive tanks to help you succeed in 5-star Tera Raid battles.'
        }
      </Text>

      {attackerBuilds.length > 0 && (
        <View>
          <Text className="typography-header mb-md mt-md text-left text-app-red">
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
          <Text className="typography-header mb-md mt-md text-left text-app-accent">
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

      <View className="h-0.5 bg-app-secondary my-md w-3/5 self-center rounded-sm" />
    </View>
  );
};


