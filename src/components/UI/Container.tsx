import { View } from 'react-native';
import AuthStatus from '../Auth/AuthStatus';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return <View className="flex-1 bg-app-background">
          <AuthStatus />
          {children}
        </View>;
};
