// API Configuration for development vs production
const getApiUrl = (): string => {
  
    return 'https://api.pokepages.app';
  
  // if (__DEV__) {
  //   return 'http://localhost:3001';
  // } else {
  //   return 'https://api.pokepages.app';
  // }
};

export const API_BASE_URL = getApiUrl();

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};