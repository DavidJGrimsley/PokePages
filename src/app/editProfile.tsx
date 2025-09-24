import { StatusBar } from 'expo-status-bar';
import { Platform, Text } from 'react-native';

import { useAuthStore } from '~/store/authStore';
import { ScreenContent } from 'components/UI/ScreenContent';
import Account from 'components/Auth/Account';

export default function EditProfile() {
  const { user, session, isLoggedIn } = useAuthStore();




  return (
    <>
      <ScreenContent path="app/modal.tsx" title="Edit Profile">
        <Text className="text-xl text-center mt-lg">
          Edit your profile information below. Soon we will have more information on your profile such as your gamertag in certain games.
        </Text>
        {isLoggedIn && user && session && <Account session={session} />}
      </ScreenContent>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
