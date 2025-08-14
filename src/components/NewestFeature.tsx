import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { theme } from '../../constants/style/theme';

interface NewestFeatureProps {
  title: string;
  description: string;
  path: string;
}

export const NewestFeature: React.FC<NewestFeatureProps> = ({
  title,
  description,
  path,
}) => {
  return (
    <Link href={path as any} asChild>
      <Pressable style={styles.container}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NEW</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.light.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    backgroundColor: theme.colors.light.red,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 1,
  },
  badgeText: {
    color: theme.colors.light.white,
    ...theme.typography.callToAction,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  title: {
    ...theme.typography.subheader,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.sm,
  },
  description: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    lineHeight: 20,
  },
  arrow: {
    backgroundColor: theme.colors.light.accent,
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: theme.colors.light.white,
    ...theme.typography.subheader,
  },
});
