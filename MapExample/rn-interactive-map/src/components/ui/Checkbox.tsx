import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  const handlePress = () => {
    onChange(!checked);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Text style={styles.checkbox}>{checked ? '☑️' : '☐'}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkbox: {
    fontSize: 20,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
  },
});

export default Checkbox;