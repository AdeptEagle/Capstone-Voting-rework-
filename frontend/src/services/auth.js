// For HTTP-only cookies, we can't access the token directly
// We'll need to make a request to check authentication status
export function getRole() {
  return localStorage.getItem('role'); // Keep for backward compatibility
}

export function getToken() {
  return null; // Tokens are in HTTP-only cookies, not accessible via JavaScript
}

// Function to store user data after successful login
export const storeUserData = (userData, role) => {
  localStorage.setItem('role', role);
  localStorage.setItem('userId', userData.id);
  localStorage.setItem('username', userData.username || userData.name);
  localStorage.setItem('email', userData.email);
};

// Function to clear user data on logout
export const clearUserData = () => {
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
};

// Function to check current user's role and token validity
export const checkCurrentUser = () => {
  try {
    // Since we can't access HTTP-only cookies directly, we'll use localStorage role
    // The actual authentication will be handled by the server via cookies
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (!role) {
      return { isAuthenticated: false, role: null, user: null };
    }

    return {
      isAuthenticated: true,
      role: role,
      user: {
        id: userId,
        username: username,
        email: localStorage.getItem('email')
      }
    };
  } catch (error) {
    console.error('Error checking current user:', error);
    clearUserData();
    return { isAuthenticated: false, role: null, user: null, error: 'Invalid token' };
  }
};

// Function to check if user has required role
export const hasRole = (requiredRole) => {
  const currentUser = checkCurrentUser();
  if (!currentUser.isAuthenticated) {
    return false;
  }
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(currentUser.role);
  }
  
  return currentUser.role === requiredRole;
};

// Function to check if user is superadmin
export const isSuperAdmin = () => {
  return hasRole('SUPERADMIN');
};

// Function to check if user is admin
export const isAdmin = () => {
  return hasRole(['ADMIN', 'SUPERADMIN']);
}; 