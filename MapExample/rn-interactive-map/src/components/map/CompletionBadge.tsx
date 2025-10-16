import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CompletionBadgeProps {
  isComplete: boolean;
}

const CompletionBadge: React.FC<CompletionBadgeProps> = ({ isComplete }) => {
  return (
    <View style={[styles.badge, isComplete ? styles.complete : styles.incomplete]}>
      <Text style={styles.text}>{isComplete ? '✔️ Completed' : '❌ Incomplete'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  complete: {
    backgroundColor: 'green',
  },
  incomplete: {
    backgroundColor: 'red',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CompletionBadge;