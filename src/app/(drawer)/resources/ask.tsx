import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import AskSimple from 'components/AI/askSimple';
import { theme } from 'constants/style/theme';

export default function Ask() {
  return (
    <>
      <Stack.Screen options={{ title: 'Ask AI' }} />
      <View style={{ flex: 1, backgroundColor: theme.colors.light.white }}>
        <AskSimple />
      </View>
    </>
  );
}
