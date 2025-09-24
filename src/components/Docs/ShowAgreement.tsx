import React from 'react';
import { View, Text, ScrollView, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import documentsData from 'constants/documents.json';
import { ThemedText } from 'components/TextTheme/ThemedText';

type AgreementType = 'termsOfService' | 'privacyPolicy';

interface ShowAgreementProps {
  visible: boolean;
  onClose: () => void;
  agreementType: AgreementType;
}

export const ShowAgreement: React.FC<ShowAgreementProps> = ({ 
  visible, 
  onClose, 
  agreementType 
}) => {
  const agreement = documentsData[agreementType];
  
  // Get the title based on agreement type
  const getTitle = () => {
    if (agreementType === 'termsOfService') {
      return 'Terms of Service';
    } else {
      return 'Privacy Policy';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-6 border-b border-app-secondary bg-app-background relative">
          <ThemedText type="header" className="text-center mb-1">
            {getTitle()}
          </ThemedText>
          <ThemedText type="copy" className="text-amber-700 text-center mb-2">
            Last Updated: {agreement.lastUpdated}
          </ThemedText>
          <Pressable onPress={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-md bg-app-secondary items-center justify-center">
            <ThemedText type="subheader" className="text-amber-700">✕</ThemedText>
          </Pressable>
        </View>
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator>
          <View className="p-6">
            {agreement.sections.map((section, index) => (
              <View key={index} className="mb-6">
                <ThemedText type="subheader" className="mb-3 pb-2 border-b border-app-secondary">
                  {section.title}
                </ThemedText>
                <ThemedText type="copy" className="text-amber-700">
                  {section.content}
                </ThemedText>
              </View>
            ))}
          </View>
        </ScrollView>
        
        <View className="p-6 border-t border-app-secondary bg-app-background">
          <Pressable onPress={onClose} className="bg-app-primary py-3 px-6 rounded-md items-center">
            <Text className="text-white typography-copy-bold">Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
