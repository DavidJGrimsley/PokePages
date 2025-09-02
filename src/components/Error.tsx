// Component Readme:
// If you have more than one error that can occur on a page, you need 
// you need to use a state variable for each and use an 'or' 
// operator to display the component if either is truthy.
// See usage.

import React from 'react';
import { View, Text, StyleSheet, Dimensions, Linking, Pressable } from 'react-native';
import { theme } from '../../constants/style/theme';

interface ErrorProps {
  title: string;
  description?: string;
  error?: string;
}

export default function ErrorMessage({ title, description, error }: ErrorProps) {

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

  // Use theme flag color and opacity for the background

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
          {' '}to get help. Include a screenshot of the enitre page/screen please.
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.light.white,
    borderWidth: 1,
  },
  header: {
    // alignItems: 'center',
    alignSelf: 'center', // Center the header box
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.light.flag,
    borderRadius: theme.borderRadius.md,
  },
  headerText: {
    ...theme.typography.subheader,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.light.white,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    ...theme.typography.copy,
    color: theme.colors.light.text,
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
  },
  sorry: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    textAlign: 'center',
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
    alignSelf: 'center',
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
  },
});

// export default ErrorComponent;
