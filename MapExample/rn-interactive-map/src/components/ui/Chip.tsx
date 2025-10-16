import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const Chip: React.FC<ChipProps> = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selectedChip]}
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    margin: 5,
  },
  selectedChip: {
    backgroundColor: '#6200ee',
  },
  label: {
    color: '#000',
  },
});

export default Chip;