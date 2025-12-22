import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllAds, type AdConfig } from '~/constants/adsConfig';
import { IframeEmbed } from '~/components/UI/IframeEmbed';

export default function IntakeFormPage() {
  const { form } = useLocalSearchParams<{ form: string }>();
  
  // Find the ad configuration based on the form parameter
  const allAds = getAllAds();
  const adConfig = allAds.find((ad: AdConfig) => ad.id === form);

  if (!adConfig || !adConfig.formUrl) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Form Not Found',
            headerShown: true,
            headerTransparent: false,
          }}
        />
        <View className="flex-1 items-center justify-center bg-app-background">
          <Text className="typography-title text-app-text-primary">
            Form not found
          </Text>
          <Text className="typography-body text-app-text-secondary mt-sm">
            The requested intake form could not be found.
          </Text>
        </View>
      </>
    );
  }

  // Determine gradient colors based on accent color
  const getGradientColors = (color: string): [string, string] => {
    const gradients: Record<string, [string, string]> = {
      blue: ['#4A90E2', '#357ABD'],
      green: ['#50C878', '#3AA05E'],
      purple: ['#9B59B6', '#7D3C98'],
      orange: ['#E67E22', '#CA6510'],
      pink: ['#E91E63', '#C2185B'],
    };
    return gradients[color] || gradients.blue;
  };

  const gradientColors = getGradientColors(adConfig.accentColor);

  return (
    <>
      <Stack.Screen
        options={{
          title: adConfig.title,
          headerShown: true,
          headerTransparent: true,
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <View className="flex-1 bg-app-background">
        {/* Gradient Header */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pt-20 pb-6 px-md"
        >
          <Text className="typography-heading text-white text-center">
            {adConfig.title}
          </Text>
          {adConfig.tagline && (
            <Text className="typography-subheading text-white/90 text-center mt-xs">
              {adConfig.tagline}
            </Text>
          )}
        </LinearGradient>

        {/* Google Form Embed */}
        <View className="flex-1">
          <IframeEmbed src={adConfig.formUrl} />
        </View>
      </View>
    </>
  );
}
