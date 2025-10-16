import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FiltersContextType {
  selectedFilters: string[];
  toggleFilter: (filter: string) => void;
  clearFilters: () => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['everything']);

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prevFilters) => {
      if (filter === 'everything') {
        return ['everything'];
      }
      
      const withoutEverything = prevFilters.filter(f => f !== 'everything');
      
      if (prevFilters.includes(filter)) {
        const newFilters = withoutEverything.filter(f => f !== filter);
        return newFilters.length === 0 ? ['everything'] : newFilters;
      } else {
        return [...withoutEverything, filter];
      }
    });
  };

  const clearFilters = () => {
    setSelectedFilters(['everything']);
  };

  return (
    <FiltersContext.Provider value={{ selectedFilters, toggleFilter, clearFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFiltersContext = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFiltersContext must be used within FiltersProvider');
  }
  return context;
};
