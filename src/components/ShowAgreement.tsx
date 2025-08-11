import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Modal, 
  Pressable, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';

import documentsData from '@/constants/documents.json';

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
      // onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <Text style={styles.lastUpdated}>
            Last Updated: {agreement.lastUpdated}
          </Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
          <View style={styles.content}>
            {agreement.sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionContent}>{section.content}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <Pressable style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  doneButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
