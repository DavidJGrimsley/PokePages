import { Link, Stack, router } from 'expo-router';
import { View, Text, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState, useCallback } from 'react';

import { Confetti } from 'react-native-fast-confetti';

import { Button } from '~/components/Button';
import { useOnboardingStore } from '~/utils/onboardingStore';

export default function OnboardingFinalScreen() {
  const { completeOnboarding, hasCompletedOnboarding } = useOnboardingStore();
  const [confettiVisible, setConfettiVisible] = useState(false);
  const [cannonPositions, setCannonPositions] = useState<{ x: number; y: number }[]>([]);
  const [runId, setRunId] = useState(0); // force remount per run
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exploreBtnRef = useRef<View>(null); // ref to the Start Exploring button

  // Tune these to your liking
  const BLAST_MS = 1000;
  const FALL_MS = 4000;
  const TOTAL_MS = BLAST_MS + FALL_MS;

  const clearFallback = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleCompleteOnboarding = useCallback(() => {
    clearFallback();
    setConfettiVisible(false);
    console.log('Attempting to complete onboarding');
    console.log('Has completed onboarding: ', hasCompletedOnboarding);
    completeOnboarding();
    console.log('Has completed onboarding: ', hasCompletedOnboarding);
    router.replace('/(drawer)' as any);
    console.log('Onboarding completed, navigating to main app...');
  }, [completeOnboarding, hasCompletedOnboarding]);


  const readyCannon = useCallback(() => {
    clearFallback();

    const measureAndFire = () => {
      const node = exploreBtnRef.current as any;
      if (node?.measure) {
        node.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          // center of the button in screen coords
          const pos = { x: pageX + width / 2, y: pageY + height / 2 };
          setCannonPositions([pos]);
          setRunId((id) => id + 1);     // force remount/start
          setConfettiVisible(true);

          // fallback in case onAnimationEnd doesn't fire
          timeoutRef.current = setTimeout(() => {
            handleCompleteOnboarding();
          }, TOTAL_MS - 2000);
        });
      } else {
        // fallback position if measure unavailable
        setCannonPositions([{ x: 0, y: 0 }]);
        setRunId((id) => id + 1);
        setConfettiVisible(true);
        timeoutRef.current = setTimeout(() => {
          handleCompleteOnboarding();
        }, TOTAL_MS - 2000);
      }
    };

    // ensure layout is ready before measuring
    requestAnimationFrame(measureAndFire);
  }, [TOTAL_MS, handleCompleteOnboarding]);


  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '' }} />
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        <Image 
          source={require('@/assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
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
      <Confetti
        key={runId}                  // remount per run
        autoplay={confettiVisible}
        isInfinite={false}
        cannonsPositions={cannonPositions}
        blastDuration={BLAST_MS}
        fallDuration={FALL_MS}
        onAnimationEnd={handleCompleteOnboarding}
      />
      <View style={styles.footer}>
        <Button
          ref={exploreBtnRef}
          title="Start Exploring"
          onPress={readyCannon}
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
  },
  footer: {
    paddingVertical: 20,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
});
