// Heartbeat utility to keep user sessions alive
let heartbeatInterval = null;

export const startHeartbeat = () => {
  // Send heartbeat every 5 minutes to keep session alive
  heartbeatInterval = setInterval(async () => {
    try {
      const response = await fetch('/auth/user/heartbeat', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('💓 Heartbeat sent successfully');
      } else {
        console.warn('💓 Heartbeat failed:', response.status);
      }
    } catch (error) {
      console.warn('💓 Heartbeat error:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
};

export const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    console.log('💓 Heartbeat stopped');
  }
};

// Auto-start heartbeat when user is logged in
export const initHeartbeat = () => {
  // Check if user is logged in
  const checkAuth = async () => {
    try {
      const response = await fetch('/auth/status', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated) {
          startHeartbeat();
        } else {
          stopHeartbeat();
        }
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
      stopHeartbeat();
    }
  };

  // Check immediately and then every 30 seconds
  checkAuth();
  setInterval(checkAuth, 30 * 1000);
};
