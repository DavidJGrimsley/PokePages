import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { ScreenContent } from '~/components/ScreenContent';

export default function EditProfile() {
  return (
    <>
      <ScreenContent path="app/modal.tsx" title="Edit Profile"></ScreenContent>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
