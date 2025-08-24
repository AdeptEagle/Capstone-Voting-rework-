import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userLogin } from '../../services/api';
import { storeUserData, storeRole, getStoredRole, clearUserData } from '../../services/auth';
import io from 'socket.io-client';
import './UserLogin.css';

const UserLogin = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // WebSocket connection setup
  useEffect(() => {
    console.log('🔌 [UserLogin] Setting up WebSocket connection...');
    const newSocket = io('http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    newSocket.on('connect', () => {
      console.log('🔌 [UserLogin] WebSocket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 [UserLogin] WebSocket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ [UserLogin] WebSocket connection error:', error);
    });

    // Test event listeners
    newSocket.on('test-event', (data) => {
      console.log('🧪 [UserLogin] Test event received:', data);
    });

    newSocket.on('test-response', (data) => {
      console.log('🧪 [UserLogin] Test response received:', data);
    });

    // Election status update listeners
    newSocket.on('election-status-updated', (data) => {
      console.log('🗳️ [UserLogin] Election status updated:', data);
      // Show notification to user about status change
      const statusMessages = {
        'active': '🗳️ Voting is now OPEN! You can cast your vote.',
        'paused': '⏸️ Voting has been PAUSED temporarily.',
        'stopped': '⏹️ Voting has been STOPPED.',
        'ended': '✅ Voting has ENDED. Results are now available.',
        'draft': '📝 Election is in DRAFT mode.'
      };
      
      const message = statusMessages[data.status] || `Election status changed to: ${data.status}`;
      console.log('📢 Status Update:', message);
    });

    // Listen for new elections being created
    newSocket.on('election-created', (data) => {
      console.log('🆕 [UserLogin] New election created:', data);
    });

    // Listen for election updates
    newSocket.on('election-updated', (data) => {
      console.log('🔄 [UserLogin] Election updated:', data);
    });

    setSocket(newSocket);

    return () => {
      console.log('🧹 [UserLogin] Cleaning up WebSocket connection...');
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await userLogin(studentId, password);
      
      // Clear any existing data and store user data securely
      clearUserData();
      storeUserData(res.voter, 'user');
      storeRole('user');
      
      // Store userId in localStorage for fallback access
      if (res.voter && res.voter.id) {
        localStorage.setItem('userId', res.voter.id);
        console.log('User ID stored in localStorage:', res.voter.id);
      }
      
      console.log('User login successful, role: user');
      
      // Debug: Check if role was stored correctly
      const storedRole = getStoredRole();
      console.log('Stored role after login:', storedRole);
      
      setLoading(false);
      navigate('/user/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="user-login-split-container">
      {/* Left Panel: Branding & Features */}
      <div className="user-login-left-panel">
        <div className="user-login-branding">
          <div className="user-login-logo">
            <i className="fas fa-vote-yea"></i>
          </div>
          <h1 className="user-login-title">Digital System</h1>
          <p className="user-login-subtitle">Secure &bull; Transparent &bull; Reliable</p>
        </div>
        <div className="user-login-features">
          <div className="user-login-feature-item">
            <i className="fas fa-shield-alt"></i>
            <div>
              <h4>Secure Authentication</h4>
              <p>Advanced encryption and multi-factor security</p>
            </div>
          </div>
          <div className="user-login-feature-item">
            <i className="fas fa-chart-line"></i>
            <div>
              <h4>Real-time Results</h4>
              <p>Live voting statistics and instant updates</p>
            </div>
          </div>
          <div className="user-login-feature-item">
            <i className="fas fa-users"></i>
            <div>
              <h4>Multi-role Access</h4>
              <p>Super Admin, Admin, and User management</p>
            </div>
          </div>
          <div className="user-login-feature-item">
            <i className="fas fa-clock"></i>
            <div>
              <h4>24/7 Availability</h4>
              <p>Round-the-clock system access</p>
            </div>
          </div>
        </div>
      </div>
      {/* Right Panel: Login Form */}
      <div className="user-login-right-panel">
        <form className="user-login-form card-shadow" onSubmit={handleSubmit}>
          <h2>User Login</h2>
          
          {/* WebSocket Test Button */}
          <div className="d-flex justify-content-end mb-3">
            <button
              type="button"
              className="btn btn-outline-info btn-sm"
              onClick={() => {
                console.log('🧪 [UserLogin] Test button clicked');
                console.log('🔌 Socket state:', {
                  exists: !!socket,
                  connected: socket?.connected,
                  id: socket?.id,
                  readyState: socket?.readyState
                });
                if (socket && socket.connected) {
                  console.log('🧪 [UserLogin] Sending test WebSocket request...');
                  socket.emit('test-websocket');
                  setError(''); // Clear any existing errors
                  setError('Test WebSocket request sent! Check console for response.');
                  setTimeout(() => setError(''), 3000);
                } else {
                  console.error('❌ [UserLogin] WebSocket not connected');
                  setError('WebSocket not connected');
                  setTimeout(() => setError(''), 3000);
                }
              }}
              title="Test WebSocket Connection"
            >
              <i className="fas fa-wifi me-1"></i>
              Test WebSocket
            </button>
          </div>
          
          {error && <div className="user-login-error">{error}</div>}
          <div className="user-login-field">
            <label htmlFor="studentId">Student ID</label>
            <input
              type="text"
              id="studentId"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="YYYY-NNNNN"
              autoComplete="username"
              required
            />
          </div>
          <div className="user-login-field">
            <label htmlFor="password">Password</label>
            <div className="password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
            <div className="forgot-password-link">
              <button
                type="button"
                onClick={() => {
                  console.log('Forgot password button clicked');
                  navigate('/forgot-password');
                }}
                className="forgot-password-btn"
              >
                Forgot Password?
              </button>
            </div>
          </div>
          <button type="submit" className="user-login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="divider-or">or</div>
          <button
            type="button"
            className="user-register-btn"
            onClick={() => navigate('/register')}
          >
            Register as New Voter
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin; 