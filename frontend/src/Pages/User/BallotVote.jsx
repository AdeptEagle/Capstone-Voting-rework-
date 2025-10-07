import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBallotById, createBallotVote, getUserBallotHistory } from '../../services/api';
import { getCandidatePhotoUrl, CandidatePhotoPlaceholder } from '../../utils/image.jsx';
import './BallotVote.css';

// Simple UUID generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const BallotVote = () => {
  const { ballotId } = useParams();
  const navigate = useNavigate();
  
  const [ballot, setBallot] = useState(null);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [abstainedPositions, setAbstainedPositions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showIdConfirmation, setShowIdConfirmation] = useState(false);
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [idConfirmation, setIdConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVoteSummary, setShowVoteSummary] = useState(false);
  const [imgError, setImgError] = useState({});

  useEffect(() => {
    fetchBallotData();
  }, [ballotId]);

  const fetchBallotData = async () => {
    try {
      setLoading(true);
      
      // Check if user has already voted for this ballot
      const userHistory = await getUserBallotHistory();
      const hasVoted = userHistory.some(history => 
        history.UserBallotHistory_BallotId === ballotId && 
        history.UserBallotHistory_IsCompleted
      );
      
      if (hasVoted) {
        setError('You have already voted for this ballot. Redirecting to results...');
        setTimeout(() => {
          console.log('BallotVote: Auto-redirecting to results with ballotId:', ballotId);
          navigate(`/user/ballot-results/${ballotId}`);
        }, 2000);
        return;
      }
      
      const ballotData = await getBallotById(ballotId);
      setBallot(ballotData);
      
      // Initialize selected votes for each position
      const initialVotes = {};
      ballotData.ballotPositions.forEach(position => {
        initialVotes[position.position.id] = [];
      });
      setSelectedVotes(initialVotes);
    } catch (error) {
      console.error('Error fetching ballot data:', error);
      setError('Failed to load ballot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = () => {
    if (!ballot || !ballot.ballotPositions) return null;
    return ballot.ballotPositions[currentPositionIndex]?.position;
  };

  const getCurrentPositionCandidates = () => {
    if (!ballot || !ballot.ballotCandidates) return [];
    const currentPosition = getCurrentPosition();
    if (!currentPosition) return [];
    
    return ballot.ballotCandidates.filter(
      bc => bc.candidate.positionId === currentPosition.id
    ).map(bc => bc.candidate);
  };

  const getPositionVoteLimit = (position) => {
    return position.voteLimit || 1;
  };

  const handleCandidateSelect = (candidateId) => {
    const currentPosition = getCurrentPosition();
    if (!currentPosition) return;

    const positionId = currentPosition.id;
    const voteLimit = getPositionVoteLimit(currentPosition);
    const currentVotes = selectedVotes[positionId] || [];

    // Clear abstention when selecting a candidate
    setAbstainedPositions(prev => {
      const newSet = new Set(prev);
      newSet.delete(positionId);
      return newSet;
    });

    if (currentVotes.includes(candidateId)) {
      // Remove candidate from selection
      setSelectedVotes(prev => ({
        ...prev,
        [positionId]: currentVotes.filter(id => id !== candidateId)
      }));
    } else if (currentVotes.length < voteLimit) {
      // Add candidate to selection
      setSelectedVotes(prev => ({
        ...prev,
        [positionId]: [...currentVotes, candidateId]
      }));
    } else {
      // Replace the first selected candidate
      setSelectedVotes(prev => ({
        ...prev,
        [positionId]: [candidateId, ...currentVotes.slice(1)]
      }));
    }
  };

  const handleAbstain = () => {
    const currentPosition = getCurrentPosition();
    if (!currentPosition) return;

    const positionId = currentPosition.id;
    
    // Clear any selected votes for this position
    setSelectedVotes(prev => ({
      ...prev,
      [positionId]: []
    }));

    // Toggle abstention
    setAbstainedPositions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(positionId)) {
        newSet.delete(positionId);
      } else {
        newSet.add(positionId);
      }
      return newSet;
    });
  };

  const isCandidateSelected = (candidateId) => {
    const currentPosition = getCurrentPosition();
    if (!currentPosition) return false;
    return (selectedVotes[currentPosition.id] || []).includes(candidateId);
  };

  const isPositionAbstained = () => {
    const currentPosition = getCurrentPosition();
    if (!currentPosition) return false;
    return abstainedPositions.has(currentPosition.id);
  };

  const canProceed = () => {
    const currentPosition = getCurrentPosition();
    if (!currentPosition) return false;
    
    const votesForPosition = selectedVotes[currentPosition.id] || [];
    const voteLimit = getPositionVoteLimit(currentPosition);
    const isAbstained = abstainedPositions.has(currentPosition.id);
    
    // If position is abstained, always allow proceeding
    if (isAbstained) {
      return true;
    }
    
    // Check if ballot requires all positions to be voted
    if (ballot.Ballot_RequireAllPositions) {
      return votesForPosition.length === voteLimit;
    } else {
      return votesForPosition.length > 0;
    }
  };

  const handleNext = () => {
    if (currentPositionIndex < ballot.ballotPositions.length - 1) {
      setCurrentPositionIndex(prev => prev + 1);
    } else {
      setShowVoteSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(prev => prev - 1);
    }
  };

  const handleSubmitVote = async () => {
    try {
      setSubmitting(true);
      setError('');

      // Prepare vote data
      const votes = [];
      Object.entries(selectedVotes).forEach(([positionId, candidateIds]) => {
        candidateIds.forEach(candidateId => {
          votes.push({
            positionId: positionId,
            candidateId: candidateId
          });
        });
      });

      // Submit votes with ballot context
      const voteData = {
        ballotId: ballotId,
        votes: votes,
        ipAddress: null, // Could be added if needed
        userAgent: navigator.userAgent,
        sessionId: null // Could be added if needed
      };

      await createBallotVote(voteData);
      
      setSuccess('Your vote has been submitted successfully!');
      setShowFinalScreen(true);
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      
      if (error.response?.status === 409) {
        setError('You have already voted for this ballot.');
        setShowFinalScreen(true);
      } else if (error.response?.status === 400) {
        setError('Invalid vote data. Please check your selections and try again.');
      } else {
        setError('Failed to submit vote. Please try again.');
      }
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="ballot-vote-container">
        <div className="loading-message">
          <p>Loading ballot...</p>
        </div>
      </div>
    );
  }

  if (!ballot) {
    return (
      <div className="ballot-vote-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Ballot not found</span>
        </div>
      </div>
    );
  }

  if (showFinalScreen) {
    const hasAlreadyVoted = error.includes('already voted');
    
    return (
      <div className="ballot-vote-container">
        <div className="success-screen">
          <div className="success-icon">
            <i className={`fas ${hasAlreadyVoted ? 'fa-info-circle' : 'fa-check-circle'}`}></i>
          </div>
          <h2>{hasAlreadyVoted ? 'Already Voted' : 'Vote Submitted Successfully!'}</h2>
          <p>{hasAlreadyVoted ? 'You have already voted for this ballot.' : `Thank you for participating in ${ballot.Ballot_Title}`}</p>
          <p>What would you like to do next?</p>
          
          <div className="navigation-options">
            <button 
              className="btn btn-primary"
              onClick={() => {
                console.log('BallotVote: Navigating to results with ballotId:', ballotId);
                navigate(`/user/ballot-results/${ballotId}`);
              }}
            >
              <i className="fas fa-chart-bar"></i>
              View Results
            </button>
            
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/user/dashboard')}
            >
              <i className="fas fa-home"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showVoteSummary) {
    return (
      <div className="ballot-vote-container">
        <div className="vote-summary">
          <h2>Review Your Votes</h2>
          <p>Please review your selections before submitting:</p>
          
          <div className="summary-list">
            {ballot.ballotPositions.map((ballotPosition, index) => {
              const position = ballotPosition.position;
              const isAbstained = abstainedPositions.has(position.id);
              const selectedCandidates = (selectedVotes[position.id] || [])
                .map(candidateId => 
                  ballot.ballotCandidates.find(bc => bc.candidate.id === candidateId)?.candidate
                )
                .filter(Boolean);
              
              return (
                <div key={position.id} className="summary-item">
                  <h4>{position.Position_Title}</h4>
                  <div className="selected-candidates">
                    {isAbstained ? (
                      <div className="abstain-summary">
                        <i className="fas fa-minus-circle"></i>
                        <span>Abstained (No vote cast)</span>
                      </div>
                    ) : selectedCandidates.length > 0 ? (
                      selectedCandidates.map(candidate => (
                        <div key={candidate.id} className="candidate-summary">
                          <img 
                            src={getCandidatePhotoUrl(candidate.photo)}
                            alt={candidate.Candidate_Name}
                            onError={() => setImgError(prev => ({ ...prev, [candidate.id]: true }))}
                          />
                          <span>{candidate.Candidate_Name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="no-selection">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>No selection made</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="summary-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowVoteSummary(false)}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Voting
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSubmitVote}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="loading-text">Loading...</div>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-vote-yea"></i>
                  Submit Vote
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPosition = getCurrentPosition();
  const candidates = getCurrentPositionCandidates();
  const voteLimit = getPositionVoteLimit(currentPosition);

  return (
    <div className="ballot-vote-container">
      <div className="ballot-header">
        <h1>{ballot.Ballot_Title}</h1>
        {ballot.Ballot_Description && (
          <p className="ballot-description">{ballot.Ballot_Description}</p>
        )}
        <div className="ballot-info">
          <span><i className="fas fa-calendar-alt"></i> Ends: {formatDate(ballot.Ballot_EndDate)}</span>
        </div>
      </div>

      <div className="voting-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentPositionIndex + 1) / ballot.ballotPositions.length) * 100}%` }}
          ></div>
        </div>
        <p>Position {currentPositionIndex + 1} of {ballot.ballotPositions.length}</p>
      </div>

      <div className="position-section">
        <h2>{currentPosition?.Position_Title}</h2>
        {currentPosition?.Position_Description && (
          <p className="position-description">{currentPosition.Position_Description}</p>
        )}
        
        <div className="vote-instructions">
          <i className="fas fa-info-circle"></i>
          <span>
            {voteLimit === 1 
              ? 'Select 1 candidate' 
              : `Select up to ${voteLimit} candidates`
            }
          </span>
        </div>

        <div className="voting-tip">
          <i className="fas fa-lightbulb"></i>
          <div className="tip-content">
            <strong>Voting Tip:</strong> Don't like any of the candidates? You can abstain from this position by clicking the "Abstain" button below. This is a valid choice in real elections!
          </div>
        </div>

        <div className="abstain-section">
          <button 
            className={`abstain-btn ${isPositionAbstained() ? 'abstained' : ''}`}
            onClick={handleAbstain}
          >
            <i className="fas fa-minus-circle"></i>
            {isPositionAbstained() ? 'Abstaining (Click to vote)' : 'Abstain from this position'}
          </button>
          {isPositionAbstained() && (
            <p className="abstain-note">
              <i className="fas fa-info-circle"></i>
              You have chosen to abstain from voting for this position.
            </p>
          )}
        </div>

        <div className="candidates-grid">
          {candidates.map(candidate => (
            <div 
              key={candidate.id}
              className={`candidate-card ${isCandidateSelected(candidate.id) ? 'selected' : ''}`}
              onClick={() => handleCandidateSelect(candidate.id)}
            >
              <div className="candidate-photo">
                {imgError[candidate.id] ? (
                  <CandidatePhotoPlaceholder name={candidate.Candidate_Name} />
                ) : (
                  <img 
                    src={getCandidatePhotoUrl(candidate.photo)}
                    alt={candidate.Candidate_Name}
                    onError={() => setImgError(prev => ({ ...prev, [candidate.id]: true }))}
                  />
                )}
              </div>
              <div className="candidate-info">
                <h3>{candidate.Candidate_Name}</h3>
                <p>{candidate.Candidate_StudentId}</p>
                <p className="party-list">
                  <strong>Party List:</strong> {candidate.party_list_name || 'Independent'}
                </p>
              </div>
              {isCandidateSelected(candidate.id) && (
                <div className="selection-indicator">
                  <i className="fas fa-check"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="voting-navigation">
        <button 
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentPositionIndex === 0}
        >
          <i className="fas fa-arrow-left"></i>
          Previous
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {currentPositionIndex === ballot.ballotPositions.length - 1 ? (
            <>
              <i className="fas fa-check"></i>
              Review Votes
            </>
          ) : (
            <>
              Next
              <i className="fas fa-arrow-right"></i>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BallotVote;

