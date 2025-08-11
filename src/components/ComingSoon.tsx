import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  content: {
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  titleDark: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  subtitleDark: {
    color: '#b0b0b0',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    width: '35%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  progressTextDark: {
    color: '#b0b0b0',
  },
  featuresList: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  featuresTitleDark: {
    color: '#ffffff',
  },
  featureItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
  featureItemDark: {
    color: '#d0d0d0',
  },
});
