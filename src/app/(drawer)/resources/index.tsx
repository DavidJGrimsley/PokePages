import React from 'react';
import { Container } from '~/components/Container';
import { ComingSoon } from '~/components/ComingSoon';

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
