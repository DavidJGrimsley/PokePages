import { Stack } from 'expo-router';
import { ComingSoon } from '~/components/ComingSoon';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Tab Two' }} />
      <Container>
        <ScreenContent path="app/(drawer)/(tabs)/two.tsx" title="Tab Two">
          <ComingSoon />
        </ScreenContent>
      </Container>
    </>
  );
}
