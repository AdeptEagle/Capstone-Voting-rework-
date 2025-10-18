import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import BCLogo from '../../assets/BCLogo.png';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Password reset requested for:', email, 'Student ID:', studentId);
    setLoading(true);
    setMessage('');
    setError('');

    try {
      console.log('Making API request to /auth/forgot-password');
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await api.post('/auth/forgot-password', {
        ResetToken_Email: email,
        userType: 'voter',
        verificationField: studentId
      }, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('API response:', response.data);
      setMessage(response.data.message);
      setIsSubmitted(true);
    } catch (error) {
      console.error('API error:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle different error response structures
      let errorMessage = 'Failed to request password reset';
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (error.response?.data) {
        // NestJS BadRequestException returns message in error.response.data.message
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      }
      
      // The backend now provides specific error messages, so we can use them directly
      
      setError(errorMessage);
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
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-id-card"></i>
                    </span>
                    <input 
                      id="studentId" 
                      name="studentId" 
                      type="text" 
                      className="form-control" 
                      placeholder="Student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                    />
                  </div>
                  <small className="form-text text-muted">
                    Your student ID is required to verify your identity for security purposes.
                  </small>
                </div>

                <div className="form-group">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-envelope"></i>
                    </span>
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      className="form-control" 
                      placeholder="Email Address"
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
