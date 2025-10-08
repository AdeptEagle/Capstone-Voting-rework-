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

  // Animate progress bars after results are loaded
  useEffect(() => {
    if (results) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        setTimeout(() => {
          const progressBars = document.querySelectorAll('.progress-fill');
          
          if (progressBars.length === 0) {
            // Retry after a longer delay
            setTimeout(() => {
              const retryBars = document.querySelectorAll('.progress-fill');
              animateProgressBars(retryBars);
            }, 2000);
            return;
          }
          
          animateProgressBars(progressBars);
        }, 500);
      });
    }
  }, [results]);

  const animateProgressBars = (bars) => {
    bars.forEach((bar) => {
      const percent = bar.getAttribute('data-percent');
      
      if (percent && percent !== '0' && percent !== '0.0') {
        // Reset to 0 first
        bar.style.width = '0%';
        bar.style.transition = 'none';
        
        // Force a reflow
        bar.offsetHeight;
        
        // Animate to target width
        setTimeout(() => {
          bar.style.transition = 'width 1s ease-in-out';
          bar.style.width = `${percent}%`;
        }, 100);
      }
    });
  };

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

    console.log('🔍 BallotResults getBallotStatus debug:', {
      ballotStatus: ballot.Ballot_Status,
      isActive: ballot.Ballot_IsActive,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      now: now.toISOString()
    });

    // Check ballot status first - this takes precedence
    if (ballot.Ballot_Status === 'CANCELLED') {
      return { status: 'cancelled', text: 'Cancelled', color: 'red' };
    } else if (ballot.Ballot_Status === 'ENDED') {
      return { status: 'ended', text: 'Ended', color: 'red' };
    } else if (ballot.Ballot_Status === 'PAUSED') {
      return { status: 'paused', text: 'Paused', color: 'orange' };
    } else if (ballot.Ballot_Status === 'ACTIVE') {
      return { status: 'active', text: 'Active', color: 'green' };
    } else if (ballot.Ballot_Status === 'DRAFT') {
      return { status: 'draft', text: 'Draft', color: 'gray' };
    } else if (ballot.Ballot_Status === 'SCHEDULED') {
      return { status: 'scheduled', text: 'Scheduled', color: 'blue' };
    }
    
    // If no specific status, check dates
    if (now < startDate) {
      return { status: 'scheduled', text: 'Scheduled', color: 'blue' };
    } else if (now > endDate) {
      return { status: 'ended', text: 'Ended', color: 'red' };
    } else {
      return { status: 'active', text: 'Active', color: 'green' };
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
    if (!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails)) {
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
    
    // Sort candidates within each position by vote count (descending) and then by candidate name (ascending)
    positionResults.forEach(position => {
      // Sort candidates by vote count (descending), then by name (ascending) for ties
      position.candidates.sort((a, b) => {
        if (b.voteCount !== a.voteCount) {
          return b.voteCount - a.voteCount;
        }
        return a.candidateName.localeCompare(b.candidateName);
      });
      
      // Assign proper ranks - handle ties correctly
      let currentRank = 1;
      let previousVoteCount = null;
      
      position.candidates.forEach((candidate, index) => {
        if (previousVoteCount !== null && candidate.voteCount !== previousVoteCount) {
          // Only increment rank when vote count changes
          currentRank = index + 1;
        }
        candidate.rank = currentRank;
        previousVoteCount = candidate.voteCount;
      });
    });
    
    positionResults.sort((a, b) => {
      const aOrder = results.ballotPositions?.find(p => p.BallotPosition_PositionId === a.positionId)?.BallotPosition_DisplayOrder || 0;
      const bOrder = results.ballotPositions?.find(p => p.BallotPosition_PositionId === b.positionId)?.BallotPosition_DisplayOrder || 0;
      return aOrder - bOrder;
    });
    
    return positionResults;
  };

  const getPositionResultsForPosition = (positionId) => {
    if (!results?.results?.resultDetails) return [];
    
    return results.results.resultDetails
      .filter(detail => detail.BallotResultDetails_PositionId === positionId)
      .map(detail => {
        const candidateName = detail.candidate?.Candidate_Name || 'Unknown Candidate';
        
        return {
          candidateId: detail.BallotResultDetails_CandidateId,
          candidateName,
          voteCount: detail.BallotResultDetails_VoteCount,
          percentage: detail.BallotResultDetails_Percentage || 0
        };
      })
      .sort((a, b) => b.voteCount - a.voteCount);
  };

  const getAverageVotesPerPosition = () => {
    if (!ballot?.ballotPositions?.length) return '0';
    const totalVotes = results.results?.BallotResults_TotalVotes || 0;
    return (totalVotes / ballot.ballotPositions.length).toFixed(1);
  };

  const getLeadingPosition = () => {
    if (!ballot?.ballotPositions?.length) return 'N/A';
    
    let maxVotes = 0;
    let leadingPosition = '';
    
    ballot.ballotPositions.forEach(position => {
      const positionResults = getPositionResultsForPosition(position.position.id);
      const totalPositionVotes = positionResults.reduce((sum, result) => sum + result.voteCount, 0);
      
      if (totalPositionVotes > maxVotes) {
        maxVotes = totalPositionVotes;
        leadingPosition = position.position.Position_Title;
      }
    });
    
    return leadingPosition || 'N/A';
  };

  const getVoteDistribution = () => {
    if (!results?.results?.resultDetails?.length) return 'N/A';
    
    const allVotes = results.results.resultDetails.map(detail => detail.BallotResultDetails_VoteCount);
    const maxVotes = Math.max(...allVotes);
    const minVotes = Math.min(...allVotes);
    const spread = maxVotes - minVotes;
    
    if (spread === 0) return 'Even';
    if (spread <= 2) return 'Close';
    if (spread <= 5) return 'Moderate';
    return 'Wide';
  };

  const getVotingActivity = () => {
    // This would ideally come from vote timestamps, but we'll simulate based on current time
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 9 && hour <= 11) return 'Morning Peak';
    if (hour >= 14 && hour <= 16) return 'Afternoon Peak';
    if (hour >= 19 && hour <= 21) return 'Evening Peak';
    return 'Off-Peak';
  };

  const getCandidateName = (candidateId) => {
    if (!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails)) {
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

  // Show loading state if ballot data is not loaded yet
  if (!ballot) {
    return (
      <div className="ballot-results-container">
        <div className="loading-message">
          <i className="fas fa-spinner fa-spin"></i>
          <h3>Loading Ballot Results...</h3>
          <p>Please wait while we fetch the ballot information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ballot-results-container">
      {/* Back to Ballots Button - Top Navigation */}
      <div className="top-navigation">
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/user/ballot-selection')}
        >
          <i className="fas fa-arrow-left"></i>
          Back to Ballots
        </button>
      </div>

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


      <div className="position-results">
        <h2>Results by Position</h2>
        
        {!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails) || results.results.resultDetails.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-chart-bar"></i>
            <h3>No Results Yet</h3>
            <p>Results will appear here once voting begins.</p>
          </div>
        ) : (
          <div className="results-content">
            {/* Results Summary */}
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
                  <h3>{results.results?.BallotResults_VoterTurnout ? results.results.BallotResults_VoterTurnout.toFixed(1) : '0.0'}%</h3>
                  <p>Voter Turnout</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="summary-content">
                  <h3>{getAverageVotesPerPosition()}</h3>
                  <p>Avg Votes/Position</p>
                </div>
              </div>
            </div>

            {/* Leading Candidates Quick Glance */}
            <div className="leading-candidates-section">
              <h3>Leading Candidates by Position</h3>
              <div className="leading-candidates-grid">
                {ballot?.ballotPositions?.map(ballotPosition => {
                  const positionResults = getPositionResultsForPosition(ballotPosition.position.id);
                  const leadingCandidate = positionResults.length > 0 ? positionResults[0] : null;
                  const totalPositionVotes = positionResults.reduce((sum, result) => sum + result.voteCount, 0);
                  
                  return (
                    <div key={ballotPosition.position.id} className="leading-candidate-card">
                      <div className="leading-candidate-header">
                        <h4>{ballotPosition.position.Position_Title}</h4>
                        <span className="total-votes">{totalPositionVotes} votes</span>
                      </div>
                      
                      {leadingCandidate ? (
                        <div className="leading-candidate-info">
                          <div className="candidate-details">
                            <div className="candidate-name">
                              <i className="fas fa-crown"></i>
                              {leadingCandidate.candidateName}
                            </div>
                            <div className="vote-stats">
                              <span className="vote-count">{leadingCandidate.voteCount} votes</span>
                              <span className="vote-percentage">{leadingCandidate.percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="no-candidates">
                          <i className="fas fa-user-slash"></i>
                          <span>No candidates yet</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Analytics Section */}
            <div className="analytics-section">
              <h3>Voting Analytics</h3>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-header">
                    <i className="fas fa-trophy"></i>
                    <h4>Leading Position</h4>
                  </div>
                  <div className="analytics-content">
                    <p className="analytics-value">{getLeadingPosition()}</p>
                    <p className="analytics-label">Most competitive race</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-header">
                    <i className="fas fa-balance-scale"></i>
                    <h4>Vote Distribution</h4>
                  </div>
                  <div className="analytics-content">
                    <p className="analytics-value">{getVoteDistribution()}</p>
                    <p className="analytics-label">Vote spread analysis</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-header">
                    <i className="fas fa-clock"></i>
                    <h4>Voting Activity</h4>
                  </div>
                  <div className="analytics-content">
                    <p className="analytics-value">{getVotingActivity()}</p>
                    <p className="analytics-label">Peak voting time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Analysis */}
            <div className="trend-analysis">
              <h3>Vote Distribution Analysis</h3>
              <div className="trend-grid">
                {ballot?.ballotPositions?.map(ballotPosition => {
                  const positionResults = getPositionResultsForPosition(ballotPosition.position.id);
                  const totalPositionVotes = positionResults.reduce((sum, result) => sum + result.voteCount, 0);
                  const maxVotes = Math.max(...positionResults.map(r => r.voteCount));
                  
                  return (
                    <div key={ballotPosition.position.id} className="trend-card">
                      <div className="trend-header">
                        <h4>{ballotPosition.position.Position_Title}</h4>
                        <span className="trend-total">{totalPositionVotes} votes</span>
                      </div>
                      <div className="trend-bars">
                        {positionResults.map((result, index) => {
                          const percentage = totalPositionVotes > 0 ? (result.voteCount / totalPositionVotes) * 100 : 0;
                          const isLeading = result.voteCount === maxVotes && maxVotes > 0;
                          
                          return (
                            <div key={result.candidateId} className="trend-bar-item">
                              <div className="candidate-info">
                                <div className="candidate-name">{result.candidateName}</div>
                                <div className="vote-stats">
                                  <span className="vote-count">{result.voteCount} votes</span>
                                  <span className="vote-percentage">{percentage.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Position Results */}
            <div className="position-results">
              <h2>Detailed Results by Position</h2>
              <div className="results-list">
                {getPositionResults().map((positionResult) => (
                  <div key={positionResult.positionId} className="position-result-card">
                    <h3>{positionResult.positionTitle}</h3>
                    
                    <div className="candidates-results">
                      {positionResult.candidates.map((result, index) => {
                        const isWinner = index === 0 && result.voteCount > 0;
                        
                        return (
                          <div 
                            key={result.candidateId}
                            className={`candidate-result-card ${isWinner ? 'winner' : ''}`}
                          >
                            <div className="candidate-header">
                              <div className="candidate-name-section">
                                {isWinner && <i className="fas fa-crown winner-crown"></i>}
                                <span className="candidate-name">{result.candidateName}</span>
                              </div>
                              <div className="vote-count-display">
                                <span className="vote-number">{result.voteCount}</span>
                                <span className="vote-label">votes</span>
                              </div>
                            </div>
                            
                            <div className="candidate-stats">
                              <div className="percentage-display">
                                <span className="percentage-number">{result.percentage.toFixed(1)}%</span>
                              </div>
                              <div className="progress-container">
                                <div className="progress-bar">
                                  <div 
                                    className="progress-fill"
                                    style={{ 
                                      width: '0%',
                                      background: isWinner ? '#10b981' : '#3b82f6'
                                    }}
                                    data-percent={result.percentage}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {ballotStatus.status === 'active' && (
        <div className="results-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/user/vote/${ballotId}`)}
          >
            <i className="fas fa-vote-yea"></i>
            Vote Now
          </button>
        </div>
      )}
    </div>
  );
};

export default BallotResults;