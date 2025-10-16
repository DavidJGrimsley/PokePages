import React, { createContext, useState, useContext } from 'react';

// Define the shape of a marker
interface Marker {
  id: string;
  title: string;
  category: string;
  coordinates: { lat: number; lng: number };
  completed: boolean;
}

// Create a context for markers
const MarkersContext = createContext<{
  markers: Marker[];
  addMarker: (marker: Marker) => void;
  toggleCompletion: (id: string) => void;
}>({
  markers: [],
  addMarker: () => {},
  toggleCompletion: () => {},
});

// Create a provider component
export const MarkersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markers, setMarkers] = useState<Marker[]>([]);

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
    <MarkersContext.Provider value={{ markers, addMarker, toggleCompletion }}>
      {children}
    </MarkersContext.Provider>
  );
};

// Create a custom hook to use the MarkersContext
export const useMarkers = () => {
  return useContext(MarkersContext);
};