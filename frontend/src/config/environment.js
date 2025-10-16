// Environment configuration
const config = {
  // Temporarily hardcode for Railway deployment
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://backend-production-1960.up.railway.app',
  WS_URL: import.meta.env.VITE_WS_URL || 'https://backend-production-1960.up.railway.app',
  NODE_ENV: import.meta.env.MODE || 'development'
};

// Debug: Log the environment variables
console.log('🔍 Environment Debug:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('VITE_WS_URL:', import.meta.env.VITE_WS_URL);
console.log('Final API_BASE_URL:', config.API_BASE_URL);
console.log('Final WS_URL:', config.WS_URL);

// Force rebuild trigger - remove this after fixing
console.log('🔄 Frontend rebuild triggered at:', new Date().toISOString());

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
