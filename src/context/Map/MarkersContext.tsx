import React, { createContext, useState, useContext, ReactNode } from 'react';
import { lumioseCityMarkers } from '../../data/Map/lumioseCityMarkers';

export interface Marker {
  id: string;
  name: string;
  category: string;
  coordinates: { x: number; y: number };
  completed: boolean;
  description?: string;
}

interface MarkersContextType {
  markers: Marker[];
  addMarker: (marker: Marker) => void;
  toggleCompletion: (id: string) => void;
  setMarkers: (markers: Marker[]) => void;
}

const MarkersContext = createContext<MarkersContextType | undefined>(undefined);

export const MarkersProvider = ({ children }: { children: ReactNode }) => {
  const [markers, setMarkers] = useState<Marker[]>(lumioseCityMarkers);

  const addMarker = (marker: Marker) => {
    setMarkers((prevMarkers) => [...prevMarkers, marker]);
  };

  const toggleCompletion = (id: string) => {
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker) =>
        marker.id === id ? { ...marker, completed: !marker.completed } : marker
      )
    );
  };

  return (
    <MarkersContext.Provider value={{ markers, addMarker, toggleCompletion, setMarkers }}>
      {children}
    </MarkersContext.Provider>
  );
};

export const useMarkers = () => {
  const context = useContext(MarkersContext);
  if (!context) {
    throw new Error('useMarkers must be used within MarkersProvider');
  }
  return context;
};
