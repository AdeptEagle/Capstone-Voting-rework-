// Environment configuration
const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3001',
  NODE_ENV: import.meta.env.MODE || 'development'
};

// Helper function to get full API URL
export const getApiUrl = (endpoint = '') => {
  return `${config.API_BASE_URL}${endpoint}`;
};

// Helper function to get WebSocket URL
export const getWsUrl = () => {
  return config.WS_URL;
};

// Helper function to get image URL
export const getImageUrl = (photoUrl) => {
  if (!photoUrl) return '';
  
  // If it's already a full URL, return as is
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }
  
  // If it starts with /uploads, prepend API base URL
  if (photoUrl.startsWith('/uploads')) {
    return `${config.API_BASE_URL}${photoUrl}`;
  }
  
  // Default to uploads/images path
  return `${config.API_BASE_URL}/uploads/images/${photoUrl}`;
};

export default config;
