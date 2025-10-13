import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/api';
import { storeRole, clearUserData } from '../../services/auth';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Initialize Feather icons
  useEffect(() => {
    const initializeIcons = () => {
      if (window.feather) {
        window.feather.replace();
      }
    };

    // Initialize immediately
    initializeIcons();

    // Re-initialize after a short delay to catch any late-rendered icons
    const timeoutId = setTimeout(initializeIcons, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const togglePassword = () => {
    setShowPassword(!showPassword);
    // Re-initialize Feather icons after state change
    setTimeout(() => {
      if (window.feather) {
        window.feather.replace();
      }
    }, 50);
  };

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

  console.log('AdminLogin component is rendering');
  
  return (
    <div className="admin-login-container">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 w-full max-w-md border border-gray-100 shadow-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-3xl font-bold text-indigo-700">BallotBlitz</h1>
          </div>
          <p className="text-gray-500 text-sm uppercase tracking-wider">Secure Admin Portal</p>
          <div className="bg-red-500 text-white p-2 mt-2 rounded">
            DEBUG: AdminLogin component is rendering
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <i data-feather="alert-triangle" className="w-5 h-5 mr-2"></i>
              <span className="text-sm">{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              <i data-feather="x" className="w-4 h-4"></i>
            </button>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <i data-feather="user" className="text-gray-400"></i>
              </div>
              <input 
                type="text" 
                id="username" 
                name="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Enter your username" 
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <i data-feather="lock" className="text-gray-400"></i>
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                name="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Enter your password" 
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
                <button
                  type="button"
                  onClick={togglePassword}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <i data-feather={showPassword ? "eye-off" : "eye"}></i>
                </button>
              </div>
            </div>
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => navigate('/admin-forgot-password')}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              {loading ? 'Authenticating...' : 'Sign In'}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
