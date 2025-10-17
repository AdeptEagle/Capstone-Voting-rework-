import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVoterHistory, getVoterBallotHistory, getVoterVotingDetails } from '../../services/api';
import './VoterHistory.css';

const VoterHistory = () => {
  const { voterId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [voterData, setVoterData] = useState(null);
  const [ballotHistory, setBallotHistory] = useState([]);
  const [votingDetails, setVotingDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (voterId) {
      fetchVoterData();
    }
  }, [voterId]);

  const fetchVoterData = async () => {
    try {
      setLoading(true);
      const [historyData, ballotData, votingData] = await Promise.all([
        getVoterHistory(voterId),
        getVoterBallotHistory(voterId),
        getVoterVotingDetails(voterId)
      ]);

      setVoterData(historyData);
      setBallotHistory(ballotData.ballotHistory);
      setVotingDetails(votingData.votingDetails);
    } catch (error) {
      console.error('Error fetching voter data:', error);
      setError('Failed to load voter history. Please try again.');
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      'ACTIVE': 'status-active',
      'ENDED': 'status-ended',
      'PAUSED': 'status-paused',
      'DRAFT': 'status-draft',
      'SCHEDULED': 'status-scheduled',
      'CANCELLED': 'status-cancelled'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-default'}`}>
        {status}
      </span>
    );
  };

  const renderOverview = () => {
    if (!voterData) return null;

    const { voter, statistics } = voterData;

    return (
      <div className="overview-section">
        <div className="voter-info-card">
          <h3>Voter Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{voter.name}</span>
            </div>
            <div className="info-item">
              <label>Student ID:</label>
              <span>{voter.studentId}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{voter.email}</span>
            </div>
            <div className="info-item">
              <label>Department:</label>
              <span>{voter.department?.Department_Name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Course:</label>
              <span>{voter.course?.Course_Name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Has Voted:</label>
              <span className={voter.hasVoted ? 'has-voted' : 'not-voted'}>
                {voter.hasVoted ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="statistics-card">
          <h3>Voting Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{statistics.totalBallotsParticipated}</div>
              <div className="stat-label">Ballots Participated</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{statistics.totalVotesCast}</div>
              <div className="stat-label">Total Votes Cast</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{statistics.participationRate.toFixed(1)}%</div>
              <div className="stat-label">Participation Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {statistics.lastVotedAt ? formatDate(statistics.lastVotedAt) : 'Never'}
              </div>
              <div className="stat-label">Last Voted</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBallotHistory = () => {
    return (
      <div className="ballot-history-section">
        <h3>Ballot Participation History</h3>
        {ballotHistory.length === 0 ? (
          <div className="no-data">No ballot participation history found.</div>
        ) : (
          <div className="ballots-grid">
            {ballotHistory.map((history, index) => (
              <div key={index} className="ballot-card">
                <div className="ballot-header">
                  <h4>{history.ballot.title}</h4>
                  <div className="ballot-badges">
                    {getStatusBadge(history.ballot.status)}
                    <span className="system-badge ballot">Ballot</span>
                  </div>
                </div>
                
                <div className="ballot-description">
                  {history.ballot.description || 'No description available'}
                </div>

                <div className="ballot-details two-column">
                  <div className="details-row">
                    <div className="detail-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>Starts: {formatDate(history.ballot.startDate)}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-calendar-check"></i>
                      <span>Ends: {formatDate(history.ballot.endDate)}</span>
                    </div>
                  </div>
                  <div className="details-row">
                    <div className="detail-item">
                      <i className="fas fa-vote-yea"></i>
                      <span>Votes: {history.participation.voteCount}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-check-circle"></i>
                      <span>Status: {history.participation.isCompleted ? 'Completed' : 'Incomplete'}</span>
                    </div>
                  </div>
                </div>

                <div className="ballot-actions">
                  <div className="participation-info">
                    <div className="participation-item">
                      <label>Voted At:</label>
                      <span>{formatDate(history.participation.votedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderVotingDetails = () => {
    return (
      <div className="voting-details-section">
        <h3>Detailed Voting Information</h3>
        {votingDetails.length === 0 ? (
          <div className="no-data">No detailed voting information found.</div>
        ) : (
          <div className="ballots-grid">
            {votingDetails.map((detail, index) => (
              <div key={index} className="ballot-card">
                <div className="ballot-header">
                  <h4>{detail.ballot.title}</h4>
                  <div className="ballot-badges">
                    {getStatusBadge(detail.ballot.status)}
                    <span className={`participation-status ${detail.participation.isCompleted ? 'completed' : 'incomplete'}`}>
                      {detail.participation.isCompleted ? 'Completed' : 'Incomplete'}
                    </span>
                  </div>
                </div>

                <div className="ballot-description">
                  {detail.ballot.description || 'No description available'}
                </div>

                <div className="ballot-details two-column">
                  <div className="details-row">
                    <div className="detail-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>Starts: {formatDate(detail.ballot.startDate)}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-calendar-check"></i>
                      <span>Ends: {formatDate(detail.ballot.endDate)}</span>
                    </div>
                  </div>
                  <div className="details-row">
                    <div className="detail-item">
                      <i className="fas fa-vote-yea"></i>
                      <span>Votes: {detail.participation.voteCount}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-clock"></i>
                      <span>Voted: {formatDate(detail.participation.votedAt)}</span>
                    </div>
                  </div>
                </div>

                {detail.votes.length > 0 && (
                  <div className="votes-details">
                    <h5>Vote Details:</h5>
                    <div className="votes-list">
                      {detail.votes.map((vote, voteIndex) => (
                        <div key={voteIndex} className="vote-item">
                          <div className="vote-candidate">
                            <strong>{vote.candidate.name}</strong>
                            <span className="candidate-id">({vote.candidate.studentId})</span>
                          </div>
                          <div className="vote-position">
                            Position: {vote.position.title}
                          </div>
                          <div className="vote-time">
                            Voted: {formatDate(vote.votedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="voter-history-container">
        <div className="loading-message">
          <p>Loading voter history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="voter-history-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => navigate('/admin/voters')} className="btn btn-secondary">
            Back to Voters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="voter-history-container">
      <div className="voter-history-header">
        <button onClick={() => navigate('/admin/voters')} className="btn btn-secondary">
          <i className="fas fa-arrow-left"></i>
          Back to Voters
        </button>
        <h1>Voter History</h1>
        {voterData && (
          <div className="voter-summary">
            <h2>{voterData.voter.name}</h2>
            <p>Student ID: {voterData.voter.studentId}</p>
          </div>
        )}
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'ballots' ? 'active' : ''}`}
          onClick={() => setActiveTab('ballots')}
        >
          Ballot History
        </button>
        <button 
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Voting Details
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'ballots' && renderBallotHistory()}
        {activeTab === 'details' && renderVotingDetails()}
      </div>
    </div>
  );
};

export default VoterHistory;