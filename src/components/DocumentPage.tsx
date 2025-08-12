import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';

import documentsData from '../../constants/documents.json';

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
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
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
});
