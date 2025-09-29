import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableBallots, getUserBallotHistory } from '../../services/api';
import io from 'socket.io-client';
import './UserDashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const notificationTimeoutRef = useRef(null);
  
  // Ballot-focused state
  const [availableBallots, setAvailableBallots] = useState([]);
  const [votingHistory, setVotingHistory] = useState([]);
  const [ballotsLoading, setBallotsLoading] = useState(true);
  const [activeBallotsCount, setActiveBallotsCount] = useState(0);
  const [votedBallotsCount, setVotedBallotsCount] = useState(0);

  useEffect(() => {
    console.log('UserDashboard useEffect triggered');
    
    // Fetch user info and ballot data
    const fetchDashboardData = async () => {
      try {
        setBallotsLoading(true);
        
        // Fetch user info from server since token is in HTTP-only cookie
        const userResponse = await fetch('http://localhost:3001/auth/status', {
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
        
        // Fetch available ballots
        let ballots = [];
        try {
          ballots = await getAvailableBallots();
          setAvailableBallots(ballots);
        } catch (error) {
          console.error('Error fetching ballots:', error);
          setAvailableBallots([]);
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
    };

    fetchDashboardData();
  }, [navigate]);

  // WebSocket connection setup
  useEffect(() => {
    // Prevent multiple WebSocket connections
    if (socketRef.current && socketRef.current.connected) {
      console.log('🔌 [UserDashboard] WebSocket already connected, skipping setup');
      return;
    }

    console.log('🔌 [UserDashboard] Setting up WebSocket connection...');
    const newSocket = io('http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false, // Changed to false to prevent multiple connections
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Store socket in ref for cleanup
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('🔌 [UserDashboard] WebSocket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 [UserDashboard] WebSocket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ [UserDashboard] WebSocket connection error:', error);
      // Don't create multiple connections on error
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    });

    // Test event listeners
    newSocket.on('test-event', (data) => {
      console.log('🧪 [UserDashboard] Test event received:', data);
    });

    newSocket.on('test-response', (data) => {
      console.log('🧪 [UserDashboard] Test response received:', data);
    });

    // Ballot status update listeners
    newSocket.on('ballot-status-updated', (data) => {
      console.log('🗳️ [UserDashboard] Ballot status updated:', data);
      
      // Show notification to user about status change
      const statusMessages = {
        'active': '🗳️ New ballot is now OPEN for voting!',
        'paused': '⏸️ Ballot voting has been PAUSED temporarily.',
        'ended': '✅ Ballot voting has ENDED. Results are now available.',
        'draft': '📝 Ballot is in DRAFT mode.'
      };
      
      const message = statusMessages[data.status] || `Ballot status changed to: ${data.status}`;
      setNotification({
        type: 'info',
        message: message,
        timestamp: new Date()
      });
      
      // Auto-hide notification after 5 seconds
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      notificationTimeoutRef.current = setTimeout(() => setNotification(null), 5000);
    });

    // Listen for new ballots being created
    newSocket.on('ballot-created', (data) => {
      console.log('🆕 [UserDashboard] New ballot created:', data);
      // Refresh ballot data
      window.location.reload(); // Simple refresh for now
    });

    // Listen for ballot updates
    newSocket.on('ballot-updated', (data) => {
      console.log('🔄 [UserDashboard] Ballot updated:', data);
      // Refresh ballot data
      window.location.reload(); // Simple refresh for now
    });

    setSocket(newSocket);

    return () => {
      console.log('🧹 [UserDashboard] Cleaning up WebSocket connection...');
      if (newSocket && newSocket.connected) {
        newSocket.disconnect();
      }
      // Also clean up any existing socket
      if (socket && socket.connected) {
        socket.disconnect();
      }
      // Clear the ref
      socketRef.current = null;
    };
  }, []); // Remove triggerImmediateRefresh from dependencies to prevent infinite loops

  // Cleanup notification timeout when notification changes
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [notification]);

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 [UserDashboard] Component unmounting, cleaning up WebSocket...');
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (socket && socket.connected) {
        socket.disconnect();
      }
      // Clean up notification timeout
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [socket]);

  console.log('UserDashboard render state:', { 
    loading, 
    user, 
    availableBallots,
    votingHistory,
    ballotsLoading
  });

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
    console.log('No user data available, showing loading state');
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
          ) : availableBallots.filter(ballot => 
            !ballot.Ballot_IsActive && ballot.Ballot_Status !== 'ENDED'
          ).length > 0 ? (
            <div className="ballots-grid">
              {availableBallots
                .filter(ballot => !ballot.Ballot_IsActive && ballot.Ballot_Status !== 'ENDED')
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
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 