import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { useAuthStore } from '~/utils/authStore';
import { ScreenContent } from '~/components/ScreenContent';
import Account from '../components/Account';

export default function EditProfile() {
  const { user, session, isLoggedIn } = useAuthStore();

  return (
    <>
      <ScreenContent path="app/modal.tsx" title="Edit Profile">
        {isLoggedIn && user && session && <Account session={session} />}
      </ScreenContent>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
