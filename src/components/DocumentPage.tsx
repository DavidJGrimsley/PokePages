import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';

import documentsData from '../../constants/documents.json';
import { theme } from '../../constants/style/theme';

type DocumentType = 'termsOfService' | 'privacyPolicy';

interface DocumentPageProps {
  documentType: DocumentType;
}

export const DocumentPage: React.FC<DocumentPageProps> = ({ documentType }) => {
  const document = documentsData[documentType];
  
  // Get the title based on document type
  const getTitle = () => {
    if (documentType === 'termsOfService') {
      return 'Terms of Service';
    } else {
      return 'Privacy Policy';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <Text style={styles.lastUpdated}>
            Last Updated: {(document as any).lastUpdated || (document as any).effectiveDate}
          </Text>
          
          {document.sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  headerTitle: {
    ...theme.typography.header,
    color: theme.colors.light.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  lastUpdated: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
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
    lineHeight: 24,
    color: theme.colors.light.brown,
  },
});
