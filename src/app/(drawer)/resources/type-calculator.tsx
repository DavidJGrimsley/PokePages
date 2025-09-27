import React from 'react';
import { Container } from 'components/UI/Container';
import { ComingSoon } from 'components/Meta/ComingSoon';
import TypeChartDisplay from '@/src/components/Pokemon/TypeChartDisplay';


export default function TypeCalculator() {
  return (
    <Container>
      <TypeChartDisplay showSpecialTypes={true} />
    </Container>
  );
}
