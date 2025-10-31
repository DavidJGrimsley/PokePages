import { Stack } from 'expo-router';

export default function TypeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="analyzer"
    >
      <Stack.Screen name="analyzer" />
      <Stack.Screen name="info" />
    </Stack>
  );
}
