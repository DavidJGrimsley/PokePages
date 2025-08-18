import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../constants/style/theme';

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  colorScheme?: 'light' | 'dark';
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Coming Soon",
  subtitle = "We're working hard to bring you something amazing! Stay tuned for updates.",
  icon = "🚧",
  colorScheme = 'light'
}) => {
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>{subtitle}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
            Development in progress...
          </Text>
        </View>
        
        <View style={styles.featuresList}>
          <Text style={[styles.featuresTitle, isDark && styles.featuresTitleDark]}>
            What&apos;s Coming:
          </Text>
          <Text style={[styles.featureItem, isDark && styles.featureItemDark]}>
            • Enhanced user experience
          </Text>
          <Text style={[styles.featureItem, isDark && styles.featureItemDark]}>
            • New features and functionality
          </Text>
          <Text style={[styles.featureItem, isDark && styles.featureItemDark]}>
            • Improved performance
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  containerDark: {
    backgroundColor: theme.colors.dark.background,
  },
  content: {
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
  },
  icon: {
    fontSize: theme.fontSizes.display,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.header,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  titleDark: {
    color: theme.colors.dark.text,
  },
  subtitle: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xxl,
  },
  subtitleDark: {
    color: theme.colors.dark.text,
  },
  progressContainer: {
    width: '100%',
    marginBottom: theme.spacing.xxl,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.light.secondary,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    width: '35%',
    backgroundColor: theme.colors.light.accent,
    borderRadius: theme.borderRadius.sm,
  },
  progressText: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    textAlign: 'center',
  },
  progressTextDark: {
    color: theme.colors.dark.text,
  },
  featuresList: {
    width: '100%',
    backgroundColor: theme.colors.light.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
    ...theme.shadows.small,
  },
  featuresTitle: {
    ...theme.typography.subheader,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  featuresTitleDark: {
    color: theme.colors.dark.text,
  },
  featureItem: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  featureItemDark: {
    color: theme.colors.dark.text,
  },
});
