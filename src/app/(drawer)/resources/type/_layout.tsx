import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="calculator" />
      <Stack.Screen name="analyzer" />
    </Stack>
  );
}
