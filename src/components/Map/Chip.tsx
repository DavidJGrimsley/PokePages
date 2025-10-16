import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface ChipProps {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

export const Chip: React.FC<ChipProps> = ({ label, icon, selected, onPress, color = '#6200ee' }) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && { ...styles.selectedChip, backgroundColor: color }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#6200ee',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 4,
  },
  label: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedLabel: {
    color: '#fff',
  },
});
