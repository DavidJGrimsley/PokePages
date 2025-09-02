import { Stack, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View, Pressable, Linking, StyleSheet } from 'react-native';
import { useState } from 'react';

import { ScreenContent } from '~/components/ScreenContent';
import { ShowAgreement } from '~/components/ShowAgreement';
import { useAuthStore } from '~/utils/authStore';
import { useOnboardingStore } from '~/utils/onboardingStore';

export default function AppInfo() {
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementType, setAgreementType] = useState<'termsOfService' | 'privacyPolicy'>('termsOfService');
  const { logIn, logOut } = useAuthStore();
  const { resetOnboarding } = useOnboardingStore();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const openAgreement = (type: 'termsOfService' | 'privacyPolicy') => {
    setAgreementType(type);
    setShowAgreementModal(true);
  };

  const closeAgreement = () => {
    setShowAgreementModal(false);
  };

  // const handleResetOnboarding = () => {
  //   resetOnboarding();
  //   // The app will automatically redirect to onboarding
  // };


  return (
    <>
      <Stack.Screen options={{ title: '' }} />

      <ScreenContent path="app/modal.tsx" title="Thank you">
        <View style={styles.container}>
          <Text style={styles.mainText}>
            Hello fellow trainers, I appreciate you using my app! This is and always will be free to use and free from ads. Consider it my gift to the community. If you&apos;d like to support then please follow my social media pages or view my portfolio website for more of my work and contact info. Go catch &apos;em all!
          </Text>
          
          <Text style={styles.followText}>Follow me on:</Text>
          
          <View style={styles.buttonContainer}>
            <Pressable 
              style={[styles.socialButton, styles.twitterButton]}
              onPress={() => handleLinkPress('https://twitter.com/MrDJ2U26')}
            >
              <Text style={styles.buttonText}>🐦 Twitter</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.socialButton, styles.instagramButton]}
              onPress={() => handleLinkPress('https://instagram.com/OfficialMrDJ')}
            >
              <Text style={styles.buttonText}>📸 Instagram</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.socialButton, styles.youtubeButton]}
              onPress={() => handleLinkPress('https://youtube.com/@MrDJsArcade')}
            >
              <Text style={styles.buttonText}>🎥 YouTube</Text>
            </Pressable>
          </View>
          
          <Pressable 
            style={styles.portfolioButton}
            onPress={() => handleLinkPress('https://www.DavidJGrimsley.com')}
          >
            <Text style={styles.portfolioButtonText}>🌐 Visit My Portfolio</Text>
            <Text style={styles.portfolioSubtext}>www.DavidJGrimsley.com</Text>
          </Pressable>
          
          <View style={styles.agreementButtonContainer}>
            <Pressable 
              style={styles.agreementButton}
              onPress={() => openAgreement('termsOfService')}
            >
              <Text style={styles.agreementButtonText}>📄 Terms of Service</Text>
            </Pressable>
            
            <Pressable 
              style={styles.agreementButton}
              onPress={() => openAgreement('privacyPolicy')}
            >
              <Text style={styles.agreementButtonText}>🔒 Privacy Policy</Text>
            </Pressable>
          </View>
          
          {/* Development Helper */}
          <Pressable 
            style={styles.devButton}
            onPress={resetOnboarding}
          >
            <Text style={styles.devButtonText}>🔄 Reset Onboarding (Dev)</Text>
          </Pressable>

          <Link href="/sign-in" asChild push>
            <Pressable
              style={styles.devButton}
            >
              <Text style={styles.devButtonText}>🔄 Create Account or Sign up(Dev-supabase)</Text>
            </Pressable>
          </Link>

          <Pressable 
            onPress={logIn}
            style={styles.devButton}
          >
            <Text style={styles.devButtonText}>🔄 Log In (Dev)</Text>
          </Pressable>
        
          <Pressable 
            onPress={logOut}
            style={styles.devButton}
          >
            <Text style={styles.devButtonText}>🔄 Log Out (Dev)</Text>
          </Pressable>
          
        </View>
        
        <ShowAgreement
          visible={showAgreementModal}
          onClose={closeAgreement}
          agreementType={agreementType}
        />
      </ScreenContent>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 24,
  },
  mainText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  followText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  socialButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  twitterButton: {
    backgroundColor: '#1DA1F2',
  },
  instagramButton: {
    backgroundColor: '#E4405F',
  },
  youtubeButton: {
    backgroundColor: '#FF0000',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  portfolioButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginTop: 8,
  },
  portfolioButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  portfolioSubtext: {
    color: '#E0E7FF',
    fontSize: 14,
    fontWeight: '500',
  },
  agreementButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  agreementButton: {
    flex: 1,
    backgroundColor: '#64748B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  agreementButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  devButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  devButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
