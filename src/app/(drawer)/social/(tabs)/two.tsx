import { Stack } from 'expo-router';
import { FontShowcase } from 'components/Meta/FontShowcase';

import { Container } from 'components/UI/Container';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Font Showcase' }} />
      <Container>
        <FontShowcase />
        {/* <DigitalClock /> */}
      </Container>
    </>
  );
}
