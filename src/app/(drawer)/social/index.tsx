import { Link, Stack } from 'expo-router';
import { Text } from 'react-native';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import { Button } from '~/components/Button';

export default function CheckSignin() {
  return (
    <>
      <Stack.Screen options={{ title: 'Tab One' }} />
      <Container>
        <ScreenContent path="app/(drawer)/(tabs)/index.tsx" title="Tab One">
          <Text>In order to use the social features, you need to be signed in. Click the button below to sign in or create an account or hit he PP in the upper left hand corner to get to the rest of the app. The app is better if you sign in though!</Text>
          <Link href="/sign-in" asChild push>
            <Button title="Sign In" />
          </Link>
          <Link href="/createAccount" asChild push>
            <Button title="Create Account" />
          </Link>
        </ScreenContent>
      </Container>
    </>
  );
}
