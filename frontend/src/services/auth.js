// For HTTP-only cookies, we can't access the token directly
// We'll need to make a request to check authentication status
export function getRole() {
  return null; // Don't store role in localStorage for security
}

export function getToken() {
  return null; // Tokens are in HTTP-only cookies, not accessible via JavaScript
}

// Secure role hashing utilities
const ROLE_HASH_SALT = 'voting_system_role_salt_2024_v2';
const ROLE_KEY_SALT = 'voting_system_key_salt_2024_v2';

// Simple but secure hash function for role storage
function hashRole(role) {
  let hash = 0;
  const str = role + ROLE_HASH_SALT;
  
  // Use a more robust hashing algorithm
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Add additional entropy
  hash = hash ^ (hash >>> 16);
  hash = hash * 0x85ebca6b;
  hash = hash ^ (hash >>> 13);
  hash = hash * 0xc2b2ae35;
  hash = hash ^ (hash >>> 16);
  
  return hash.toString(36); // Convert to base36 for shorter storage
}

// Hash the localStorage key
function hashKey(key) {
  let hash = 0;
  const str = key + ROLE_KEY_SALT;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Add additional entropy
  hash = hash ^ (hash >>> 16);
  hash = hash * 0x85ebca6b;
  hash = hash ^ (hash >>> 13);
  hash = hash * 0xc2b2ae35;
  hash = hash ^ (hash >>> 16);
  
  return hash.toString(36); // Convert to base36 for shorter storage
}

// Verify role hash
function verifyRoleHash(hash, expectedRole) {
  const expectedHash = hashRole(expectedRole);
  return hash === expectedHash;
}

// Get role from hash
function getRoleFromHash(hash) {
  const roles = ['ADMIN', 'SUPERADMIN', 'user'];
  for (const role of roles) {
    if (verifyRoleHash(hash, role)) {
      return role;
    }
  }
  return null;
}

// Function to check authentication status with server
export const checkAuthStatus = async () => {
  try {
    // Make API call to check authentication status
    const response = await fetch('http://localhost:3001/auth/status', {
      credentials: 'include' // Include HTTP-only cookies
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        isAuthenticated: true,
        role: data.role,
        user: data.user
      };
    } else {
      return { isAuthenticated: false, role: null, user: null };
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { isAuthenticated: false, role: null, user: null };
  }
};

// Function to store minimal UI data after successful login
export const storeUserData = (userData, role) => {
  // Don't store any user data in localStorage for security
  // Only store UI preferences like sidebar state
};

// Function to clear user data on logout
export const clearUserData = () => {
  // Clear role and UI preferences
  const hashedKey = hashKey('role');
  localStorage.removeItem(hashedKey);
  
  // Also clear any plain text roles for security
  localStorage.removeItem('role');
  
  // Clear user ID
  localStorage.removeItem('userId');
  
  localStorage.removeItem('sidebar-expanded-sections');
};

// Function to migrate existing plain text roles to secure storage
export const migrateToSecureStorage = () => {
  const plainRole = localStorage.getItem('role');
  if (plainRole) {
    // Store securely and remove plain text
    storeRole(plainRole);
    localStorage.removeItem('role');
    console.log('Role migrated to secure storage');
  }
};

// Function to store role securely
export const storeRole = (role) => {
  // Store role securely using hashing
  const hashedRole = hashRole(role);
  const hashedKey = hashKey('role');
  localStorage.setItem(hashedKey, hashedRole);
};

// Function to get role securely
export const getStoredRole = () => {
  // Get role securely using hashing
  const hashedKey = hashKey('role');
  const hashedRole = localStorage.getItem(hashedKey);
  
  if (!hashedRole) {
    return null;
  }
  
  return getRoleFromHash(hashedRole);
};

// Function to check current user's role and token validity
export const checkCurrentUser = () => {
  try {
    // Use hashed role from localStorage for UI purposes (navigation, sidebar)
    // This is set during login for immediate UI feedback
    const role = getStoredRole();
    
    if (!role) {
      return { isAuthenticated: false, role: null, user: null };
    }

    // For admin routes, we need to be more permissive during the login process
    // The actual authentication will be verified by the server
    return {
      isAuthenticated: true,
      role: role,
      user: {
        // Don't store sensitive user data in localStorage
        // This should come from server API calls when needed
        id: null,
        username: null,
        email: null
      }
    };
  } catch (error) {
    console.error('Error checking current user:', error);
    clearUserData();
    return { isAuthenticated: false, role: null, user: null, error: 'Invalid token' };
  }
};

// Function to logout user (calls backend and clears local data)
export const logout = async () => {
  try {
    // Call backend logout endpoint to clear HTTP-only cookie
    await fetch('http://localhost:3001/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout API call failed:', error);
    // Continue with local cleanup even if API call fails
  } finally {
    // Always clear local data
    clearUserData();
  }
};

// Function to check if user has required role
export const hasRole = async (requiredRole) => {
  const authStatus = await checkAuthStatus();
  if (!authStatus.isAuthenticated) {
    return false;
  }
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(authStatus.role);
  }
  
  return authStatus.role === requiredRole;
};

// Function to check if user is superadmin
export const isSuperAdmin = async () => {
  return await hasRole('SUPERADMIN');
};

// Function to check if user is admin
export const isAdmin = async () => {
  return await hasRole(['ADMIN', 'SUPERADMIN']);
}; 