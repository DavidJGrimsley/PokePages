import { StatusBar } from 'expo-status-bar';
import { Platform, Text } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuthStore } from '~/store/authStore';
import { ScreenContent } from 'components/UI/ScreenContent';
import EditProfile from 'components/Auth/EditProfile';



export default function EditProfileScreen() {
  const { user, session, isLoggedIn } = useAuthStore();

  // Redirect to sign-in if not logged in
  if (!isLoggedIn || !user || !session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <>
      <ScreenContent path="app/modal.tsx" title="Edit Profile">
        <Text className="text-xl text-center mt-lg">
          Edit your profile information below. Soon we will have more information on your profile such as your gamertag in certain games.
        </Text>
        <EditProfile session={session} />
      </ScreenContent>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
