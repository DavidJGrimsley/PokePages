import React, { useLayoutEffect } from 'react';
import { Container } from 'components/UI/Container';
import { ComingSoon } from 'components/Meta/ComingSoon';

export default function Map() {


  return (
    <Container>
      <ComingSoon 
        title="Map"
        subtitle="See where key things are in the game world!"
        icon="🗺️"
        colorScheme="light"
      />
    </Container>
  );
}
