import { Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Button } from "~/components/Button";

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '' }} />
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        <Image 
          source={require('@/assets/PP_Icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Welcome to PokePages!</Text>
        
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
            console.log('Navigating to Agreements Screen');
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
    width: 120,
    height: 120,
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
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingVertical: 20,
  },
});
