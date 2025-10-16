import React, { createContext, useContext, useState } from 'react';

const FiltersContext = createContext();

export const FiltersProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    everything: true,
    buildings: false,
    ruins: false,
    fastTravel: false,
    other: false,
  });

  const toggleFilter = (filter) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter],
    }));
  };

  return (
    <FiltersContext.Provider value={{ filters, toggleFilter }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  return useContext(FiltersContext);
};