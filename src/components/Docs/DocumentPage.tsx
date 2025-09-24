import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import documentsData from 'constants/documents.json';
// Inline a simple error UI to avoid cross-platform casing conflicts on import paths
import { ThemedText } from 'components/TextTheme/ThemedText';

type DocumentType = 'termsOfService' | 'privacyPolicy';

interface DocumentPageProps {
  documentType: DocumentType;
}

export const DocumentPage: React.FC<DocumentPageProps> = ({ documentType }) => {
  const document = documentsData[documentType];
  const isValidDocument = document && document.sections && Array.isArray(document.sections);
  
  // Get the title based on document type
  const getTitle = () => {
    if (documentType === 'termsOfService') {
      return 'Terms of Service';
    } else {
      return 'Privacy Policy';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {!isValidDocument ? (
        <View className="flex-1 p-6 bg-white border border-red-300">
          <View className="self-center p-3 bg-red-500 rounded-md">
            <ThemedText type="subheader" className="text-white text-center">Document Error</ThemedText>
          </View>
          <View className="flex-1 justify-center">
            <ThemedText type="copy" className="text-black text-center my-3">
              {`Could not load the ${getTitle()} document.`}
            </ThemedText>
            <View className="bg-purple-100 border border-red-500 self-center rounded-md p-4 mt-6">
              <ThemedText type="copyBold" className="text-red-500 mb-1">Technical error message:</ThemedText>
              <ThemedText type="mono" className="text-red-500 text-sm">
                {`Document data for '${documentType}' is missing or invalid.`}
              </ThemedText>
            </View>
          </View>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator>
          <View className="p-6">
            <ThemedText type="header" className="text-center mb-2">
              {getTitle()}
            </ThemedText>
            <ThemedText type="copy" className="text-amber-700 text-center mb-8">
              Last Updated: {(document as any).lastUpdated || (document as any).effectiveDate}
            </ThemedText>
            {document.sections.map((section, index) => (
              <View key={index} className="mb-6">
                <ThemedText
                  type="subheader"
                  className="mb-3 pb-2 border-b border-app-secondary"
                >
                  {section.title}
                </ThemedText>
                <ThemedText type="copy" className="text-amber-700">
                  {section.content}
                </ThemedText>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
