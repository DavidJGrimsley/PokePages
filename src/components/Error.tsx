import React from 'react';
import { View, Text, StyleSheet, Dimensions, Linking, Pressable } from 'react-native';
import { theme } from '../../constants/style/theme';

interface ErrorProps {
  title: string;
  description?: string;
  error?: string;
}

const ErrorComponent: React.FC<ErrorProps> = ({
  title,
  description,
  error,
}) => {
  // Get screen dimensions for responsive styling
  const screenWidth = Dimensions.get('window').width;
  const getBackgroundOpacity = () => {
    return screenWidth < 768 ? 0.45 : 0.65; // 45% on phone, 65% on tablet/desktop
  };

  const handleEmailPress = () => {
    const emailSubject = encodeURIComponent('PokePages App Error Report');
    const emailBody = encodeURIComponent(
      `Hi,\n\nI encountered an error in the PokePages app.\n\nError Details:\nTitle: ${title}\n${description ? `Description: ${description}\n` : ''}${error ? `Technical Error: ${error}\n` : ''}\n\nPlease include a screenshot of the error if possible.\n\nThanks!`
    );
    const mailtoUrl = `mailto:support@pokepages.app?subject=${emailSubject}&body=${emailBody}`;
    
    Linking.openURL(mailtoUrl).catch((err) => {
      console.error('Failed to open email app:', err);
    });
  };

  return (
    <View style={styles.container}> 
      <View style={styles.header}> 
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <View style={styles.content}>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
        <Text style={styles.sorry}>
          I&apos;m sorry you&apos;ve encountered an error in the app. Email me at{' '}
          <Pressable onPress={handleEmailPress}>
            <Text style={styles.emailLink}>support@pokepages.app</Text>
          </Pressable>
          {' '}to get help. Include a screenshot of the error message please.
        </Text>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorSubheading}>Technical error message: </Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.light.red,
    borderRadius: theme.borderRadius.md,
  },
  headerText: {
    ...theme.typography.header,
    color: theme.colors.light.white,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  sorry: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  emailLink: {
    ...theme.typography.copyBold,
    color: theme.colors.light.primary,
    textDecorationLine: 'underline',
  },
  errorContainer: {
    backgroundColor: theme.colors.light.background,
    borderColor: theme.colors.light.red,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  errorSubheading: {
    ...theme.typography.copyBold,
    color: theme.colors.light.red,
    marginBottom: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.mono,
    color: theme.colors.light.red,
    lineHeight: 16,
  },
});

export default ErrorComponent;
