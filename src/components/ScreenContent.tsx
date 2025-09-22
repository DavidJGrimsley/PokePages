import { StyleSheet, View, ScrollView } from 'react-native';

import { theme } from '@/constants/style/theme';
import { PrettyText } from '~/components/PrettyText';



 
type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <PrettyText text={title} />
      <View style={styles.separator} />
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.light.background,
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  separator: {
    backgroundColor: theme.colors.light.secondary,
    height: 1,
    marginVertical: theme.spacing.lg,
    width: '80%',
  },
  title: {
    ...theme.typography.header,
    color: theme.colors.light.text,
  },
});
