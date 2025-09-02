import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/style/theme';

export default function EditScreenInfo({ path }: { path: string }) {
  const title = 'Open up the code for this screen:';
  const description =
    'Change any of the text, save the file, and your app will automatically update.';

  return (
    <View style={styles.getStartedContainer}>
      <Text style={styles.getStartedText}>{title}</Text>
      <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
        <Text>{path}</Text>
      </View>
      <Text style={styles.getStartedText}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  codeHighlightContainer: {
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.xxl + theme.spacing.md,
  },
  getStartedText: {
    ...theme.typography.copy,
    : 24,
    textAlign: 'center',
    color: theme.colors.light.text,
  },
  helpContainer: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  helpLink: {
    paddingVertical: theme.spacing.md,
  },
  helpLinkText: {
    textAlign: 'center',
    color: theme.colors.light.primary,
  },
  homeScreenFilename: {
    marginVertical: theme.spacing.sm,
  },
});
