
import { Stack, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button } from "components/UI/Button";
import { PrettyText } from 'components/TextTheme/PrettyText';
import { Disclaimer } from 'components/Meta/Disclaimer';

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  
  return (
    <View className="flex-1 bg-app-background p-lg">
      <Stack.Screen options={{ title: '' }} />
      <StatusBar style="auto" />
      
      <View className="flex-1 items-center py-xl">
        {/* <Image 
          source={require('@/assets/icon.png')} 
          className="w-[120px] h-[120px] mb-lg shadow-app-large"
          resizeMode="contain"
        /> */}
        <Text className="typography-header text-app-text text-center mb-sm">Welcome to</Text>
        <PrettyText text="Poké Pages" />
        <Text className="typography-header text-app-secondary text-center mb-xl leading-6">
          Your ultimate (unofficial) Pokémon companion
        </Text>
        <Disclaimer/>
        
        {/* <View className="w-full mb-xl">
          <View className="flex-row items-center mb-md px-lg">
            <Text className="typography-header mr-md w-8 text-center">⚔️</Text>
            <Text className="typography-copy-bold text-app-primary flex-1">Counter Builds & Strategies</Text>
          </View>
          <View className="flex-row items-center mb-md px-lg">
            <Text className="typography-header mr-md w-8 text-center">📊</Text>
            <Text className="typography-copy-bold text-app-primary flex-1">Community Event Counters</Text>
          </View>
          <View className="flex-row items-center mb-md px-lg">
            <Text className="typography-header mr-md w-8 text-center">🎯</Text>
            <Text className="typography-copy-bold text-app-primary flex-1">Raid Resources & Guides</Text>
          </View>
          <View className="flex-row items-center mb-md px-lg">
            <Text className="typography-header mr-md w-8 text-center">👥</Text>
            <Text className="typography-copy-bold text-app-primary flex-1">Connect with Trainers</Text>
          </View>
        </View> */}
        
        <Text className="typography-copy text-app-text text-center leading-6 px-lg">
          Join thousands of trainers tracking legendary events, sharing strategies, 
          and building the ultimate raid teams. Let&apos;s catch &apos;em all together!
        </Text>
      </View>
      
      <View className="py-lg">
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


