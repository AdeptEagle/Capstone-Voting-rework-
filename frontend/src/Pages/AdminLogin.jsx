import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';
import { storeRole, clearUserData } from '../services/auth';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    // Aggressively prevent any form submission behavior
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) {
      e.stopImmediatePropagation();
    }
    
    // Prevent any default form behavior
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Return false to prevent any form submission
    if (e && e.returnValue !== undefined) {
      e.returnValue = false;
    }
    
    // Basic validation before submitting
    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const res = await adminLogin(username, password);
      
      // Clear any existing data and store role securely
      clearUserData();
      storeRole(res.admin.role);
      
      setLoading(false);
      if (res.admin.role === 'SUPERADMIN') {
        navigate('/superadmin');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setLoading(false);
      
      // Provide more specific error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password. Please check your credentials and try again.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid input. Please check your credentials.';
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
    
    // Return false to prevent any form submission
    return false;
  };

  return (
    <div className="admin-login-split-container">
      {/* Left Panel: Corporate Branding & Features */}
      <div className="admin-login-left-panel">
        <div className="admin-login-branding">
          <div className="admin-login-logo">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h1 className="admin-login-title">Admin Control Panel</h1>
          <p className="admin-login-subtitle">Professional • Secure • Efficient</p>
        </div>
        <div className="admin-login-features">
          <div className="admin-login-feature-item">
            <i className="fas fa-cogs"></i>
            <div>
              <h4>System Management</h4>
              <p>Comprehensive control over voting operations</p>
            </div>
          </div>
          <div className="admin-login-feature-item">
            <i className="fas fa-chart-bar"></i>
            <div>
              <h4>Analytics Dashboard</h4>
              <p>Real-time insights and performance metrics</p>
            </div>
          </div>
          <div className="admin-login-feature-item">
            <i className="fas fa-user-shield"></i>
            <div>
              <h4>Role-Based Access</h4>
              <p>Granular permissions and security controls</p>
            </div>
          </div>
          <div className="admin-login-feature-item">
            <i className="fas fa-database"></i>
            <div>
              <h4>Data Management</h4>
              <p>Secure handling of voter and candidate data</p>
            </div>
          </div>
        </div>
      </div>
      {/* Right Panel: Login Form */}
      <div className="admin-login-right-panel">
        <form className="admin-login-form card-shadow" onSubmit={handleSubmit}>
          <h2>Admin Login</h2>
          {error && (
            <div className="admin-login-error" style={{display: 'block', visibility: 'visible', opacity: 1}}>
              <div className="error-content">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
              <button
                type="button"
                className="error-close-btn"
                onClick={() => setError('')}
                title="Dismiss error"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          <div className="admin-login-field">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="admin-login-field">
            <label htmlFor="password">Password</label>
            <div className="password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
                  navigate('/forgot-password');
                }}
                className="forgot-password-btn"
              >
                Forgot Password?
              </button>
            </div>
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 