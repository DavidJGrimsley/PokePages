import React from 'react';
import { View, Text } from 'react-native';
import { Chip } from '../ui/Chip';
import { useFilters } from '../../hooks/useFilters';
import { categories } from '../../data/categories';

const FilterBar = () => {
  const { selectedFilters, toggleFilter } = useFilters();

  return (
    <View style={{ flexDirection: 'row', padding: 10 }}>
      {categories.map((category) => (
        <Chip
          key={category.id}
          label={category.label}
          selected={selectedFilters.includes(category.id)}
          onPress={() => toggleFilter(category.id)}
        />
      ))}
    </View>
  );
};

export default FilterBar;