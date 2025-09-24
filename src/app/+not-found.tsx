import { Link, Stack } from 'expo-router';
import { Text } from 'react-native';
import { Container } from 'components/UI/Container';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Container>
        <Text className="text-xl font-bold">{"This screen doesn't exist."}</Text>
        <Link href="/" className="mt-md py-md">
          <Text className="text-sm text-blue-600">Go to home screen!</Text>
        </Link>
      </Container>
    </>
  );
}
