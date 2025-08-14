import { StyleSheet, SafeAreaView } from 'react-native';
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
