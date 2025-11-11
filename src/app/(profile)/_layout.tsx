import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="account" />
      <Stack.Screen name="[username]" />
      <Stack.Screen name="preview" />
    </Stack>
  );
}
