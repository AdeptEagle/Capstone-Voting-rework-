import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('AdminForgotPassword form submitted', { email });
    setLoading(true);
    setMessage('');
    setError('');

    try {
      console.log('Making API request to /password-reset/forgot-password');
      const response = await api.post('/password-reset/forgot-password', {
        email,
        userType: 'admin'
      });

      console.log('API response:', response.data);
      setMessage(response.data.message);
      setEmail('');
    } catch (error) {
      console.error('API error:', error);
      setError(error.response?.data?.error || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/admin-login');
  };

  return (
    <div className="admin-login-container">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center space-x-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="text-2xl font-bold text-indigo-700">Reset Password</h1>
          </div>
          <p className="text-gray-500 mt-2">Enter your email to receive a reset link</p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <i data-feather="check-circle" className="w-5 h-5 mr-2"></i>
            <span className="text-sm">{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <i data-feather="alert-circle" className="w-5 h-5 mr-2"></i>
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <i data-feather="mail" className="text-gray-400"></i>
              </div>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="admin@votingsystem.com" 
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              {loading ? 'Sending Request...' : 'Send Reset Link'}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center"
            >
              <i data-feather="arrow-left" className="w-4 h-4 mr-1"></i>
              Back to login
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
