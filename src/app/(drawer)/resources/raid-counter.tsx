import React, { useLayoutEffect } from 'react';
import { Container } from 'components/UI/Container';
import { ComingSoon } from 'components/Meta/ComingSoon';

export default function RaidCounter() {


  return (
    <Container>
      <ComingSoon 
        title="Raid Boss Counter"
        subtitle="Select a raid boss and their Tera type to get optimal counter strategies with recommended builds and movesets!"
        icon="⚔️"
        colorScheme="light"
      />
    </Container>
  );
}
