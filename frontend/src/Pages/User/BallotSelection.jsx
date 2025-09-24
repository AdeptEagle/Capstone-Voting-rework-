import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableBallots, getUserBallotHistory, getElections } from '../../services/api';
import './BallotSelection.css';

const BallotSelection = () => {
  const [availableBallots, setAvailableBallots] = useState([]);
  const [availableElections, setAvailableElections] = useState([]);
  const [userHistory, setUserHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ballotsData, historyData, electionsData] = await Promise.all([
        getAvailableBallots(),
        getUserBallotHistory(),
        getElections()
      ]);
      
      console.log('🎯 Fetched ballots:', ballotsData);
      console.log('🗳️ Fetched elections:', electionsData);
      
      setAvailableBallots(ballotsData || []);
      setUserHistory(historyData || []);
      
      // Filter active elections for users
      const activeElections = (electionsData || []).filter(election => 
        election.isActive && 
        !election.isDeleted &&
        election.status === 'active'
      );
      setAvailableElections(activeElections);
      
      console.log('✅ Active elections for users:', activeElections);
    } catch (error) {
      console.error('Error fetching ballot data:', error);
      setError('Failed to load ballots. Please try again.');
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
    const now = new Date();
    // Handle both ballot and election formats
    const startDate = new Date(item.Ballot_StartDate || item.startDate);
    const endDate = new Date(item.Ballot_EndDate || item.endDate);

    if (now < startDate) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else if (now > endDate) {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else {
      return { status: 'active', color: 'green', text: 'Active' };
    }
  };

  const hasUserVoted = (ballotId) => {
    return userHistory.some(history => 
      history.UserBallotHistory_BallotId === ballotId && 
      history.UserBallotHistory_IsCompleted
    );
  };

  const getVoteCount = (ballotId) => {
    const history = userHistory.find(h => h.UserBallotHistory_BallotId === ballotId);
    return history ? history.UserBallotHistory_VoteCount : 0;
  };

  const handleBallotClick = (item) => {
    const itemStatus = getBallotStatus(item);
    
    if (itemStatus.status === 'upcoming') {
      setError('This election has not started yet.');
      return;
    }
    
    if (itemStatus.status === 'ended') {
      // Navigate to results - handle both ballot and election
      if (item.Ballot_Title) {
        navigate(`/user/ballot-results/${item.id}`);
      } else {
        navigate(`/user/results`); // Legacy election results
      }
      return;
    }

    // Check if user has already voted for this ballot
    if (item.Ballot_Title && hasUserVoted(item.id)) {
      // User has already voted, redirect to results
      navigate(`/user/ballot-results/${item.id}`);
      return;
    }

    // Navigate to voting page - handle both ballot and election
    if (item.Ballot_Title) {
      navigate(`/user/vote/${item.id}`);
    } else {
      navigate(`/user/vote`); // Legacy election voting
    }
  };

  const handleViewResults = (ballotId) => {
    navigate(`/user/ballot-results/${ballotId}`);
  };

  if (loading) {
    return (
      <div className="ballot-selection-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading ballots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ballot-selection-container">
      <div className="ballot-selection-header">
        <h1>Available Ballots</h1>
        <p>Select a ballot to vote or view results</p>
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

      {availableBallots.length === 0 && availableElections.length === 0 ? (
        <div className="no-ballots">
          <i className="fas fa-inbox"></i>
          <h3>No Available Elections</h3>
          <p>There are currently no active elections available for voting.</p>
        </div>
      ) : (
        <div className="ballots-grid">
          {/* Display Elections (legacy system) */}
          {availableElections.map((election) => {
            const electionStatus = getBallotStatus(election);

            return (
              <div key={`election-${election.id}`} className="ballot-card">
                <div className="ballot-header">
                  <h3>{election.Election_Title}</h3>
                  <span className={`status-badge ${electionStatus.color}`}>
                    {electionStatus.text}
                  </span>
                  <span className="system-badge">Election</span>
                </div>

                {election.Election_Description && (
                  <p className="ballot-description">{election.Election_Description}</p>
                )}

                <div className="ballot-details">
                  <div className="detail-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Starts: {formatDate(election.startDate)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar-check"></i>
                    <span>Ends: {formatDate(election.endDate)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-users"></i>
                    <span>Positions: {election.electionPositions?.length || 0}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-user-tie"></i>
                    <span>Candidates: {election.electionCandidates?.length || 0}</span>
                  </div>
                </div>

                <div className="ballot-actions">
                  <button 
                    className="vote-btn"
                    onClick={() => handleBallotClick(election)}
                  >
                    <i className="fas fa-vote-yea"></i>
                    {electionStatus.status === 'ended' ? 'View Results' : 'Vote Now'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Display Ballots (new system) */}
          {availableBallots.map((ballot) => {
            const ballotStatus = getBallotStatus(ballot);
            const userVoted = hasUserVoted(ballot.id);
            const voteCount = getVoteCount(ballot.id);

            return (
              <div key={`ballot-${ballot.id}`} className="ballot-card">
                <div className="ballot-header">
                  <h3>{ballot.Ballot_Title}</h3>
                  <span className={`status-badge ${ballotStatus.color}`}>
                    {ballotStatus.text}
                  </span>
                  <span className="system-badge ballot">Ballot</span>
                </div>

                {ballot.Ballot_Description && (
                  <p className="ballot-description">{ballot.Ballot_Description}</p>
                )}

                <div className="ballot-details">
                  <div className="detail-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Starts: {formatDate(ballot.Ballot_StartDate)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar-check"></i>
                    <span>Ends: {formatDate(ballot.Ballot_EndDate)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-users"></i>
                    <span>Positions: {ballot.ballotPositions?.length || 0}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-user-tie"></i>
                    <span>Candidates: {ballot.ballotCandidates?.length || 0}</span>
                  </div>
                </div>

                {userVoted && (
                  <div className="voting-status voted">
                    <i className="fas fa-check-circle"></i>
                    <span>You voted ({voteCount} votes)</span>
                  </div>
                )}

                <div className="ballot-actions">
                  {ballotStatus.status === 'active' && !userVoted && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleBallotClick(ballot)}
                    >
                      <i className="fas fa-vote-yea"></i>
                      Vote Now
                    </button>
                  )}

                  {ballotStatus.status === 'active' && userVoted && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleViewResults(ballot.id)}
                    >
                      <i className="fas fa-chart-bar"></i>
                      View Results
                    </button>
                  )}

                  {ballotStatus.status === 'ended' && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleViewResults(ballot.id)}
                    >
                      <i className="fas fa-chart-bar"></i>
                      View Results
                    </button>
                  )}

                  {ballotStatus.status === 'upcoming' && (
                    <button 
                      className="btn btn-disabled"
                      disabled
                    >
                      <i className="fas fa-clock"></i>
                      Not Started
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {userHistory.length > 0 && (
        <div className="voting-history">
          <h2>Your Voting History</h2>
          <div className="history-list">
            {userHistory.map((history) => (
              <div key={history.id} className="history-item">
                <div className="history-info">
                  <h4>{history.ballot?.Ballot_Title}</h4>
                  <p>Voted on: {formatDate(history.UserBallotHistory_VotedAt)}</p>
                  <p>Votes cast: {history.UserBallotHistory_VoteCount}</p>
                </div>
                <button 
                  className="btn btn-outline"
                  onClick={() => handleViewResults(history.UserBallotHistory_BallotId)}
                >
                  View Results
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BallotSelection;
