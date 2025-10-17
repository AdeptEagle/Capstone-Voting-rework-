import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableBallots, getUpcomingBallots, getUserBallotHistory, changePassword } from '../../services/api';
import { getApiUrl } from '../../config/environment';
import './UserDashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const notificationTimeoutRef = useRef(null);
  
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
  const [passwordError, setPasswordError] = useState(null);
  
  // Ballot-focused state
  const [availableBallots, setAvailableBallots] = useState([]);
  const [upcomingBallots, setUpcomingBallots] = useState([]);
  const [votingHistory, setVotingHistory] = useState([]);
  const [ballotsLoading, setBallotsLoading] = useState(true);
  const [activeBallotsCount, setActiveBallotsCount] = useState(0);
  const [votedBallotsCount, setVotedBallotsCount] = useState(0);

  // Define fetchDashboardData outside useEffect to make it reusable
  const fetchDashboardData = useCallback(async () => {
    try {
      setBallotsLoading(true);
      
      // Fetch user info from server since token is in HTTP-only cookie
      const userResponse = await fetch(`${getApiUrl()}/auth/status`, {
        credentials: 'include'
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        if (userData.isAuthenticated && userData.user) {
          setUser(userData.user);
        } else {
          navigate('/user-login');
          return;
        }
      } else {
        navigate('/user-login');
        return;
      }
      
      // Fetch available ballots (active only)
      let ballots = [];
      try {
        ballots = await getAvailableBallots();
        setAvailableBallots(ballots);
      } catch (error) {
        console.error('Error fetching available ballots:', error);
        setAvailableBallots([]);
      }
      
      // Fetch upcoming ballots separately
      let upcoming = [];
      try {
        upcoming = await getUpcomingBallots();
        setUpcomingBallots(upcoming);
      } catch (error) {
        console.error('Error fetching upcoming ballots:', error);
        setUpcomingBallots([]);
      }
      
      // Fetch voting history
      let history = [];
      try {
        history = await getUserBallotHistory();
        setVotingHistory(history);
      } catch (error) {
        console.error('Error fetching voting history:', error);
        setVotingHistory([]);
      }
      
      // Calculate statistics
      const activeCount = ballots.filter(ballot => ballot.Ballot_IsActive).length;
      const votedCount = history.filter(h => h.UserBallotHistory_IsCompleted).length;
      
      setActiveBallotsCount(activeCount);
      setVotedBallotsCount(votedCount);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load dashboard data. Please refresh the page.'
      });
      // Set default values to prevent blue page
      setAvailableBallots([]);
      setVotingHistory([]);
      setActiveBallotsCount(0);
      setVotedBallotsCount(0);
    } finally {
      setLoading(false);
      setBallotsLoading(false);
    }
  }, []); // navigate is stable from React Router

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
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
          setPasswordError('current');
        } else if (error.response.data.message.includes('User not found')) {
          errorMessage = 'User account not found. Please log in again.';
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
    setPasswordError(null);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // Empty dependency array - only run once on mount

  // WebSocket connection setup - COMPLETELY DISABLED to fix infinite loop
  // useEffect(() => {
  //   // Prevent multiple WebSocket connections
  //   if (socketRef.current && socketRef.current.connected) {
  //     return;
  //   }

  //   const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001', {
  //     withCredentials: true,
  //     transports: ['polling', 'websocket'], // Try polling first, then websocket
  //     timeout: 10000,
  //     forceNew: false,
  //     reconnection: true,
  //     reconnectionAttempts: 3,
  //     reconnectionDelay: 2000,
  //     reconnectionDelayMax: 5000,
  //     maxReconnectionAttempts: 3,
  //   });

  // }, []); // WebSocket completely disabled to fix infinite loop

  // Debug logging removed to prevent performance issues

  if (loading) {
    return (
      <div className="user-dashboard-container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Loading...</h1>
            <p className="user-info">Setting up your dashboard</p>
          </div>
        </div>
        <div className="loading-state">
          <div className="loading-text">Loading...</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Safety check - if no user data, show loading or redirect
  if (!user) {
    return (
      <div className="user-dashboard-loading">
        <div className="loading-text">Loading...</div>
        <p className="mt-2">Loading user data...</p>
      </div>
    );
  }

  // Final safety check - if we still don't have user data, show a simple message
  if (!user || !user.Voter_Name) {
    return (
      <div className="user-dashboard-container">
        <div className="user-dashboard-loading">
          <div className="loading-text">Loading...</div>
          <p className="mt-2">Setting up your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user.Voter_Name}!</h1>
          <p className="user-info">Student ID: <strong>{user.Voter_StudentId}</strong></p>
        </div>
        
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-vote-yea"></i>
            </div>
            <div className="stat-content">
              <h3>{activeBallotsCount}</h3>
              <p>Active Ballots</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{votedBallotsCount}</h3>
              <p>Votes Cast</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-history"></i>
            </div>
            <div className="stat-content">
              <h3>{votingHistory.length}</h3>
              <p>Total Participated</p>
            </div>
          </div>
        </div>
      </div>

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

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Available Ballots Section */}
        <div className="ballots-section">
          <div className="section-header">
            <h2><i className="fas fa-vote-yea me-2"></i>Available Ballots</h2>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate('/user/ballot-selection')}
            >
              View All
            </button>
          </div>
          
          {ballotsLoading ? (
            <div className="loading-state">
              <div className="loading-text">Loading...</div>
              <p>Loading ballots...</p>
            </div>
          ) : availableBallots.length > 0 ? (
            <div className="ballots-grid">
              {availableBallots.slice(0, 3).map((ballot) => {
                const hasVoted = votingHistory.some(h => 
                  h.UserBallotHistory_BallotId === ballot.id && 
                  h.UserBallotHistory_IsCompleted
                );
                const status = ballot.Ballot_IsActive ? 'active' : 
                               ballot.Ballot_Status === 'ENDED' ? 'ended' : 'upcoming';
                
                return (
                  <div key={ballot.id} className={`ballot-card ${status}`}>
                    <div className="ballot-header">
                      <h4>{ballot.Ballot_Title}</h4>
                      <span className={`status-badge ${status}`}>
                        {status === 'active' ? 'Voting Open' : 
                         status === 'ended' ? 'Ended' : 'Upcoming'}
                      </span>
                    </div>
                    <p className="ballot-description">{ballot.Ballot_Description}</p>
                    <div className="ballot-meta">
                      <span><i className="fas fa-calendar me-1"></i>
                        {new Date(ballot.Ballot_StartDate).toLocaleDateString()}
                      </span>
                      <span><i className="fas fa-clock me-1"></i>
                        {new Date(ballot.Ballot_EndDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="ballot-actions">
                      {hasVoted ? (
                        <button 
                          className="btn btn-outline-success"
                          onClick={() => navigate(`/user/ballot-results/${ballot.id}`)}
                        >
                          <i className="fas fa-chart-bar me-1"></i>
                          View Results
                        </button>
                      ) : status === 'active' ? (
                        <button 
                          className="btn btn-primary"
                          onClick={() => navigate(`/user/vote/${ballot.id}`)}
                        >
                          <i className="fas fa-vote-yea me-1"></i>
                          Vote Now
                        </button>
                      ) : (
                        <button 
                          className="btn btn-outline-secondary"
                          disabled
                        >
                          <i className="fas fa-clock me-1"></i>
                          {status === 'ended' ? 'Voting Ended' : 'Not Started'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <h3>No Ballots Available</h3>
              <p>There are currently no ballots available for voting.</p>
            </div>
          )}
        </div>

        {/* Upcoming Ballots Section */}
        <div className="upcoming-ballots-section">
          <div className="section-header">
            <h3><i className="fas fa-calendar-plus me-2"></i>Upcoming Ballots</h3>
            <button 
              className="btn btn-outline-primary"
              onClick={() => navigate('/user/ballot-selection')}
            >
              View All
            </button>
          </div>
          
          {ballotsLoading ? (
            <div className="loading-state">
              <div className="loading-text">Loading...</div>
              <p>Loading upcoming ballots...</p>
            </div>
          ) : upcomingBallots.length > 0 ? (
            <div className="ballots-grid">
              {upcomingBallots
                .slice(0, 3)
                .map((ballot) => {
                  const hasVoted = votingHistory.some(h => 
                    h.UserBallotHistory_BallotId === ballot.id && 
                    h.UserBallotHistory_IsCompleted
                  );
                  
                  return (
                    <div key={ballot.id} className="ballot-card upcoming">
                      <div className="ballot-header">
                        <h4>{ballot.Ballot_Title}</h4>
                        <span className="status-badge upcoming">
                          Upcoming
                        </span>
                      </div>
                      <p className="ballot-description">{ballot.Ballot_Description}</p>
                      <div className="ballot-meta">
                        <span><i className="fas fa-calendar me-1"></i>
                          Starts: {new Date(ballot.Ballot_StartDate).toLocaleDateString()}
                        </span>
                        <span><i className="fas fa-clock me-1"></i>
                          Ends: {new Date(ballot.Ballot_EndDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="ballot-actions">
                        <button 
                          className="btn btn-outline-secondary"
                          disabled
                        >
                          <i className="fas fa-clock me-1"></i>
                          Not Started Yet
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-calendar-plus"></i>
              <h3>No Upcoming Ballots</h3>
              <p>There are currently no upcoming ballots scheduled.</p>
            </div>
          )}
        </div>

        {/* Voting History Section */}
        <div className="history-section">
          <div className="section-header">
            <h2><i className="fas fa-history me-2"></i>Recent Activity</h2>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate('/user/voting-history')}
            >
              View All
            </button>
          </div>
          
          {votingHistory.length > 0 ? (
            <div className="history-list">
              {votingHistory.slice(0, 3).map((history) => (
                <div key={history.id} className="history-item">
                  <div className="history-icon">
                    <i className="fas fa-check-circle text-success"></i>
                  </div>
                  <div className="history-content">
                    <h5>{history.ballot?.Ballot_Title}</h5>
                    <p>Voted on {new Date(history.UserBallotHistory_VotedAt).toLocaleDateString()}</p>
                  </div>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(`/user/ballot-results/${history.UserBallotHistory_BallotId}`)}
                  >
                    View Results
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-history"></i>
              <h3>No Voting History</h3>
              <p>You haven't participated in any ballots yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h3><i className="fas fa-bolt me-2"></i>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button
            className="quick-action-btn primary"
            onClick={() => navigate('/user/ballot-selection')}
          >
            <i className="fas fa-list-alt"></i>
            <span>All Ballots</span>
            <small>Browse all available ballots</small>
          </button>
          
          <button
            className="quick-action-btn"
            onClick={() => navigate('/user/voting-history')}
          >
            <i className="fas fa-history"></i>
            <span>Voting History</span>
            <small>View your participation</small>
          </button>
          
          <button
            className="quick-action-btn"
            onClick={() => navigate('/user/candidates')}
          >
            <i className="fas fa-users"></i>
            <span>Candidates</span>
            <small>Meet the candidates</small>
          </button>
          
          <button
            className="quick-action-btn"
            onClick={() => navigate('/user/results')}
          >
            <i className="fas fa-chart-bar"></i>
            <span>Results</span>
            <small>View election results</small>
          </button>
          
          <button
            className="quick-action-btn"
            onClick={() => setShowSettingsModal(true)}
          >
            <i className="fas fa-cog"></i>
            <span>Settings</span>
            <small>Manage your account</small>
          </button>
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
                          className={`form-control ${passwordError === 'current' ? 'is-invalid' : ''}`}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={(e) => {
                            handlePasswordChange(e);
                            if (passwordError === 'current') {
                              setPasswordError(null);
                            }
                          }}
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
                      {passwordError === 'current' && (
                        <div className="invalid-feedback">
                          Current password is incorrect
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

export default UserDashboard; 