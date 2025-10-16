import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip } from './Chip';
import { useFilters } from '../../hooks/Map/useFilters';
import { categories } from '../../constants/Map/categories';

export const FilterBar: React.FC = () => {
  const { selectedFilters, toggleFilter } = useFilters();

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.label}
            icon={category.icon}
            selected={selectedFilters.includes(category.id)}
            onPress={() => toggleFilter(category.id)}
            color={category.color}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
});
