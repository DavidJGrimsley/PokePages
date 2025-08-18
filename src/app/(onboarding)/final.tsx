import { Link, Stack, router } from 'expo-router';
import { View, Text, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState, useCallback } from 'react';


import { Button } from '~/components/Button';
import { useOnboardingStore } from '~/utils/onboardingStore';
import { PrettyText } from '@/src/components/PrettyText';

export default function OnboardingFinalScreen() {
  const { completeOnboarding, hasCompletedOnboarding } = useOnboardingStore();
  // const [confettiVisible, setConfettiVisible] = useState(false);
  // const [cannonPositions, setCannonPositions] = useState<{ x: number; y: number }[]>([]);
  // const [runId, setRunId] = useState(0); // force remount per run
  // const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exploreBtnRef = useRef<View>(null); // ref to the Start Exploring button



  const handleCompleteOnboarding = useCallback(() => {
    // setConfettiVisible(false);
    console.log('Attempting to complete onboarding');
    console.log('Has completed onboarding: ', hasCompletedOnboarding);
    completeOnboarding();
    console.log('Has completed onboarding: ', hasCompletedOnboarding);
    router.replace('/(drawer)' as any);
    console.log('Onboarding completed, navigating to main app...');
  }, [completeOnboarding, hasCompletedOnboarding]);


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
        <PrettyText text="Poké Pages" />
        <Text style={styles.title}>You&apos;re All Set!</Text>
        
        <Text style={styles.subtitle}>
          Welcome to the PokePages community, trainer!
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🎯</Text>
            <Text style={styles.featureText}>
              <Text style={styles.featureTitle}>Raid Builds</Text>
              {'\n'}Access counter strategies for legendary raids
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>📊</Text>
            <Text style={styles.featureText}>
              <Text style={styles.featureTitle}>Event Counters</Text>
              {'\n'}Track community progress on special events
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>📚</Text>
            <Text style={styles.featureText}>
              <Text style={styles.featureTitle}>Resources</Text>
              {'\n'}Find guides, tips, and battle strategies
            </Text>
          </View>
        </View>
        
        <View style={styles.authInfo}>
          <Text style={styles.authTitle}>💡 Tip</Text>
          <Text style={styles.authDescription}>
            Some features like social interactions will require creating an account, 
            but you can explore most of the app without signing up!
          </Text>
          <Link href="/sign-in" asChild push>
            <Button title="Sign In" />
          </Link>
        </View>
      </View>
     
      <View style={styles.footer}>
        <Button
          ref={exploreBtnRef}
          title="Start Exploring"
          onPress={handleCompleteOnboarding}
          style={styles.completeButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  featureTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  authInfo: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  authDescription: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 20,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
});
