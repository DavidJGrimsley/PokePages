import React from 'react';
import { Container } from 'components/UI/Container';
import { TypeEffectivenessCalculator } from '@/src/components/Resources/TypeCalculator';
import { TypeHeader } from '@/src/components/Type/TypeHeader';
import { Text } from 'react-native';

export default function TypeCalculator() {
  return (
      <Container>
        <TypeHeader />
        <Text>Calculator</Text>
        <TypeEffectivenessCalculator showSpecialTypes={false} />
      </Container>
  );
}

