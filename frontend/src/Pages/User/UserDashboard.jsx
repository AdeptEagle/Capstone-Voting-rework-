import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVoters } from '../../services/api';
import { useElection } from '../../contexts/ElectionContext';
import io from 'socket.io-client';
import './UserDashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null); // Use ref to track socket connection
  const [electionData, setElectionData] = useState({
    activeElection: null,
    hasActiveElection: false,
    canVote: false,
    canViewResults: false,
    hasAnyElection: false,
    loading: true
  });
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const notificationTimeoutRef = useRef(null);
  
  // Enable ElectionContext to get real-time election data
  const { activeElection, canVote, hasActiveElection, canViewResults, hasAnyElection, loading: electionLoading, triggerImmediateRefresh } = useElection();

  useEffect(() => {
    console.log('UserDashboard useEffect triggered');
    
    // Don't trigger election refresh here - let ElectionContext handle it
    // triggerImmediateRefresh();
    // if (forceRefresh) {
    //   forceRefresh();
    // }
    
    // Fetch user info from server since token is in HTTP-only cookie
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://localhost:3001/auth/status', {
          credentials: 'include' // Include HTTP-only cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.isAuthenticated && data.user) {
            setUser(data.user);
            setHasVoted(data.user.hasVoted);
          } else {
            navigate('/user-login');
            return;
          }
        } else {
          navigate('/user-login');
          return;
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        navigate('/user-login');
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]); // Remove triggerImmediateRefresh and forceRefresh dependencies

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

    // Election status update listeners
    newSocket.on('election-status-updated', (data) => {
      console.log('🗳️ [UserDashboard] Election status updated:', data);
      // Update local election data when status changes
      setElectionData(prev => ({
        ...prev,
        activeElection: data.data,
        hasActiveElection: data.status === 'active',
        canVote: data.status === 'active',
        canViewResults: data.status === 'ended',
        loading: false
      }));
      
      // Show notification to user about status change
      const statusMessages = {
        'active': '🗳️ Voting is now OPEN! You can cast your vote.',
        'paused': '⏸️ Voting has been PAUSED temporarily.',
        'stopped': '⏹️ Voting has been STOPPED.',
        'ended': '✅ Voting has ENDED. Results are now available.',
        'draft': '📝 Election is in DRAFT mode.'
      };
      
      const message = statusMessages[data.status] || `Election status changed to: ${data.status}`;
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

    // Listen for new elections being created
    newSocket.on('election-created', (data) => {
      console.log('🆕 [UserDashboard] New election created:', data);
      // Refresh election data
      triggerImmediateRefresh();
    });

    // Listen for election updates
    newSocket.on('election-updated', (data) => {
      console.log('🔄 [UserDashboard] Election updated:', data);
      // Refresh election data
      triggerImmediateRefresh();
    });

    // Listen for election deletions
    newSocket.on('election-status-updated', (data) => {
      if (data.status === 'deleted') {
        console.log('🗑️ [UserDashboard] Election deleted:', data);
        // Clear local election data when election is deleted
        setElectionData(prev => ({
          ...prev,
          activeElection: null,
          hasActiveElection: false,
          canVote: false,
          canViewResults: false,
          loading: false
        }));
      }
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
    hasVoted, 
    electionData,
    activeElection,
    canVote,
    hasActiveElection,
    canViewResults,
    hasAnyElection,
    electionLoading
  });

  if (loading || electionLoading) {
    return (
      <div className="user-dashboard-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    );
  }

  // Safety check - if no user data, show loading or redirect
  if (!user) {
    console.log('No user data available, showing loading state');
    return (
      <div className="user-dashboard-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading user data...</p>
      </div>
    );
  }

  // Final safety check - if we still don't have user data, show a simple message
  if (!user || !user.Voter_Name) {
    return (
      <div className="user-dashboard-container">
        <div className="user-dashboard-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Setting up your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard-container">
      <div className="user-dashboard-header">
        <h2>Welcome, {user.Voter_Name}!</h2>
        <p>Your Student ID: <strong>{user.Voter_StudentId}</strong></p>
        
        {/* WebSocket Test Button */}
        <div className="d-flex justify-content-end mt-2">
          <button
            type="button"
            className="btn btn-outline-info btn-sm me-2"
            onClick={() => {
              console.log('🧪 [UserDashboard] Test button clicked');
              console.log('🔌 Socket state:', {
                exists: !!socketRef.current,
                connected: socketRef.current?.connected,
                id: socketRef.current?.id,
                readyState: socketRef.current?.readyState
              });
              if (socketRef.current && socketRef.current.connected) {
                console.log('🧪 [UserDashboard] Sending test WebSocket request...');
                socketRef.current.emit('test-websocket');
              } else {
                console.error('❌ [UserDashboard] WebSocket not connected');
              }
            }}
            title="Test WebSocket Connection"
          >
            <i className="fas fa-wifi me-1"></i>
            Test WebSocket
          </button>
          
          {/* Debug Election Context Button */}
          <button
            type="button"
            className="btn btn-outline-warning btn-sm"
            onClick={() => {
              console.log('🔍 [UserDashboard] Debug Election Context');
              console.log('Current context values:', {
                activeElection,
                canVote,
                hasActiveElection,
                canViewResults,
                hasAnyElection,
                electionLoading
              });
              console.log('🔍 [UserDashboard] This should help identify why voting section is missing');
            }}
            title="Debug Election Context"
          >
            <i className="fas fa-bug me-1"></i>
            Debug Context
          </button>
        </div>
      </div>

      {/* Real-time Election Status Notifications */}
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

      {/* Main Election Status Section */}
      <div className="election-status-section">
        {hasActiveElection && activeElection ? (
          <div className="active-election-card">
            <div className="election-header">
              <h3>🗳️ Active Election</h3>
              <span className="election-status-badge active">VOTING OPEN</span>
            </div>
            <div className="election-details">
              <h4>{activeElection.title}</h4>
              <p>{activeElection.description}</p>
              <div className="election-meta">
                <span><i className="fas fa-calendar me-2"></i>Started: {new Date(activeElection.startDate).toLocaleDateString()}</span>
                <span><i className="fas fa-clock me-2"></i>Ends: {new Date(activeElection.endDate).toLocaleDateString()}</span>
              </div>
            </div>
            
            {canVote && !hasVoted && (
              <div className="voting-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate('/user/vote')}
                >
                  <i className="fas fa-vote-yea me-2"></i>
                  Cast Your Vote Now
                </button>
                <p className="voting-note">Voting is currently open. Make sure to cast your vote before the deadline!</p>
              </div>
            )}
            
            {hasVoted && (
              <div className="voted-status">
                <div className="voted-icon">
                  <i className="fas fa-check-circle text-success"></i>
                </div>
                <h5>You have already voted!</h5>
                <p>Thank you for participating in the election.</p>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/user/results')}
                >
                  <i className="fas fa-chart-bar me-2"></i>
                  View Results
                </button>
              </div>
            )}
          </div>
        ) : hasAnyElection ? (
          <div className="no-active-election-card">
            <div className="no-election-icon">
              <i className="fas fa-clock"></i>
            </div>
            <h3>No Active Election</h3>
            <p>There is currently no active election for voting.</p>
            <div className="no-election-actions">
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate('/user/candidates')}
              >
                <i className="fas fa-users me-2"></i>
                View Candidates
              </button>
              <button
                className="btn btn-outline-info"
                onClick={() => navigate('/user/results')}
              >
                <i className="fas fa-chart-bar me-2"></i>
                View Previous Results
              </button>
            </div>
          </div>
        ) : (
          <div className="no-election-card">
            <div className="no-election-icon">
              <i className="fas fa-info-circle"></i>
            </div>
            <h3>No Elections Available</h3>
            <p>There are no elections set up at the moment.</p>
            <div className="no-election-actions">
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate('/user/candidates')}
              >
                <i className="fas fa-users me-2"></i>
                View Candidates
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button
            className="btn btn-outline-primary quick-action-btn"
            onClick={() => navigate('/user/candidates')}
          >
            <i className="fas fa-users"></i>
            <span>View Candidates</span>
          </button>
          
          <button
            className="btn btn-outline-info quick-action-btn"
            onClick={() => navigate('/user/results')}
          >
            <i className="fas fa-chart-bar"></i>
            <span>View Results</span>
          </button>
          
          {canVote && !hasVoted && hasActiveElection && (
            <button
              className="btn btn-primary quick-action-btn"
              onClick={() => navigate('/user/vote')}
            >
              <i className="fas fa-vote-yea"></i>
              <span>Vote Now</span>
            </button>
          )}
          
          {hasVoted && (
            <button
              className="btn btn-success quick-action-btn"
              onClick={() => navigate('/user/results')}
            >
              <i className="fas fa-check-circle"></i>
              <span>View Results</span>
            </button>
          )}
        </div>
      </div>

      {/* Election Information Section */}
      {activeElection && (
        <div className="election-info-section">
          <h3>Election Information</h3>
          <div className="election-info-grid">
            <div className="info-card">
              <i className="fas fa-calendar-alt"></i>
              <h5>Election Period</h5>
              <p>From {new Date(activeElection.startDate).toLocaleDateString()} to {new Date(activeElection.endDate).toLocaleDateString()}</p>
            </div>
            
            <div className="info-card">
              <i className="fas fa-users"></i>
              <h5>Positions</h5>
              <p>Multiple positions available for voting</p>
            </div>
            
            <div className="info-card">
              <i className="fas fa-shield-alt"></i>
              <h5>Security</h5>
              <p>Your vote is secure and anonymous</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard; 