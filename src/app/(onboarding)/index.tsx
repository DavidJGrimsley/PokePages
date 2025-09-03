
import { Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button } from "~/components/Button";
import { PrettyText } from '@/src/components/PrettyText';
import Theme, { typography, shadows, lineHeights } from '@/constants/style/theme';
const { colors, fontSizes, spacing } = Theme;

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  
  return (
  <View style={styles.container}>
      <Stack.Screen options={{ title: '' }} />
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        {/* <Image 
          source={require('@/assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        
        /> */}
        <Text style={styles.title}>Welcome to</Text>
        <PrettyText text="Poké Pages" />
        <Text style={styles.subtitle}>
          Your ultimate (unofficial) Pokémon companion
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>⚔️</Text>
            <Text style={styles.featureText}>Counter Builds & Strategies</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>📊</Text>
            <Text style={styles.featureText}>Community Event Counters</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🎯</Text>
            <Text style={styles.featureText}>Raid Resources & Guides</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>👥</Text>
            <Text style={styles.featureText}>Connect with Trainers</Text>
          </View>
        </View>
        
        <Text style={styles.description}>
          Join thousands of trainers tracking legendary events, sharing strategies, 
          and building the ultimate raid teams. Let&apos;s catch &apos;em all together!
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Get Started" 
          onPress={() => {
            router.push('/agreements');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
    ...shadows.large,
  },
  title: {
    ...typography.header,
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.subheader,
    color: colors.light.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: lineHeights.subheader,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  featureEmoji: {
    fontSize: fontSizes.header,
    marginRight: spacing.md,
    width: 32,
    textAlign: 'center',
  },
  featureText: {
    ...typography.copyBold,
    color: colors.light.primary,
    flex: 1,
  },
  description: {
    ...typography.copy,
    color: colors.light.text,
    textAlign: 'center',
    lineHeight: lineHeights.copy,
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
