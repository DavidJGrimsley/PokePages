import { StyleSheet, Text, View, ScrollView } from 'react-native';

import EditScreenInfo from './EditScreenInfo';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  separator: {
    backgroundColor: '#d1d5db',
    height: 1,
    marginVertical: 20,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
