import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userLogin } from '../../services/api';
import { storeUserData, storeRole, clearUserData } from '../../services/auth';
import io from 'socket.io-client';
import BCLogo from '../../assets/BCLogo.png';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    schoolId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // WebSocket connection setup
  useEffect(() => {
    console.log('🔌 [LandingPage Login] Setting up WebSocket connection...');
    const newSocket = io(import.meta.env.VITE_WS_URL || 'https://backend-production-1960.up.railway.app', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    newSocket.on('connect', () => {
      console.log('🔌 [LandingPage Login] WebSocket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 [LandingPage Login] WebSocket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ [LandingPage Login] WebSocket connection error:', error);
    });

    // Election status update listeners
    newSocket.on('election-status-updated', (data) => {
      console.log('🗳️ [LandingPage Login] Election status updated:', data);
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

    setSocket(newSocket);

    return () => {
      console.log('🧹 [LandingPage Login] Cleaning up WebSocket connection...');
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) {
      e.stopImmediatePropagation();
    }
    
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (e && e.returnValue !== undefined) {
      e.returnValue = false;
    }
    
    // Basic validation before submitting
    if (!formData.schoolId.trim()) {
      setError('Please enter your Student ID.');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('Please enter your password.');
      return;
    }
    
    // Clear any previous errors
    setError('');
    setLoading(true);
    
    try {
      const res = await userLogin(formData.schoolId, formData.password);
      
      // Clear any existing data and store user data securely
      clearUserData();
      storeUserData(res.voter, 'USER');
      storeRole('USER');
      
      // Store userId in localStorage for fallback access
      if (res.voter && res.voter.id) {
        localStorage.setItem('userId', res.voter.id);
        console.log('User ID stored in localStorage:', res.voter.id);
      }
      
      setLoading(false);
      navigate('/user/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      setLoading(false);
      
      // Provide more specific error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Invalid Student ID or password. Please check your credentials and try again.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid input. Please check your Student ID format (YYYY-NNNNN).';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      
      // Clear error after 10 seconds
      setTimeout(() => {
        setError('');
      }, 10000);
    }
    
    return false;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-wrapper">
          <div className="login-card">
            <div className="login-card-body">
              <div className="login-header">
                <img className="login-logo" src={BCLogo} alt="School Logo" />
                <h2 className="login-title">Welcome back</h2>
                <p className="login-subtitle">
                  Sign in to your account to access the voting system
                </p>
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="schoolId" className="form-label">Student ID</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-id-card"></i>
                    </span>
                    <input 
                      id="schoolId" 
                      name="schoolId" 
                      type="text" 
                      className="form-control" 
                      placeholder="Enter your Student ID (YYYY-NNNNN)"
                      value={formData.schoolId}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-lock"></i>
                    </span>
                    <input 
                      id="password" 
                      name="password" 
                      type="password" 
                      className="form-control" 
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <div className="form-options">
                  <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <hr className="form-divider" />
              
              <div className="login-footer">
                <p className="login-footer-text">
                  Don't have an account? 
                  <Link to="/register" className="login-footer-link">Sign up</Link>
                </p>
              </div>
            </div>
          </div>
          
          <div className="login-links">
            <Link to="/">
              <i className="fas fa-home"></i>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;