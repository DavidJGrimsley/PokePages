import React from 'react';
import { View, Text, ScrollView, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import documentsData from 'constants/documents.json';

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
  
  // Debug log to check if data is loading
  console.log('ShowAgreement - agreementType:', agreementType);
  console.log('ShowAgreement - agreement data:', agreement);
  
  // Get the title based on agreement type
  const getTitle = () => {
    if (agreementType === 'termsOfService') {
      return 'Terms of Service';
    } else {
      return 'Privacy Policy';
    }
  };

  // Get the last updated date - handle both formats
  const getLastUpdated = () => {
    if (!agreement) return 'Not specified';
    return agreement.lastUpdated || (agreement as any).effectiveDate || 'Not specified';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ 
          padding: 24, 
          borderBottomWidth: 1, 
          borderBottomColor: '#e5e5e5', 
          backgroundColor: '#ffffff',
          position: 'relative'
        }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: 4,
            color: '#000000'
          }}>
            {getTitle()}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            textAlign: 'center', 
            marginBottom: 8,
            color: '#666666'
          }}>
            Last Updated: {getLastUpdated()}
          </Text>
          <Pressable 
            onPress={onClose} 
            style={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              width: 32, 
              height: 32, 
              borderRadius: 6, 
              backgroundColor: '#f5f5f5', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Text style={{ fontSize: 18, color: '#000000' }}>✕</Text>
          </Pressable>
        </View>
        
        <ScrollView 
          className="flex-1 bg-app-background" 
          showsVerticalScrollIndicator={true}
          style={{ flex: 1, backgroundColor: '#ffffff' }}
        >
          <View className="p-6" style={{ padding: 24 }}>
            {agreement && agreement.sections ? (
              agreement.sections.map((section, index) => (
                <View key={index} className="mb-6" style={{ marginBottom: 24 }}>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: 'bold', 
                    marginBottom: 12, 
                    paddingBottom: 8, 
                    borderBottomWidth: 1, 
                    borderBottomColor: '#e5e5e5',
                    color: '#000000'
                  }}>
                    {section.title}
                  </Text>
                  <Text style={{ 
                    fontSize: 16, 
                    lineHeight: 24, 
                    color: '#333333'
                  }}>
                    {section.content}
                  </Text>
                </View>
              ))
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
                <Text style={{ color: '#000000', textAlign: 'center', fontSize: 16 }}>
                  Unable to load document content. Please try again.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
        
        <View style={{ 
          padding: 24, 
          borderTopWidth: 1, 
          borderTopColor: '#e5e5e5', 
          backgroundColor: '#ffffff' 
        }}>
          <Pressable 
            onPress={onClose} 
            style={{ 
              backgroundColor: '#582a5a', 
              paddingVertical: 12, 
              paddingHorizontal: 24, 
              borderRadius: 6, 
              alignItems: 'center' 
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
