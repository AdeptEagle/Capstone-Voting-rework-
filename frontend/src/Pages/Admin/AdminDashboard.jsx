import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPositions, getCandidates, getVoters, getVotes, changePassword } from '../../services/api';
import { checkCurrentUser, getToken } from '../../services/auth';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPositions: 0,
    totalCandidates: 0,
    totalVoters: 0,
    totalVotes: 0,
    activeVoters: 0
  });
  const [recentData, setRecentData] = useState({
    positions: [],
    candidates: [],
    voters: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [notification, setNotification] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [positions, candidates, voters, votes] = await Promise.all([
        getPositions(),
        getCandidates(),
        getVoters(),
        getVotes()
      ]);

      setStats({
        totalPositions: positions.length,
        totalCandidates: candidates.length,
        totalVoters: voters.length,
        totalVotes: votes.length,
        activeVoters: voters.filter(voter => voter.hasVoted).length
      });

      setRecentData({
        positions: positions.slice(0, 3),
        candidates: candidates.slice(0, 3),
        voters: voters.slice(0, 3)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/admin-login');
  };

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear password error when user starts typing
    if (passwordError) {
      setPasswordError(null);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotification({
        type: 'error',
        message: 'New password and confirmation do not match'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setNotification({
        type: 'error',
        message: 'New password must be at least 6 characters long'
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setNotification({
        type: 'success',
        message: 'Password changed successfully!'
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error changing password:', error);
      let errorMessage = 'Failed to change password';
      
      // Provide more specific error messages
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('Current password is incorrect')) {
          errorMessage = 'Current password is incorrect. Please try again.';
          setPasswordError('Current password is incorrect');
        } else if (error.response.data.message.includes('User not found')) {
          errorMessage = 'User account not found. Please log in again.';
          setPasswordError('User not found');
        } else {
          errorMessage = error.response.data.message;
        }
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
    setNotification(null);
    setPasswordError(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Unified Professional Header */}
      <div className="dashboard-header-pro">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title-pro">Admin Panel</h1>
            <p className="dashboard-subtitle-pro">Welcome back, Admin! Manage your system from here.</p>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Notifications */}
      {notification && (
        <div className={`alert alert-${notification.type === 'error' ? 'danger' : notification.type} alert-dismissible fade show`} role="alert">
          <i className="fas fa-bell me-2"></i>
          {notification.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setNotification(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-2 mb-3">
          <div className="stat-card">
            <div className="stat-icon position-icon">
              <i className="fas fa-briefcase"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalPositions}</h3>
              <p>Positions</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="stat-card">
            <div className="stat-icon candidate-icon">
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalCandidates}</h3>
              <p>Candidates</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="stat-card">
            <div className="stat-icon voter-icon">
              <i className="fas fa-user-friends"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalVoters}</h3>
              <p>Voters</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="stat-card">
            <div className="stat-icon vote-icon">
              <i className="fas fa-vote-yea"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalVotes}</h3>
              <p>Votes Cast</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="stat-card">
            <div className="stat-icon active-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.activeVoters}</h3>
              <p>Voted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-primary w-100 action-btn"
                    onClick={() => navigate('/admin/positions')}
                  >
                    <i className="fas fa-briefcase me-2"></i>
                    Manage Positions
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-success w-100 action-btn"
                    onClick={() => navigate('/admin/candidates')}
                  >
                    <i className="fas fa-user-tie me-2"></i>
                    Manage Candidates
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-info w-100 action-btn"
                    onClick={() => navigate('/admin/voters')}
                  >
                    <i className="fas fa-user-friends me-2"></i>
                    Manage Voters
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-warning w-100 action-btn"
                    onClick={() => navigate('/admin/user-login-logs')}
                  >
                    <i className="fas fa-history me-2"></i>
                    User Login Logs
                  </button>
                </div>
              </div>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-secondary w-100 action-btn"
                    onClick={() => setShowSettingsModal(true)}
                  >
                    <i className="fas fa-cog me-2"></i>
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Explanations and Recent Data */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Positions Management</h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                Create and manage voting positions. Each position represents a role that candidates can run for.
              </p>
              <div className="recent-data">
                <h6>Recent Positions:</h6>
                {recentData.positions.length > 0 ? (
                  recentData.positions.map((position, index) => (
                    <div key={position.id} className="data-item">
                                              <span className="data-label">{position.Position_Title}</span>
                      <span className="data-value">Vote Limit: {position.voteLimit}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">No positions created yet.</p>
                )}
              </div>
              <button 
                className="btn btn-outline-primary btn-sm mt-2"
                onClick={() => navigate('/admin/positions')}
              >
                View All Positions
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Candidates Management</h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                Add and manage candidates for each position. Candidates are the individuals running for election.
              </p>
              <div className="recent-data">
                <h6>Recent Candidates:</h6>
                {recentData.candidates.length > 0 ? (
                  recentData.candidates.map((candidate, index) => (
                    <div key={candidate.id} className="data-item">
                                             <span className="data-label">{candidate.Candidate_Name}</span>
                      <span className="data-value">Position: {candidate.positionId}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">No candidates added yet.</p>
                )}
              </div>
              <button 
                className="btn btn-outline-primary btn-sm mt-2"
                onClick={() => navigate('/admin/candidates')}
              >
                View All Candidates
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Voters Management</h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                Register and manage voter accounts. Voters can cast their votes once per election.
              </p>
              <div className="recent-data">
                <h6>Recent Voters:</h6>
                {recentData.voters.length > 0 ? (
                  recentData.voters.map((voter, index) => (
                    <div key={voter.id} className="data-item">
                                              <span className="data-label">{voter.Voter_Name}</span>
                      <span className={`data-value ${voter.hasVoted ? 'text-success' : 'text-warning'}`}>
                        {voter.hasVoted ? 'Voted' : 'Not Voted'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">No voters registered yet.</p>
                )}
              </div>
              <button 
                className="btn btn-outline-primary btn-sm mt-2"
                onClick={() => navigate('/admin/voters')}
              >
                View All Voters
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Tips</h5>
            </div>
            <div className="card-body">
              <div className="tip-item">
                <i className="fas fa-lightbulb text-warning me-2"></i>
                <span>Create positions before adding candidates</span>
              </div>
              <div className="tip-item">
                <i className="fas fa-lightbulb text-warning me-2"></i>
                <span>Register voters early to ensure smooth voting</span>
              </div>
              <div className="tip-item">
                <i className="fas fa-lightbulb text-warning me-2"></i>
                <span>Monitor results regularly during the election</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-cog me-2"></i>
                  Account Settings
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeSettingsModal}
                ></button>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="modal-body">
                  <div className="settings-section">
                    <h6 className="mb-3">
                      <i className="fas fa-key me-2"></i>
                      Change Password
                    </h6>
                    
                    <div className="mb-3">
                      <label className="form-label">Current Password</label>
                      <div className="input-group">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <span className="input-group-text">
                          <i 
                            className={`fas ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`} 
                            onClick={() => togglePasswordVisibility('current')}
                            style={{ cursor: 'pointer' }}
                          ></i>
                        </span>
                      </div>
                      {passwordError && (
                        <div className="invalid-feedback">
                          {passwordError}
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <div className="input-group">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          className="form-control"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength="6"
                        />
                        <span className="input-group-text">
                          <i 
                            className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`} 
                            onClick={() => togglePasswordVisibility('new')}
                            style={{ cursor: 'pointer' }}
                          ></i>
                        </span>
                      </div>
                      <small className="form-text text-muted">
                        Password must be at least 6 characters long
                      </small>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Confirm New Password</label>
                      <div className="input-group">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          className="form-control"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <span className="input-group-text">
                          <i 
                            className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`} 
                            onClick={() => togglePasswordVisibility('confirm')}
                            style={{ cursor: 'pointer' }}
                          ></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeSettingsModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-1"></i>
                        Changing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-1"></i>
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Backdrop */}
      {showSettingsModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default AdminDashboard; 