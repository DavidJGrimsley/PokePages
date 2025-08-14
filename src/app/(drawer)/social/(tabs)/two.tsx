import { Stack } from 'expo-router';
import { FontShowcase } from '~/components/FontShowcase';

import { Container } from '~/components/Container';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Font Showcase' }} />
      <Container>
        <FontShowcase />
      </Container>
    </>
  );
}
