import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserBallotHistory } from '../../services/api';
import './VotingHistory.css';

const VotingHistory = () => {
  const [ballotHistory, setBallotHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'pending'
  const navigate = useNavigate();

  useEffect(() => {
    fetchVotingHistory();
  }, []);

  const fetchVotingHistory = async () => {
    try {
      setLoading(true);
      const ballotHistoryData = await getUserBallotHistory();

      console.log('🎯 Ballot history:', ballotHistoryData);

      // Only show ballots the user has actually participated in
      const participatedBallots = (ballotHistoryData || []).filter(item => 
        item.UserBallotHistory_VoteCount > 0 || item.UserBallotHistory_IsCompleted
      );

      setBallotHistory(participatedBallots);

    } catch (error) {
      console.error('Error fetching voting history:', error);
      setError('Failed to load voting history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBallotStatus = (item) => {
    if (item.UserBallotHistory_IsCompleted) {
      return { status: 'completed', color: 'green', text: 'Fully Voted' };
    } else if (item.UserBallotHistory_VoteCount > 0) {
      return { status: 'pending', color: 'orange', text: 'Partially Voted' };
    } else {
      return { status: 'started', color: 'blue', text: 'Started' };
    }
  };

  const getFilteredHistory = () => {
    // Only show ballot history (ballots user has actually voted in)
    const ballotItems = ballotHistory.map(item => ({
      ...item,
      type: 'ballot',
      id: item.id,
      title: item.ballot?.Ballot_Title || 'Unknown Ballot',
      description: item.ballot?.Ballot_Description,
      startDate: item.ballot?.Ballot_StartDate,
      endDate: item.ballot?.Ballot_EndDate,
      lastAccessed: item.UserBallotHistory_LastAccessed,
      voteCount: item.UserBallotHistory_VoteCount,
      isCompleted: item.UserBallotHistory_IsCompleted
    }));

    // Apply status filter
    let filteredHistory = ballotItems;
    if (filterStatus !== 'all') {
      filteredHistory = ballotItems.filter(item => {
        if (filterStatus === 'completed') {
          return item.isCompleted;
        } else if (filterStatus === 'pending') {
          return !item.isCompleted && item.voteCount > 0;
        }
        return true;
      });
    }

    // Sort by last accessed date (most recent first)
    filteredHistory.sort((a, b) => {
      const dateA = new Date(a.lastAccessed || a.startDate);
      const dateB = new Date(b.lastAccessed || b.startDate);
      return dateB - dateA;
    });

    return filteredHistory;
  };

  const handleItemClick = (item) => {
    const status = getBallotStatus(item);
    if (status.status === 'completed') {
      navigate(`/user/ballot-results/${item.ballot.id}`);
    } else {
      navigate(`/user/vote/${item.ballot.id}`);
    }
  };

  if (loading) {
    return (
      <div className="voting-history-container">
        <div className="loading-message">
          <p>Loading voting history...</p>
        </div>
      </div>
    );
  }

  const filteredHistory = getFilteredHistory();

  return (
    <div className="voting-history-container">
      <div className="voting-history-header">
        <h1>Voting History</h1>
        <p>View ballots you have participated in and cast votes</p>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {filteredHistory.length === 0 ? (
        <div className="no-history">
          <i className="fas fa-history"></i>
          <h3>No Voting History Found</h3>
          <p>
            {filterStatus !== 'all' 
              ? 'No ballots match your current filter.' 
              : 'You haven\'t voted in any ballots yet.'
            }
          </p>
          {filterStatus === 'all' && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/user/ballot-selection')}
            >
              <i className="fas fa-vote-yea"></i>
              Start Voting
            </button>
          )}
        </div>
      ) : (
        <div className="ballots-grid">
          {filteredHistory.map((item, index) => {
            const status = getBallotStatus(item);
            
            return (
              <div 
                key={`ballot-${item.id}-${index}`} 
                className="ballot-card"
                onClick={() => handleItemClick(item)}
              >
                <div className="ballot-header">
                  <h3>{item.title}</h3>
                  <span className={`status-badge ${status.color}`}>
                    {status.text}
                  </span>
                  <span className="system-badge ballot">Ballot</span>
                </div>

                {item.description && (
                  <p className="ballot-description">{item.description}</p>
                )}

                <div className="ballot-details two-column">
                  <div className="details-row">
                    <div className="detail-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>Starts: {formatDate(item.startDate)}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-calendar-check"></i>
                      <span>Ends: {formatDate(item.endDate)}</span>
                    </div>
                  </div>
                  <div className="details-row">
                    {item.lastAccessed && (
                      <div className="detail-item">
                        <i className="fas fa-clock"></i>
                        <span>Last accessed: {formatDate(item.lastAccessed)}</span>
                      </div>
                    )}
                    {item.voteCount > 0 && (
                      <div className="detail-item">
                        <i className="fas fa-vote-yea"></i>
                        <span>{item.voteCount} vote{item.voteCount !== 1 ? 's' : ''} cast</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ballot-actions">
                  {status.status === 'completed' ? (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleItemClick(item)}
                    >
                      <i className="fas fa-chart-bar"></i>
                      View Results
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleItemClick(item)}
                    >
                      <i className="fas fa-vote-yea"></i>
                      Continue Voting
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VotingHistory;
