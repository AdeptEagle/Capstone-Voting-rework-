import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import BCLogo from '../../assets/BCLogo.png';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Password reset requested for:', email);
    setLoading(true);
    setMessage('');
    setError('');

    try {
      console.log('Making API request to /password-reset/forgot-password');
      const response = await api.post('/password-reset/forgot-password', {
        email,
        userType: 'voter'
      });

      console.log('API response:', response.data);
      setMessage(response.data.message);
      setIsSubmitted(true);
    } catch (error) {
      console.error('API error:', error);
      setError(error.response?.data?.error || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="forgot-password-wrapper">
            <div className="password-card">
              <div className="password-card-body">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3 className="success-title">Check your email</h3>
                <p className="success-text">
                  We've sent a password reset link to <strong className="success-email">{email}</strong>
                </p>
                <div className="success-buttons">
                  <Link to="/login" className="btn btn-primary">
                    Back to Login
                  </Link>
                  <Link to="/" className="btn btn-secondary">
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-wrapper">
          <div className="password-card">
            <div className="password-card-body">
              <div className="password-header">
                <img className="password-logo" src={BCLogo} alt="School Logo" />
                <h2 className="password-title">Reset your password</h2>
                <p className="password-subtitle">
                  Enter your email to receive a password reset link
                </p>
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="password-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-envelope"></i>
                    </span>
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      className="form-control" 
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending Request...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="password-footer">
                <p className="password-footer-text">
                  Remember your password? 
                  <Link to="/login" className="password-footer-link">Sign in</Link>
                </p>
                <div className="back-link">
                  <Link to="/">
                    <i className="fas fa-arrow-left"></i>
                    Back to home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
