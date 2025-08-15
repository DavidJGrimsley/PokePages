import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/style/theme';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: theme.spacing.lg,
  },
});
