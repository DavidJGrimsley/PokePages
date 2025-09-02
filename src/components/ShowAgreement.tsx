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
import { theme } from '../../constants/style/theme';

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
    backgroundColor: theme.colors.light.white,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.secondary,
    backgroundColor: theme.colors.light.background,
  },
  headerTitle: {
    ...theme.typography.header,
    color: theme.colors.light.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  lastUpdated: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...theme.typography.subheader,
    color: theme.colors.light.brown,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subheader,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.secondary,
  },
  sectionContent: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.secondary,
    backgroundColor: theme.colors.light.background,
  },
  doneButton: {
    backgroundColor: theme.colors.light.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  doneButtonText: {
    color: theme.colors.light.white,
    ...theme.typography.copyBold,
  },
});
