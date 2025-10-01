import React from 'react';
import { Container } from 'components/UI/Container';
import { TypeEffectivenessCalculator } from 'components/Resources/TypeCalculator';
import { TypeAnalysis } from '@/src/components/Resources/TypeAnalysis';

export default function TypeCalculator() {
  return (
    <Container>
      <TypeEffectivenessCalculator showSpecialTypes={false} />
    </Container>
  );
}
