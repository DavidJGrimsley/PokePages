export interface Marker {
  id: string;
  title: string;
  description: string;
  category: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isComplete: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Filter {
  id: string;
  label: string;
  isActive: boolean;
}