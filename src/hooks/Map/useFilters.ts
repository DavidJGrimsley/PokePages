import { useMemo } from 'react';
import { useFiltersContext } from '../../context/Map/FiltersContext';
import { useMarkers } from '../../context/Map/MarkersContext';

export const useFilters = () => {
  const { selectedFilters, toggleFilter, clearFilters } = useFiltersContext();
  const { markers } = useMarkers();

  const filteredMarkers = useMemo(() => {
    if (selectedFilters.includes('everything')) {
      return markers;
    }
    return markers.filter(marker => selectedFilters.includes(marker.category));
  }, [markers, selectedFilters]);

  return {
    selectedFilters,
    toggleFilter,
    clearFilters,
    filteredMarkers,
  };
};
