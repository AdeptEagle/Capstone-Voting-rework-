import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './BallotResults.css';

const BallotResults = () => {
  const { ballotId } = useParams();
  const navigate = useNavigate();
  const [ballot, setBallot] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchBallot();
    fetchResults();
  }, [ballotId]);

  useEffect(() => {
    let interval;
    if (autoRefresh && ballot?.Ballot_Status === 'ACTIVE') {
      interval = setInterval(() => {
        fetchResults();
      }, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, ballot?.Ballot_Status]);

  const fetchBallot = async () => {
    try {
      const response = await api.get(`/ballots/${ballotId}`);
      setBallot(response.data);
    } catch (err) {
      console.error('Error fetching ballot:', err);
      setError('Failed to load ballot information');
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ballots/${ballotId}/results`);
      setResults(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getBallotStatus = () => {
    if (!ballot) return { status: 'loading', text: 'Loading...', color: 'gray' };
    
    const now = new Date();
    const startDate = new Date(ballot.Ballot_StartDate);
    const endDate = new Date(ballot.Ballot_EndDate);
    
    if (now < startDate) {
      return { status: 'scheduled', text: 'Scheduled', color: 'blue' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'active', text: 'Active', color: 'green' };
    } else {
      return { status: 'ended', text: 'Ended', color: 'red' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPositionResults = () => {
    console.log('BallotResults: getPositionResults called');
    console.log('BallotResults: results data:', results);
    
    if (!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails)) {
      console.log('BallotResults: No results data or resultDetails is not an array');
      return [];
    }
    
    // Group result details by position
    const positionGroups = {};
    
    results.results.resultDetails.forEach(detail => {
      const positionId = detail.BallotResultDetails_PositionId;
      if (!positionGroups[positionId]) {
        positionGroups[positionId] = {
          positionId: positionId,
          positionTitle: detail.position?.Position_Title || 'Unknown Position',
          candidates: []
        };
      }
      
      positionGroups[positionId].candidates.push({
        candidateId: detail.BallotResultDetails_CandidateId,
        candidateName: detail.candidate?.Candidate_Name || 'Unknown Candidate',
        voteCount: detail.BallotResultDetails_VoteCount,
        percentage: detail.BallotResultDetails_Percentage,
        rank: detail.BallotResultDetails_Rank
      });
    });
    
    // Convert to array and sort by position display order
    const positionResults = Object.values(positionGroups);
    positionResults.sort((a, b) => {
      const aOrder = results.ballotPositions?.find(p => p.BallotPosition_PositionId === a.positionId)?.BallotPosition_DisplayOrder || 0;
      const bOrder = results.ballotPositions?.find(p => p.BallotPosition_PositionId === b.positionId)?.BallotPosition_DisplayOrder || 0;
      return aOrder - bOrder;
    });
    
    console.log('BallotResults: Position results:', positionResults);
    return positionResults;
  };

  const getCandidateName = (candidateId) => {
    if (!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails)) {
      console.log('BallotResults: getCandidateName - No results data or resultDetails is not an array');
      return 'Unknown Candidate';
    }
    
    const candidateDetail = results.results.resultDetails.find(
      detail => detail.BallotResultDetails_CandidateId === candidateId
    );
    
    return candidateDetail?.candidate?.Candidate_Name || 'Unknown Candidate';
  };

  const getPositionTitle = (positionId) => {
    if (!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails)) {
      console.log('BallotResults: getPositionTitle - No results data or resultDetails is not an array');
      return 'Unknown Position';
    }
    
    const positionDetail = results.results.resultDetails.find(
      detail => detail.BallotResultDetails_PositionId === positionId
    );
    
    return positionDetail?.position?.Position_Title || 'Unknown Position';
  };

  if (loading) {
    return (
      <div className="ballot-results-container">
        <div className="loading-message">
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ballot-results-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchResults} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="ballot-results-container">
        <div className="loading-message">
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const ballotStatus = getBallotStatus();
  console.log('BallotResults: About to access results.results, results:', results);
  console.log('BallotResults: results.results type:', typeof results?.results);
  console.log('BallotResults: results.results is array:', Array.isArray(results?.results));
  
  const positionIds = (results?.results && Array.isArray(results.results)) 
    ? results.results.map(result => result.positionId) 
    : [];

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
            <h3>{results.results?.BallotResults_TotalVotes || 0}</h3>
            <p>Total Votes</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="summary-content">
            <h3>{results.results?.BallotResults_TotalVoters || 0}</h3>
            <p>Total Voters</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-percentage"></i>
          </div>
          <div className="summary-content">
            <h3>{results.results?.BallotResults_VoterTurnout?.toFixed(1) || '0.0'}%</h3>
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
        
        {!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails) || results.results.resultDetails.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-chart-bar"></i>
            <h3>No Results Yet</h3>
            <p>Results will appear here once voting begins.</p>
          </div>
        ) : (
          <div className="results-list">
            {getPositionResults().map((positionResult) => (
              <div key={positionResult.positionId} className="position-result-card">
                <h3>{positionResult.positionTitle}</h3>
                
                <div className="candidates-results">
                  {positionResult.candidates.map((result, index) => (
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
            ))}
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