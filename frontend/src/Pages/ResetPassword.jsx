import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import BCLogo from '../assets/BCLogo.png';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [userType, setUserType] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const typeParam = searchParams.get('type');
    
    if (!tokenParam || !typeParam) {
      setError('Invalid reset link. Missing token or user type.');
      setVerifying(false);
      return;
    }
    
    setToken(tokenParam);
    setUserType(typeParam);
    verifyToken(tokenParam);
  }, [searchParams]);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await api.get(`/auth/verify-token/${tokenToVerify}`);
      setTokenValid(true);
      setMessage('Token verified successfully. Please enter your new password.');
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid or expired token');
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });

      setMessage('Password reset successfully! Redirecting to login...');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        if (userType === 'ADMIN') {
          navigate('/admin-login');
        } else {
          navigate('/user-login');
        }
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (userType === 'ADMIN') {
      navigate('/admin-login');
    } else {
      navigate('/user-login');
    }
  };

  if (verifying) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-wrapper">
            <div className="reset-password-card">
              <div className="reset-password-card-body">
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <h2>Verifying Reset Link...</h2>
                  <p>Please wait while we verify your password reset link.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-wrapper">
          <div className="reset-password-card">
            <div className="reset-password-card-body">
              <div className="reset-password-header">
                <img className="reset-password-logo" src={BCLogo} alt="School Logo" />
                <h2 className="reset-password-title">Reset Password</h2>
                <p className="reset-password-subtitle">Enter your new password to complete the reset process</p>
              </div>

              {message && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle me-2"></i>
                  {message}
                </div>
              )}

              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              {tokenValid ? (
                <form onSubmit={handleSubmit} className="reset-password-form">
                  <div className="form-group">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        id="newPassword"
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        minLength="6"
                      />
                    </div>
                    <small className="form-text">
                      Password must be at least 6 characters long
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        id="confirmPassword"
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        minLength="6"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </form>
              ) : (
                <div className="invalid-token">
                  <div className="invalid-token-content">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h3>Invalid Reset Link</h3>
                    <p>The password reset link is invalid or has expired. Please request a new one.</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/forgot-password')}
                    >
                      Request New Reset Link
                    </button>
                  </div>
                </div>
              )}

              <div className="reset-password-footer">
                <div className="reset-password-links">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleBackToLogin}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back to Login
                  </button>
                  <Link to="/">
                    <i className="fas fa-home"></i>
                    Back to Home
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

export default ResetPassword; 