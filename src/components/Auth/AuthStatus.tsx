
import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useAuthStore } from '~/store/authStore';
import { useNavigateToSignIn } from '~/hooks/useNavigateToSignIn';




export default function AuthStatus() {
  const { isLoggedIn } = useAuthStore();
  const [visible, setVisible] = useState(true);
  const navigateToSignIn = useNavigateToSignIn();

  if (!visible || isLoggedIn) return null;

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <View 
    className="flex-row items-center  bg-yellow-100 border border-yellow-300 rounded-lg mb-2 w-full"
    >
      <TouchableOpacity
        className="flex-1 mr-2 px-3 py-2 bg-yellow-200 rounded-md items-center"
        onPress={navigateToSignIn}
        accessibilityLabel="Sign In"
      >
        <Text className="text-yellow-900 font-semibold">Sign In to save progress</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="px-3 py-2 rounded-full bg-transparent items-center justify-center"
        onPress={handleClose}
        accessibilityLabel="Close"
      >
        <Text className="text-yellow-900 text-xl font-bold">×</Text>
      </TouchableOpacity>
    </View>
  );
}
