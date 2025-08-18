import React from 'react';
import { Stack } from 'expo-router';
import { ScrollView } from 'react-native';
import { teraBuildsTop50 } from '@/constants/teraBuildsTop50Config';
import { CounterBuilds } from '~/components/CounterBuilds';
import { theme } from '@/constants/style/theme';

export default function Top50Builds() {
  return (
    <>
      <Stack.Screen options={{ title: 'Top 50 Builds' }} />
  <ScrollView style={{ flex: 1, backgroundColor: theme.colors.light.background }}>
        {teraBuildsTop50 && (
                  <CounterBuilds
                    attackerBuilds={teraBuildsTop50['Top Tera Raid Pokémon Builds'].attackers}
                    defenderBuilds={teraBuildsTop50['Top Tera Raid Pokémon Builds'].defenders}
                  />
                )}
      </ScrollView>
    </>
  );
}
