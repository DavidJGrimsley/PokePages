import { useState, useEffect } from 'react';
import { categories } from '../data/categories';

export const useFilters = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.includes(filter)
        ? prevFilters.filter((f) => f !== filter)
        : [...prevFilters, filter]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const isFilterSelected = (filter: string) => selectedFilters.includes(filter);

  useEffect(() => {
    // You can add any side effects related to filters here
  }, [selectedFilters]);

  return {
    selectedFilters,
    toggleFilter,
    clearFilters,
    isFilterSelected,
    categories,
  };
};