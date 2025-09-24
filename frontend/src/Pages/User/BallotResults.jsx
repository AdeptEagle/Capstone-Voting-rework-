import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBallotResults, getBallotById } from '../../services/api';
import './BallotResults.css';

const BallotResults = () => {
  const { ballotId } = useParams();
  const navigate = useNavigate();
  
  const [ballot, setBallot] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();
  }, [ballotId]);

  useEffect(() => {
    // Set up auto-refresh if ballot is active
    let refreshInterval;
    if (autoRefresh && ballot && ballot.Ballot_Status === 'ACTIVE') {
      refreshInterval = setInterval(() => {
        fetchResults();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, ballot]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      const [ballotData, resultsData] = await Promise.all([
        getBallotById(ballotId),
        getBallotResults(ballotId)
      ]);
      
      setBallot(ballotData);
      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching ballot data:', error);
      setError('Failed to load ballot results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      setError(''); // Clear any previous errors
      const resultsData = await getBallotResults(ballotId);
      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching results:', error);
      // Don't set error for refresh failures to avoid flickering
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

  const getBallotStatus = () => {
    if (!ballot) return { status: 'unknown', color: 'gray', text: 'Unknown' };
    
    const now = new Date();
    const startDate = new Date(ballot.Ballot_StartDate);
    const endDate = new Date(ballot.Ballot_EndDate);

    if (now < startDate) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else if (now > endDate) {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else {
      return { status: 'active', color: 'green', text: 'Active' };
    }
  };

  const getPositionResults = (positionId) => {
    if (!results || !results.results) return [];
    
    const positionResult = results.results.find(
      result => result.positionId === positionId
    );
    
    if (!positionResult) return [];
    
    return positionResult.candidates.map((candidate, index) => ({
      candidateId: candidate.candidateId,
      candidateName: candidate.candidateName,
      voteCount: candidate.voteCount,
      percentage: positionResult.totalVotes > 0 
        ? (candidate.voteCount / positionResult.totalVotes) * 100 
        : 0,
      rank: index + 1
    }));
  };

  const getCandidateName = (candidateId) => {
    if (!results || !results.results) return 'Unknown Candidate';
    
    for (const positionResult of results.results) {
      const candidate = positionResult.candidates.find(
        c => c.candidateId === candidateId
      );
      if (candidate) return candidate.candidateName;
    }
    
    return 'Unknown Candidate';
  };

  const getPositionTitle = (positionId) => {
    if (!results || !results.results) return 'Unknown Position';
    
    const positionResult = results.results.find(
      result => result.positionId === positionId
    );
    
    return positionResult ? positionResult.positionTitle : 'Unknown Position';
  };

  if (loading) {
    return (
      <div className="ballot-results-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ballot-results-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={fetchData} className="retry-btn">
            <i className="fas fa-redo"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!ballot) {
    return (
      <div className="ballot-results-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Ballot not found</span>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="ballot-results-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const ballotStatus = getBallotStatus();
  const positionIds = results?.results?.map(result => result.positionId) || [];

  return (
    <div className="ballot-results-container">
      <div className="results-header">
        <div className="header-content">
          <h1>{ballot.Ballot_Title}</h1>
          {ballot.Ballot_Description && (
            <p className="ballot-description">{ballot.Ballot_Description}</p>
          )}
          <div className="ballot-info">
            <span className={`status-badge ${ballotStatus.color}`}>
              {ballotStatus.text}
            </span>
            <span><i className="fas fa-calendar-alt"></i> Ended: {formatDate(ballot.Ballot_EndDate)}</span>
          </div>
        </div>
        
        {ballotStatus.status === 'active' && (
          <div className="auto-refresh-controls">
            <label className="refresh-toggle">
              <input 
                type="checkbox" 
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span>Auto-refresh</span>
            </label>
            <button 
              className="btn btn-outline"
              onClick={fetchResults}
            >
              <i className="fas fa-sync-alt"></i>
              Refresh Now
            </button>
          </div>
        )}
      </div>

      <div className="results-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-vote-yea"></i>
          </div>
          <div className="summary-content">
            <h3>{results.results?.reduce((total, position) => total + position.totalVotes, 0) || 0}</h3>
            <p>Total Votes</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="summary-content">
            <h3>{results.totalParticipants || 0}</h3>
            <p>Total Voters</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-percentage"></i>
          </div>
          <div className="summary-content">
            <h3>{results.totalParticipants ? ((results.results?.reduce((total, position) => total + position.totalVotes, 0) || 0) / results.totalParticipants * 100).toFixed(1) : 0}%</h3>
            <p>Voter Turnout</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="summary-content">
            <h3>{results.generatedAt ? formatDate(results.generatedAt) : 'N/A'}</h3>
            <p>Last Updated</p>
          </div>
        </div>
      </div>

      <div className="position-results">
        <h2>Results by Position</h2>
        
        {!results || !results.results || results.results.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-chart-bar"></i>
            <h3>No Results Yet</h3>
            <p>Results will appear here once voting begins.</p>
          </div>
        ) : (
          <div className="results-list">
            {results.results.map((positionResult) => {
              const positionResults = getPositionResults(positionResult.positionId);
              const positionTitle = positionResult.positionTitle;
              
              return (
                <div key={positionResult.positionId} className="position-result-card">
                  <h3>{positionTitle}</h3>
                  
                  <div className="candidates-results">
                    {positionResults.map((result, index) => (
                      <div 
                        key={result.candidateId}
                        className={`candidate-result ${index === 0 ? 'winner' : ''}`}
                      >
                        <div className="candidate-rank">
                          <span className="rank-number">#{result.rank}</span>
                          {index === 0 && <i className="fas fa-crown winner-crown"></i>}
                        </div>
                        
                        <div className="candidate-info">
                          <h4>{result.candidateName}</h4>
                          <div className="vote-stats">
                            <span className="vote-count">
                              {result.voteCount} votes
                            </span>
                            <span className="vote-percentage">
                              {result.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="vote-bar">
                          <div 
                            className="vote-fill"
                            style={{ 
                              width: `${result.percentage}%`,
                              background: index === 0 
                                ? 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="results-actions">
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/user/ballot-selection')}
        >
          <i className="fas fa-arrow-left"></i>
          Back to Ballots
        </button>
        
        {ballotStatus.status === 'active' && (
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/user/vote/${ballotId}`)}
          >
            <i className="fas fa-vote-yea"></i>
            Vote Now
          </button>
        )}
      </div>
    </div>
  );
};

export default BallotResults;

