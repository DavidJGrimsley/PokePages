import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { Text, View } from 'react-native';

import { Container } from 'components/UI/Container';
import { ScreenContent } from 'components/UI/ScreenContent';
import { Button } from 'components/UI/Button';
import { useNavigateToSignIn } from '@/src/hooks/useNavigateToSignIn';

export default function CheckSignin() {
  const navigateToSignIn = useNavigateToSignIn();
  
  // SEO meta content
  const title = 'Social Hub | Connect with Pokémon Trainers | PokePages';
  const description = 'Join the Poké Pages community! Connect with fellow trainers, share your adventures, discuss strategies, and make new friends in our social hub.';
  const keywords = 'pokemon social, pokemon community, trainer social network, pokemon friends, pokemon discussion';
  
  return (
    <>
      <Stack.Screen options={{ title: 'Social Hub' }} />
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Poké Pages" />
        <meta property="og:url" content="https://pokepages.app/social" />
        <meta property="og:image" content="https://pokepages.app/images/home-preview.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://pokepages.app/images/home-preview.png" />
        
        {/* Additional SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Poké Pages" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://pokepages.app/social" />
      </Head>
      <Container>
        <ScreenContent path="app/(drawer)/social/index.tsx" title="Social Hub">
          <View className="px-md">
            <Text
              role="heading"
              aria-level={1}
              className="typography-header text-app-text mb-md text-center"
            >
              Connect with Pokémon Trainers Worldwide
            </Text>
            
            <Text className="typography-copy text-app-secondary mb-md">
              Join the Poké Pages community and connect with thousands of fellow Pokémon trainers! 
              Share your adventures, discuss battle strategies, showcase your teams, and make new friends 
              who share your passion for Pokémon.
            </Text>
            
            <Text className="typography-subheader text-app-text mb-sm">
              🌟 Community Features:
            </Text>
            
            <Text className="typography-copy text-app-secondary mb-xs">
              • Share posts about your Pokémon journey and achievements
            </Text>
            <Text className="typography-copy text-app-secondary mb-xs">
              • Discuss strategies and team builds with other trainers
            </Text>
            <Text className="typography-copy text-app-secondary mb-xs">
              • Direct message friends and make new connections
            </Text>
            <Text className="typography-copy text-app-secondary mb-xs">
              • React and comment on community posts
            </Text>
            <Text className="typography-copy text-app-secondary mb-lg">
              • Join global events and challenges together
            </Text>
            
            <Text className="typography-copy text-app-brown mb-md text-center italic">
              Sign in to unlock all social features and join the community!
            </Text>
            
            <Button onPress={navigateToSignIn} title="Sign In / Create Account" />
          </View>
          {/* <Link href="/createAccount" asChild push>
            <Button title="Create Account" />
          </Link> */}
        </ScreenContent>
      </Container>
    </>
  );
}
