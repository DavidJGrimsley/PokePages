import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../constants/style/theme';

export const FontShowcase: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Showcase</Text>
        
        {/* Display Font */}
        <View style={styles.fontSection}>
          <Text style={styles.fontLabel}>Display Font (Modak)</Text>
          <Text style={styles.displayFont}>Poké Pages</Text>
        </View>

        {/* Call to Action Font */}
        <View style={styles.fontSection}>
          <Text style={styles.fontLabel}>Call to Action (Press Start 2P)</Text>
          <Text style={styles.ctaFont}>LEVEL UP!</Text>
        </View>

        {/* Header Font */}
        <View style={styles.fontSection}>
          <Text style={styles.fontLabel}>Header Font (Roboto Slab)</Text>
          <Text style={styles.headerFont}>Latest Pokemon Events</Text>
        </View>

        {/* Subheader Font */}
        <View style={styles.fontSection}>
          <Text style={styles.fontLabel}>Subheader (Roboto Condensed)</Text>
          <Text style={styles.subheaderFont}>Community Challenge Progress</Text>
        </View>

        {/* Copy Font */}
        <View style={styles.fontSection}>
          <Text style={styles.fontLabel}>Body Copy (Roboto)</Text>
          <Text style={styles.copyFont}>
            Join trainers worldwide in defeating legendary Pokemon to unlock special Mystery Gift rewards. 
            Track your progress and contribute to the global counter!
          </Text>
        </View>

        {/* Copy Bold */}
        <View style={styles.fontSection}>
          <Text style={styles.fontLabel}>Body Copy Bold (Roboto Bold)</Text>
          <Text style={styles.copyBoldFont}>
            Important announcements and highlighted information use this bold variant for emphasis.
          </Text>
        </View>

        {/* Mono Font */}
        <View style={styles.fontSection}>
          <Text style={styles.fontLabel}>Monospace (Roboto Mono)</Text>
          <Text style={styles.monoFont}>
            player_id_12345{'\n'}
            event_counter: 421{'\n'}
            last_updated: 2025-08-13T05:30:38.290Z
          </Text>
        </View>

        {/* Typography Combinations */}
        <View style={styles.fontSection}>
          <Text style={styles.fontLabel}>Typography in Action</Text>
          <View style={styles.combinationCard}>
            <Text style={styles.cardTitle}>Shiny Chien-Pao Event</Text>
            <Text style={styles.cardSubtitle}>Global Community Challenge</Text>
            <Text style={styles.cardBody}>
              Defeat the legendary Ice/Dark-type Pokemon to help the community reach 
              the goal of 100,000 victories and unlock Mystery Gift rewards for everyone!
            </Text>
            <View style={styles.cardButton}>
              <Text style={styles.cardButtonText}>CONTRIBUTE NOW</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.header,
    color: theme.colors.light.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  fontSection: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.light.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  fontLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.light.brown,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  displayFont: {
    ...theme.typography.display,
    color: theme.colors.light.primary,
    textAlign: 'center',
  },
  ctaFont: {
    ...theme.typography.callToAction,
    color: theme.colors.light.red,
    textAlign: 'center',
    backgroundColor: theme.colors.light.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  headerFont: {
    ...theme.typography.header,
    color: theme.colors.light.text,
  },
  subheaderFont: {
    ...theme.typography.subheader,
    color: theme.colors.light.secondary,
  },
  copyFont: {
    ...theme.typography.copy,
    color: theme.colors.light.text,
  },
  copyBoldFont: {
    ...theme.typography.copyBold,
    color: theme.colors.light.text,
  },
  monoFont: {
    ...theme.typography.mono,
    color: theme.colors.light.brown,
    backgroundColor: theme.colors.light.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
  },
  combinationCard: {
    backgroundColor: theme.colors.light.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.light.red,
    ...theme.shadows.medium,
  },
  cardTitle: {
    ...theme.typography.header,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.sm,
  },
  cardSubtitle: {
    ...theme.typography.subheader,
    color: theme.colors.light.secondary,
    marginBottom: theme.spacing.md,
  },
  cardBody: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    marginBottom: theme.spacing.lg,
  },
  cardButton: {
    backgroundColor: theme.colors.light.red,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  cardButtonText: {
    ...theme.typography.callToAction,
    color: theme.colors.light.white,
  },
});
