import React, { useContext } from 'react';
import { Marker } from './Marker';
import { MarkersContext } from '../../context/MarkersContext';
import { FiltersContext } from '../../context/FiltersContext';

export const MarkerLayer = () => {
  const { markers } = useContext(MarkersContext);
  const { activeFilters } = useContext(FiltersContext);

  const filteredMarkers = markers.filter(marker => 
    activeFilters.includes(marker.category) || activeFilters.includes('Everything')
  );

  return (
    <>
      {filteredMarkers.map(marker => (
        <Marker key={marker.id} marker={marker} />
      ))}
    </>
  );
};