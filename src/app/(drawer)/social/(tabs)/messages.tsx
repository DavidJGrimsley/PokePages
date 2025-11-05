import { Stack } from 'expo-router';
import { ComingSoon } from 'components/Meta/ComingSoon';

import { Container } from 'components/UI/Container';
import { ScreenContent } from 'components/UI/ScreenContent';

export default function MessagesTab() {
  return (
    <>
      <Stack.Screen options={{ title: 'Messages' }} />
      <Container>
        <ScreenContent path="app/(drawer)/social/(tabs)/messages.tsx" title="Messages">
          <ComingSoon />
        </ScreenContent>
      </Container>
    </>
  );
}
