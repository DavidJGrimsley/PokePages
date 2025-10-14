import { Stack } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';

import { Container } from 'components/UI/Container';

export default function DownloadApp() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Download Poké Pages',
          headerShown: true 
        }} 
      />
      <Container>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="p-lg bg-app-white">
            <Text className="typography-header text-app-text mb-md text-center">
              📱 Download Poké Pages App
            </Text>
            <Text className="typography-copy text-app-brown mb-lg text-center">
              Get early access to the mobile app! Fill out the form below to be notified when the app is available for download.
            </Text>
          </View>
          
          <View className="flex-1 bg-app-background">
            <iframe
              src="https://forms.gle/LwwgCUxrbLNR4WXJA"
              style={{ width: '100%', minHeight: 600, border: 'none' }}
              title="Download App Form"
              loading="lazy"
            />
          </View>
        </ScrollView>
      </Container>
    </>
  );
}