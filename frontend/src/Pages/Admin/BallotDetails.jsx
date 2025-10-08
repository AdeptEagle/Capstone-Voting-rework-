import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  getBallotById, 
  getBallotResults,
  activateBallot, 
  pauseBallot, 
  endBallot,
  deleteBallot 
} from '../../services/api';
import './BallotDetails.css';

const BallotDetails = () => {
  const { ballotId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [ballot, setBallot] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    fetchBallotData();
    
    // Check for tab query parameter
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab && ['overview', 'positions', 'results', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }

    // Auto-refresh for ballots that might be auto-started
    const interval = setInterval(() => {
      if (ballot && (ballot.Ballot_Status === 'DRAFT' || ballot.Ballot_Status === 'SCHEDULED')) {
        console.log('🔄 Auto-refreshing ballot data for potential auto-start...');
        fetchBallotData();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [ballotId, location.search, ballot?.Ballot_Status]);

  // Real-time refresh functionality
  useEffect(() => {
    if (autoRefresh && ballot?.Ballot_Status === 'ACTIVE' && activeTab === 'results') {
      const interval = setInterval(() => {
        fetchResults();
        setLastUpdated(new Date());
      }, 5000); // Refresh every 5 seconds
      
      setRefreshInterval(interval);
      
      return () => {
        clearInterval(interval);
        setRefreshInterval(null);
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, ballot?.Ballot_Status, activeTab]);

  // Animate progress bars after results are loaded
  useEffect(() => {
    if (results && activeTab === 'results') {
      const progressBars = document.querySelectorAll('.vote-fill, .trend-bar-fill, .progress-fill');
      
      progressBars.forEach(bar => {
        const percent = bar.getAttribute('data-percent');
        bar.style.width = '0';
        
        setTimeout(() => {
          bar.style.transition = 'width 1s ease-in-out';
          bar.style.width = `${percent}%`;
        }, 100);
      });
    }
  }, [results, activeTab]);

  const fetchBallotData = async () => {
    try {
      setLoading(true);
      const [ballotData, resultsData] = await Promise.all([
        getBallotById(ballotId),
        getBallotResults(ballotId).catch((error) => {
          console.log('Results fetch failed (this is normal if results are not available):', error);
          return null; // Results might not exist yet
        })
      ]);
      
      setBallot(ballotData);
      setResults(resultsData);
      setLastUpdated(new Date());
      
      // Debug the results data
      console.log('Results data received:', resultsData);
      console.log('Results type:', typeof resultsData);
      console.log('Results results property:', resultsData?.results);
      console.log('Results results length:', resultsData?.results?.length);
    } catch (error) {
      console.error('Error fetching ballot data:', error);
      setError('Failed to load ballot details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const resultsData = await getBallotResults(ballotId);
      setResults(resultsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.log('Results fetch failed:', error);
    }
  };

  const handleBallotAction = async (action) => {
    try {
      let response;
      switch (action) {
        case 'activate':
          response = await activateBallot(ballotId);
          break;
        case 'pause':
          response = await pauseBallot(ballotId);
          break;
        case 'end':
          response = await endBallot(ballotId);
          break;
        default:
          throw new Error('Invalid action');
      }
      
      setSuccess(`Ballot ${action}d successfully!`);
      fetchBallotData();
    } catch (error) {
      console.error(`Error ${action}ing ballot:`, error);
      
      // Get more specific error message
      let errorMessage = `Failed to ${action} ballot. Please try again.`;
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = `Cannot ${action} ballot. The ballot may not be in the correct state.`;
      } else if (error.response?.status === 404) {
        errorMessage = 'Ballot not found.';
      }
      
      setError(errorMessage);
    }
  };

  const handleDeleteBallot = async () => {
    if (!window.confirm('Are you sure you want to delete this ballot? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Attempting to delete ballot:', ballotId);
      await deleteBallot(ballotId);
      setSuccess('Ballot deleted successfully!');
      setTimeout(() => {
        navigate('/admin/ballot-management');
      }, 2000);
    } catch (error) {
      console.error('🗑️ Error deleting ballot:', error);
      console.error('🗑️ Error response:', error.response);
      console.error('🗑️ Error status:', error.response?.status);
      console.error('🗑️ Error data:', error.response?.data);
      
      let errorMessage = 'Failed to delete ballot. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this ballot.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
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

    console.log('🔍 Ballot status debug:', {
      ballotStatus: ballot.Ballot_Status,
      isActive: ballot.Ballot_IsActive,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      now: now.toISOString()
    });

    // Check ballot status first - this takes precedence
    if (ballot.Ballot_Status === 'CANCELLED') {
      return { status: 'cancelled', color: 'red', text: 'Cancelled' };
    } else if (ballot.Ballot_Status === 'ENDED') {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else if (ballot.Ballot_Status === 'PAUSED') {
      return { status: 'paused', color: 'orange', text: 'Paused' };
    } else if (ballot.Ballot_Status === 'ACTIVE') {
      return { status: 'active', color: 'green', text: 'Active' };
    } else if (ballot.Ballot_Status === 'DRAFT') {
      return { status: 'draft', color: 'gray', text: 'Draft' };
    } else if (ballot.Ballot_Status === 'SCHEDULED') {
      return { status: 'scheduled', color: 'blue', text: 'Scheduled' };
    }
    
    // If no specific status, check dates
    if (now < startDate) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else if (now > endDate) {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else {
      return { status: 'active', color: 'green', text: 'Active' };
    }
  };

  const getPositionResults = (positionId) => {
    if (!results || !results.results?.resultDetails) return [];
    
    return results.results.resultDetails
      .filter(detail => detail.BallotResultDetails_PositionId === positionId)
      .sort((a, b) => a.BallotResultDetails_Rank - b.BallotResultDetails_Rank);
  };

  // Analytics functions
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
      const positionResults = getPositionResults(position.position.id);
      const totalPositionVotes = positionResults.reduce((sum, result) => sum + result.BallotResultDetails_VoteCount, 0);
      
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
    if (!ballot || !ballot.ballotCandidates) return 'Unknown Candidate';
    
    const ballotCandidate = ballot.ballotCandidates.find(
      bc => bc.candidate.id === candidateId
    );
    
    return ballotCandidate ? ballotCandidate.candidate.Candidate_Name : 'Unknown Candidate';
  };

  if (loading) {
    return (
      <div className="ballot-details-container">
        <div className="loading-message">
          <p>Loading ballot details...</p>
        </div>
      </div>
    );
  }

  if (error && !ballot) {
    return (
      <div className="ballot-details-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => navigate('/admin/ballot-management')} className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i>
            Back to Ballots
          </button>
        </div>
      </div>
    );
  }

  if (!ballot) {
    return (
      <div className="ballot-details-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Ballot not found</span>
        </div>
      </div>
    );
  }

  const ballotStatus = getBallotStatus();

  return (
    <div className="ballot-details-container">
      <div className="ballot-details-header">
        <div className="header-content">
          <button 
            className="btn btn-outline back-btn"
            onClick={() => navigate('/admin/ballot-management')}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Ballots
          </button>
          
          <div className="ballot-title-section">
            <h1>{ballot.Ballot_Title}</h1>
            <span className={`status-badge ${ballotStatus.color}`}>
              {ballotStatus.text}
            </span>
            <button 
              className="btn btn-outline btn-sm refresh-btn"
              onClick={fetchBallotData}
              title="Refresh ballot data"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
          
          {ballot.Ballot_Description && (
            <p className="ballot-description">{ballot.Ballot_Description}</p>
          )}
        </div>
        
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-info-circle"></i>
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'positions' ? 'active' : ''}`}
          onClick={() => setActiveTab('positions')}
        >
          <i className="fas fa-user-tie"></i>
          Positions & Candidates
        </button>
        <button 
          className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <i className="fas fa-chart-bar"></i>
          Results
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <i className="fas fa-cog"></i>
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-content">
              {/* Ballot Information Card */}
              <div className="info-card">
                <div className="info-card-header">
                  <h3>Ballot Information</h3>
                </div>
                <div className="info-card-content">
                  <div className="info-grid">
                    <div className="info-column">
                      <div className="info-field">
                        <p className="info-label">Start Date</p>
                        <p className="info-value">{formatDate(ballot.Ballot_StartDate)}</p>
                      </div>
                      <div className="info-field">
                        <p className="info-label">End Date</p>
                        <p className="info-value">{formatDate(ballot.Ballot_EndDate)}</p>
                      </div>
                    </div>
                    <div className="info-column">
                      <div className="info-field">
                        <p className="info-label">Positions</p>
                        <p className="info-value">{ballot.ballotPositions?.length || 0}</p>
                      </div>
                      <div className="info-field">
                        <p className="info-label">Candidates</p>
                        <p className="info-value">{ballot.ballotCandidates?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voting Rules Card */}
              <div className="info-card">
                <div className="info-card-header">
                  <h3>Voting Rules</h3>
                </div>
                <div className="info-card-content">
                  <div className="info-grid">
                    <div className="info-column">
                      <div className="info-field">
                        <p className="info-label">Max Votes Per User</p>
                        <p className="info-value">{ballot.Ballot_MaxVotesPerUser}</p>
                      </div>
                      <div className="info-field">
                        <p className="info-label">Allow Multiple Votes</p>
                        <p className="info-value">{ballot.Ballot_AllowMultipleVotes ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <div className="info-column">
                      <div className="info-field">
                        <p className="info-label">Require All Positions</p>
                        <p className="info-value">{ballot.Ballot_RequireAllPositions ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Settings Card */}
              <div className="info-card">
                <div className="info-card-header">
                  <h3>Results Settings</h3>
                </div>
                <div className="info-card-content">
                  <div className="info-grid">
                    <div className="info-column">
                      <div className="info-field">
                        <p className="info-label">Show Results</p>
                        <p className="info-value">{ballot.Ballot_ShowResults ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="info-field">
                        <p className="info-label">Live Results</p>
                        <p className="info-value">{ballot.Ballot_ShowLiveResults ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    {ballot.Ballot_ShowResultsAfter && (
                      <div className="info-column">
                        <div className="info-field">
                          <p className="info-label">Show After</p>
                          <p className="info-value">{formatDate(ballot.Ballot_ShowResultsAfter)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons-section">
                {(ballotStatus.status === 'upcoming' || ballotStatus.status === 'draft') && (
                  <button 
                    className="btn btn-success action-btn"
                    onClick={() => handleBallotAction('activate')}
                  >
                    <i className="fas fa-play"></i>
                    Activate Ballot
                  </button>
                )}

                {ballotStatus.status === 'active' && (
                  <>
                    <button 
                      className="btn btn-warning action-btn"
                      onClick={() => handleBallotAction('pause')}
                    >
                      <i className="fas fa-pause"></i>
                      Pause Ballot
                    </button>
                    <button 
                      className="btn btn-danger action-btn"
                      onClick={() => handleBallotAction('end')}
                    >
                      <i className="fas fa-stop"></i>
                      End Ballot
                    </button>
                  </>
                )}

                {ballotStatus.status === 'paused' && (
                  <>
                    <button 
                      className="btn btn-success action-btn"
                      onClick={() => handleBallotAction('activate')}
                    >
                      <i className="fas fa-play"></i>
                      Resume Ballot
                    </button>
                    <button 
                      className="btn btn-danger action-btn"
                      onClick={() => handleBallotAction('end')}
                    >
                      <i className="fas fa-stop"></i>
                      End Ballot
                    </button>
                  </>
                )}
                
                {ballotStatus.status !== 'ended' && (
                  <button 
                    className="btn btn-primary action-btn"
                    onClick={() => navigate(`/admin/ballot-edit/${ballotId}`)}
                  >
                    <i className="fas fa-edit"></i>
                    Edit Ballot
                  </button>
                )}
                
                <button 
                  className="btn btn-danger action-btn"
                  onClick={() => handleDeleteBallot()}
                >
                  <i className="fas fa-trash"></i>
                  Delete Ballot
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="positions-tab">
            <div className="positions-list">
              {ballot.ballotPositions?.map((ballotPosition, index) => (
                <div key={ballotPosition.position.id} className="position-card">
                  <div className="position-header">
                    <h3>{ballotPosition.position.Position_Title}</h3>
                    <div className="position-header-right">
                      <span className="vote-limit-text">
                        Vote Limit: {ballotPosition.position.voteLimit || 1}
                      </span>
                      <span className="status-badge active">
                        Active
                      </span>
                    </div>
                  </div>
                  
                  {ballotPosition.position.Position_Description && (
                    <p className="position-description">
                      {ballotPosition.position.Position_Description}
                    </p>
                  )}

                  <div className="candidates-list">
                    <h4>Candidates ({ballot.ballotCandidates?.filter(bc => bc.BallotCandidate_PositionId === ballotPosition.position.id).length || 0})</h4>
                    <div className="candidates-grid">
                      {ballot.ballotCandidates
                        ?.filter(bc => bc.BallotCandidate_PositionId === ballotPosition.position.id)
                        .map(bc => (
                          <div key={bc.candidate.id} className="candidate-item">
                            <div className="candidate-info">
                              <h5>{bc.candidate.Candidate_Name}</h5>
                              <p>{bc.candidate.Candidate_StudentId}</p>
                              {bc.candidate.manifesto && (
                                <p className="manifesto">{bc.candidate.manifesto}</p>
                              )}
                            </div>
                            <div className="candidate-status">
                              <span className={`status ${bc.BallotCandidate_IsActive ? 'active' : 'inactive'}`}>
                                {bc.BallotCandidate_IsActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="results-tab">
            {/* Real-time Controls */}
            <div className="realtime-controls">
              <div className="realtime-header">
                <h3>Live Results</h3>
                <div className="realtime-status">
                  {autoRefresh ? (
                    <span className="status-indicator live">
                      <i className="fas fa-circle"></i>
                      Live Updates
                    </span>
                  ) : (
                    <span className="status-indicator paused">
                      <i className="fas fa-pause-circle"></i>
                      Paused
                    </span>
                  )}
                </div>
              </div>
              
              <div className="realtime-actions">
                <button 
                  className={`realtime-btn ${autoRefresh ? 'active' : ''}`}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  disabled={ballot?.Ballot_Status !== 'ACTIVE'}
                >
                  <i className={`fas ${autoRefresh ? 'fa-pause' : 'fa-play'}`}></i>
                  {autoRefresh ? 'Pause Updates' : 'Start Live Updates'}
                </button>
                
                <button 
                  className="realtime-btn refresh-btn"
                  onClick={fetchResults}
                >
                  <i className="fas fa-sync-alt"></i>
                  Refresh Now
                </button>
                
                {lastUpdated && (
                  <div className="last-updated">
                    <i className="fas fa-clock"></i>
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            {results ? (
              <div className="results-content">
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
                    {ballot.ballotPositions?.map(ballotPosition => {
                      const positionResults = getPositionResults(ballotPosition.position.id);
                      const leadingCandidate = positionResults.length > 0 ? positionResults[0] : null;
                      const totalPositionVotes = positionResults.reduce((sum, result) => sum + result.BallotResultDetails_VoteCount, 0);
                      
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
                                  {getCandidateName(leadingCandidate.BallotResultDetails_CandidateId)}
                                </div>
                                <div className="vote-stats">
                                  <span className="vote-count">{leadingCandidate.BallotResultDetails_VoteCount} votes</span>
                                  <span className="vote-percentage">
                                    {leadingCandidate.BallotResultDetails_Percentage ? leadingCandidate.BallotResultDetails_Percentage.toFixed(1) : '0.0'}%
                                  </span>
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
                    {ballot.ballotPositions?.map(ballotPosition => {
                      const positionResults = getPositionResults(ballotPosition.position.id);
                      const totalPositionVotes = positionResults.reduce((sum, result) => sum + result.BallotResultDetails_VoteCount, 0);
                      const maxVotes = Math.max(...positionResults.map(r => r.BallotResultDetails_VoteCount));
                      
                      return (
                        <div key={ballotPosition.position.id} className="trend-card">
                          <div className="trend-header">
                            <h4>{ballotPosition.position.Position_Title}</h4>
                            <span className="trend-total">{totalPositionVotes} votes</span>
                          </div>
                          <div className="trend-bars">
                            {positionResults.map((result, index) => {
                              const percentage = totalPositionVotes > 0 ? (result.BallotResultDetails_VoteCount / totalPositionVotes) * 100 : 0;
                              const isLeading = result.BallotResultDetails_VoteCount === maxVotes && maxVotes > 0;
                              
                              return (
                                <div key={result.BallotResultDetails_CandidateId} className="trend-bar-item">
                                  <div className="candidate-info">
                                    <div className="candidate-name">{getCandidateName(result.BallotResultDetails_CandidateId)}</div>
                                    <div className="vote-stats">
                                      <span className="vote-count">{result.BallotResultDetails_VoteCount} votes</span>
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

                <div className="position-results">
                  {ballot.ballotPositions?.map(ballotPosition => {
                    const positionResults = getPositionResults(ballotPosition.position.id);
                    
                    return (
                      <div key={ballotPosition.position.id} className="position-result-card">
                        <h3>{ballotPosition.position.Position_Title}</h3>
                        
                        <div className="candidates-results">
                          {positionResults.map((result, index) => {
                            const isWinner = index === 0 && result.BallotResultDetails_VoteCount > 0;
                            const percentage = result.BallotResultDetails_Percentage || 0;
                            
                            return (
                              <div 
                                key={result.BallotResultDetails_CandidateId}
                                className={`candidate-result-card ${isWinner ? 'winner' : ''}`}
                              >
                                <div className="candidate-header">
                                  <div className="candidate-name-section">
                                    {isWinner && <i className="fas fa-crown winner-crown"></i>}
                                    <span className="candidate-name">{getCandidateName(result.BallotResultDetails_CandidateId)}</span>
                                  </div>
                                  <div className="vote-count-display">
                                    <span className="vote-number">{result.BallotResultDetails_VoteCount}</span>
                                    <span className="vote-label">votes</span>
                                  </div>
                                </div>
                                
                                <div className="candidate-stats">
                                  <div className="percentage-display">
                                    <span className="percentage-number">{percentage.toFixed(1)}%</span>
                                  </div>
                                  <div className="progress-container">
                                    <div className="progress-bar">
                                      <div 
                                        className="progress-fill"
                                        style={{ 
                                          width: '0%',
                                          background: isWinner ? '#10b981' : '#3b82f6'
                                        }}
                                        data-percent={percentage}
                                      ></div>
                                    </div>
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
            ) : (
              <div className="no-results">
                <i className="fas fa-chart-bar"></i>
                <h3>No Results Yet</h3>
                <p>Results will appear here once voting begins and votes are cast.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <div className="settings-grid">
              <div className="setting-card">
                <h3>Ballot Configuration</h3>
                <div className="setting-item">
                  <label>Ballot Title</label>
                  <input type="text" value={ballot.Ballot_Title} readOnly />
                </div>
                <div className="setting-item">
                  <label>Description</label>
                  <textarea value={ballot.Ballot_Description || ''} readOnly />
                </div>
                <div className="setting-item">
                  <label>Start Date</label>
                  <input type="datetime-local" value={new Date(ballot.Ballot_StartDate).toISOString().slice(0, 16)} readOnly />
                </div>
                <div className="setting-item">
                  <label>End Date</label>
                  <input type="datetime-local" value={new Date(ballot.Ballot_EndDate).toISOString().slice(0, 16)} readOnly />
                </div>
              </div>

              <div className="setting-card">
                <h3>Voting Rules</h3>
                <div className="setting-item">
                  <label>Max Votes Per User</label>
                  <input type="number" value={ballot.Ballot_MaxVotesPerUser} readOnly />
                </div>
                <div className="setting-item">
                  <label>Allow Multiple Votes</label>
                  <input type="checkbox" checked={ballot.Ballot_AllowMultipleVotes} readOnly />
                </div>
                <div className="setting-item">
                  <label>Require All Positions</label>
                  <input type="checkbox" checked={ballot.Ballot_RequireAllPositions} readOnly />
                </div>
              </div>

              <div className="setting-card">
                <h3>Results Configuration</h3>
                <div className="setting-item">
                  <label>Show Results</label>
                  <input type="checkbox" checked={ballot.Ballot_ShowResults} readOnly />
                </div>
                <div className="setting-item">
                  <label>Show Live Results</label>
                  <input type="checkbox" checked={ballot.Ballot_ShowLiveResults} readOnly />
                </div>
                {ballot.Ballot_ShowResultsAfter && (
                  <div className="setting-item">
                    <label>Show Results After</label>
                    <input type="datetime-local" value={new Date(ballot.Ballot_ShowResultsAfter).toISOString().slice(0, 16)} readOnly />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BallotDetails;

