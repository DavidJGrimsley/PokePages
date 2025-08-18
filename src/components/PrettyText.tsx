import React from 'react';
import { theme } from '@/constants/style/theme';
import { Text } from 'react-native';


export function PrettyText({ text }: { text: string }) {
  return <Text style={theme.typography.display}>{text}</Text>;
}


