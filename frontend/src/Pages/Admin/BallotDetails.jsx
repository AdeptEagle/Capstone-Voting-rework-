import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  
  const [ballot, setBallot] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBallotData();
  }, [ballotId]);

  const fetchBallotData = async () => {
    try {
      setLoading(true);
      const [ballotData, resultsData] = await Promise.all([
        getBallotById(ballotId),
        getBallotResults(ballotId).catch(() => null) // Results might not exist yet
      ]);
      
      setBallot(ballotData);
      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching ballot data:', error);
      setError('Failed to load ballot details. Please try again.');
    } finally {
      setLoading(false);
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
      setError(`Failed to ${action} ballot. Please try again.`);
    }
  };

  const handleDeleteBallot = async () => {
    if (!window.confirm('Are you sure you want to delete this ballot? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBallot(ballotId);
      setSuccess('Ballot deleted successfully!');
      setTimeout(() => {
        navigate('/admin/ballot-management');
      }, 2000);
    } catch (error) {
      console.error('Error deleting ballot:', error);
      setError('Failed to delete ballot. Please try again.');
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

    if (ballot.Ballot_Status === 'CANCELLED') {
      return { status: 'cancelled', color: 'red', text: 'Cancelled' };
    } else if (ballot.Ballot_Status === 'ENDED') {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else if (ballot.Ballot_Status === 'PAUSED') {
      return { status: 'paused', color: 'orange', text: 'Paused' };
    } else if (now < startDate) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else if (now > endDate) {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else {
      return { status: 'active', color: 'green', text: 'Active' };
    }
  };

  const getPositionResults = (positionId) => {
    if (!results || !results.resultDetails) return [];
    
    return results.resultDetails
      .filter(detail => detail.BallotResultDetails_PositionId === positionId)
      .sort((a, b) => a.BallotResultDetails_Rank - b.BallotResultDetails_Rank);
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
        <div className="loading-spinner">
          <div className="spinner"></div>
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
          </div>
          
          {ballot.Ballot_Description && (
            <p className="ballot-description">{ballot.Ballot_Description}</p>
          )}
        </div>
        
        <div className="ballot-actions">
          {ballotStatus.status === 'upcoming' && (
            <button 
              className="btn btn-success"
              onClick={() => handleBallotAction('activate')}
            >
              <i className="fas fa-play"></i>
              Activate Ballot
            </button>
          )}

          {ballotStatus.status === 'active' && (
            <>
              <button 
                className="btn btn-warning"
                onClick={() => handleBallotAction('pause')}
              >
                <i className="fas fa-pause"></i>
                Pause Ballot
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleBallotAction('end')}
              >
                <i className="fas fa-stop"></i>
                End Ballot
              </button>
            </>
          )}

          {ballotStatus.status === 'paused' && (
            <button 
              className="btn btn-success"
              onClick={() => handleBallotAction('activate')}
            >
              <i className="fas fa-play"></i>
              Resume Ballot
            </button>
          )}

          {ballotStatus.status !== 'ended' && (
            <button 
              className="btn btn-outline"
              onClick={() => navigate(`/admin/ballot-edit/${ballotId}`)}
              title="Edit ballot"
            >
              <i className="fas fa-edit"></i>
              Edit Ballot
            </button>
          )}

          <button 
            className={`btn btn-danger ${ballotStatus.status === 'ended' ? 'disabled' : ''}`}
            onClick={() => ballotStatus.status !== 'ended' && handleDeleteBallot()}
            disabled={ballotStatus.status === 'ended'}
            title={ballotStatus.status === 'ended' ? 'Cannot delete ended ballot' : 'Delete ballot'}
          >
            <i className="fas fa-trash"></i>
            Delete Ballot
          </button>
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
            <div className="overview-grid">
              <div className="info-card">
                <h3>Ballot Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Start Date: {formatDate(ballot.Ballot_StartDate)}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-calendar-check"></i>
                    <span>End Date: {formatDate(ballot.Ballot_EndDate)}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-users"></i>
                    <span>Positions: {ballot.ballotPositions?.length || 0}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-user-tie"></i>
                    <span>Candidates: {ballot.ballotCandidates?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>Voting Rules</h3>
                <div className="info-list">
                  <div className="info-item">
                    <i className="fas fa-vote-yea"></i>
                    <span>Max Votes Per User: {ballot.Ballot_MaxVotesPerUser}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-repeat"></i>
                    <span>Allow Multiple Votes: {ballot.Ballot_AllowMultipleVotes ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-check-double"></i>
                    <span>Require All Positions: {ballot.Ballot_RequireAllPositions ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>Results Settings</h3>
                <div className="info-list">
                  <div className="info-item">
                    <i className="fas fa-eye"></i>
                    <span>Show Results: {ballot.Ballot_ShowResults ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-broadcast-tower"></i>
                    <span>Live Results: {ballot.Ballot_ShowLiveResults ? 'Yes' : 'No'}</span>
                  </div>
                  {ballot.Ballot_ShowResultsAfter && (
                    <div className="info-item">
                      <i className="fas fa-clock"></i>
                      <span>Show After: {formatDate(ballot.Ballot_ShowResultsAfter)}</span>
                    </div>
                  )}
                </div>
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
                    <span className="vote-limit">
                      Vote Limit: {ballotPosition.position.voteLimit || 1}
                    </span>
                  </div>
                  
                  {ballotPosition.position.Position_Description && (
                    <p className="position-description">
                      {ballotPosition.position.Position_Description}
                    </p>
                  )}

                  <div className="candidates-list">
                    <h4>Candidates ({ballot.ballotCandidates?.filter(bc => bc.candidate.positionId === ballotPosition.position.id).length || 0})</h4>
                    <div className="candidates-grid">
                      {ballot.ballotCandidates
                        ?.filter(bc => bc.candidate.positionId === ballotPosition.position.id)
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
            {results ? (
              <div className="results-content">
                <div className="results-summary">
                  <div className="summary-card">
                    <h3>{results.BallotResults_TotalVotes}</h3>
                    <p>Total Votes</p>
                  </div>
                  <div className="summary-card">
                    <h3>{results.BallotResults_TotalVoters}</h3>
                    <p>Total Voters</p>
                  </div>
                  <div className="summary-card">
                    <h3>{results.BallotResults_VoterTurnout.toFixed(1)}%</h3>
                    <p>Voter Turnout</p>
                  </div>
                </div>

                <div className="position-results">
                  {ballot.ballotPositions?.map(ballotPosition => {
                    const positionResults = getPositionResults(ballotPosition.position.id);
                    
                    return (
                      <div key={ballotPosition.position.id} className="position-result-card">
                        <h3>{ballotPosition.position.Position_Title}</h3>
                        
                        <div className="candidates-results">
                          {positionResults.map((result, index) => (
                            <div 
                              key={result.BallotResultDetails_CandidateId}
                              className={`candidate-result ${index === 0 ? 'winner' : ''}`}
                            >
                              <div className="candidate-rank">
                                <span className="rank-number">#{result.BallotResultDetails_Rank}</span>
                                {index === 0 && <i className="fas fa-crown winner-crown"></i>}
                              </div>
                              
                              <div className="candidate-info">
                                <h4>{getCandidateName(result.BallotResultDetails_CandidateId)}</h4>
                                <div className="vote-stats">
                                  <span className="vote-count">
                                    {result.BallotResultDetails_VoteCount} votes
                                  </span>
                                  <span className="vote-percentage">
                                    {result.BallotResultDetails_Percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              
                              <div className="vote-bar">
                                <div 
                                  className="vote-fill"
                                  style={{ 
                                    width: `${result.BallotResultDetails_Percentage}%`,
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

