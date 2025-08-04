import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVoters } from '../../services/api';
import { useElection } from '../../contexts/ElectionContext';
import './UserDashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [electionData, setElectionData] = useState({
    activeElection: null,
    hasActiveElection: false,
    canVote: false,
    canViewResults: false,
    hasAnyElection: false,
    loading: true
  });
  const navigate = useNavigate();
  
  // Temporarily disable ElectionContext to isolate the issue
  // const { activeElection, canVote, hasActiveElection, canViewResults, hasAnyElection, loading: electionLoading, triggerImmediateRefresh } = useElection();

  useEffect(() => {
    console.log('UserDashboard useEffect triggered');
    
    // Fetch user info from server since token is in HTTP-only cookie
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://localhost:3001/auth/status', {
          credentials: 'include' // Include HTTP-only cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Auth status response:', data);
          
          if (data.isAuthenticated && data.user) {
            setUser(data.user);
            setHasVoted(data.user.hasVoted);
            console.log('User data set:', data.user);
          } else {
            console.log('Not authenticated, redirecting to login');
            navigate('/user-login');
            return;
          }
        } else {
          console.log('Auth status check failed, redirecting to login');
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
  }, [navigate]);

  console.log('UserDashboard render state:', { 
    loading, 
    user, 
    hasVoted, 
    electionData 
  });

  if (loading) {
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
  if (!user || !user.name) {
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
        <h2>Welcome, {user.name}!</h2>
        <p>Your Student ID: <strong>{user.studentId}</strong></p>
      </div>

      {/* Election Status Notification */}
      <div className="election-status-notification">
        <div className="no-election-notification">
          <div className="notification-icon">
            <i className="fas fa-info-circle"></i>
          </div>
          <div className="notification-content">
            <h3>Dashboard Loaded Successfully</h3>
            <p>Welcome to your dashboard! Election features are temporarily disabled for debugging.</p>
            <div className="notification-actions">
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate('/user/candidates')}
              >
                <i className="fas fa-users me-2"></i>
                View Candidates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Action Buttons */}
      <div className="user-dashboard-actions">
        <button
          className="btn btn-outline-secondary mb-3 me-2"
          onClick={() => navigate('/user/candidates')}
        >
          <i className="fas fa-users me-2"></i>
          View Candidates
        </button>
        
        <button
          className="btn btn-outline-info mb-3"
          onClick={() => navigate('/user/results')}
        >
          <i className="fas fa-chart-bar me-2"></i>
          View Results
        </button>
      </div>
    </div>
  );
};

export default UserDashboard; 