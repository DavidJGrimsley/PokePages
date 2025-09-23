import { Stack } from 'expo-router';
import { ComingSoon } from 'components/Meta/ComingSoon';

import { Container } from 'components/UI/Container';
import { ScreenContent } from 'components/UI/ScreenContent';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Tab One' }} />
      <Container>
        <ScreenContent path="app/(drawer)/(tabs)/index.tsx" title="Tab One">
          <ComingSoon />
        </ScreenContent>
      </Container>
    </>
  );
}
