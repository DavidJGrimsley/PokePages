import React from 'react';
import { Container } from 'components/UI/Container';
import { ComingSoon } from 'components/Meta/ComingSoon';

export default function TypeCalculator() {
  return (
    <Container>
      <ComingSoon 
        title="Type Calculator"
        subtitle="Calculate type effectiveness, resistances, and weaknesses for any Pokémon matchup. Perfect for competitive battles!"
        icon="🧮"
        colorScheme="light"
      />
    </Container>
  );
}
