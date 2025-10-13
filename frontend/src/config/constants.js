// Centralized configuration for API endpoints and URLs
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3001',
  UPLOADS_URL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/uploads`,
  LOGOS_URL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/Logos`
};

// Helper functions
export const getApiUrl = (endpoint = '') => `${API_CONFIG.BASE_URL}${endpoint}`;
export const getWsUrl = () => API_CONFIG.WS_URL;
export const getUploadsUrl = (path = '') => `${API_CONFIG.UPLOADS_URL}${path}`;
export const getLogosUrl = (path = '') => `${API_CONFIG.LOGOS_URL}${path}`;

// Image URL helper
export const getImageUrl = (photoUrl) => {
  if (!photoUrl) return '';
  
  // If it's already a full URL, return as is
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }
  
  // If it starts with /uploads, prepend API base URL
  if (photoUrl.startsWith('/uploads')) {
    return `${API_CONFIG.BASE_URL}${photoUrl}`;
  }
  
  // Default to uploads/images path
  return `${API_CONFIG.UPLOADS_URL}/images/${photoUrl}`;
};
