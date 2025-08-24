import React, { useEffect, useState } from 'react';
import { getPositions, getCandidates, getVoters, createVote, getElectionBallot, getElectionPositions, getElectionCandidates } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useElection } from '../../contexts/ElectionContext';
import ElectionStatusMessage from '../../components/ElectionStatusMessage';
import './Vote.css';
import { getCandidatePhotoUrl, CandidatePhotoPlaceholder } from '../../utils/image.jsx';

// Simple UUID generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const Vote = () => {
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [user, setUser] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showIdConfirmation, setShowIdConfirmation] = useState(false);
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [idConfirmation, setIdConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVoteSummary, setShowVoteSummary] = useState(false);
  const navigate = useNavigate();
  const { canVote, hasActiveElection, triggerImmediateRefresh, activeElection } = useElection();
  const [imgError, setImgError] = useState({}); // Track image errors by candidate ID
  const [electionToUse, setElectionToUse] = useState(null); // Store the election to use for voting

  useEffect(() => {
    console.log('Vote component - activeElection received:', activeElection);
    console.log('Vote component - canVote:', canVote);
    console.log('Vote component - hasActiveElection:', hasActiveElection);
    
    // Trigger immediate election status refresh only if no active election exists
    if (!activeElection) {
      console.log('No active election, triggering refresh...');
      triggerImmediateRefresh();
    }
    
    const fetchData = async () => {
      try {
        // Get user info from auth status endpoint instead of localStorage
        let userId = null;
        try {
          const authResponse = await fetch('http://localhost:3001/auth/status', {
            credentials: 'include'
          });
          if (authResponse.ok) {
            const authData = await authResponse.json();
            console.log('Full auth response:', authData);
            userId = authData.user?.id;
            console.log('Extracted userId from auth:', userId);
            console.log('User type:', typeof userId);
          }
        } catch (authError) {
          console.warn('Could not fetch auth status, falling back to localStorage:', authError);
          // Fallback to localStorage if auth endpoint fails
          userId = localStorage.getItem('userId');
          console.log('Fallback userId from localStorage:', userId);
        }
        
        if (!activeElection) {
          console.log('No active election found');
          setLoading(false);
          return;
        }

        console.log('Active election data:', activeElection);
        console.log('Active election type:', typeof activeElection);
        console.log('Active election is array:', Array.isArray(activeElection));
        
        // Handle case where activeElection is an array
        let electionToUse = activeElection;
        if (Array.isArray(activeElection) && activeElection.length > 0) {
          electionToUse = activeElection[0];
          console.log('Using first election from array:', electionToUse);
        }
        
        if (!electionToUse || !electionToUse.id) {
          console.error('No valid election found:', electionToUse);
          setError('No active election found. Please check back later.');
          setLoading(false);
          return;
        }
        
        // Store the election in state for use in vote submission
        setElectionToUse(electionToUse);

        if (!userId) {
          console.error('No user ID found');
          setLoading(false);
          return;
        }

        console.log('Attempting to fetch ballot data for election ID:', electionToUse.id);
        
        let ballotData, voters;
        
        try {
          // Try to get complete ballot data first
          console.log('Attempting to fetch ballot data for election ID:', electionToUse.id);
          
                  // First, test if backend is accessible
        try {
          const testResponse = await fetch('http://localhost:3001/auth/status', { credentials: 'include' });
          console.log('Backend connectivity test response:', testResponse.status);
          
          if (testResponse.status !== 200) {
            console.error('Backend server is not responding properly. Status:', testResponse.status);
            setError('Backend server is not accessible. Please check if the server is running.');
            setLoading(false);
            return;
          }
        } catch (healthError) {
          console.error('Backend server is not accessible:', healthError);
          setError('Cannot connect to the voting server. Please check your internet connection or try again later.');
          setLoading(false);
          return;
        }
          
          // Test if the election exists in the database
          try {
            const electionTestResponse = await fetch(`http://localhost:3001/elections/${electionToUse.id}`, { credentials: 'include' });
            console.log('Election existence check response:', electionTestResponse.status);
            
            if (electionTestResponse.status === 404) {
              console.error('Election not found in database:', electionToUse.id);
              setError('The election you are trying to access does not exist in the database. Please contact an administrator.');
              setLoading(false);
              return;
            }
          } catch (electionTestError) {
            console.warn('Could not verify election existence:', electionTestError);
          }
          
          [ballotData, voters] = await Promise.all([
            getElectionBallot(electionToUse.id), // Get complete ballot data
            getVoters()
          ]);
          
          console.log('Ballot data received:', ballotData);
          console.log('Voters data received:', voters);
          console.log('Active election ID:', electionToUse.id);
          
          // Extract positions and candidates from ballot data
          const positions = ballotData.ballot.map(item => item.position);
          const candidates = ballotData.ballot.flatMap(item => 
            item.candidates.map(candidate => ({
              ...candidate,
              positionId: item.position.id,
              positionName: item.position.title
            }))
          );
        
                  console.log('Extracted positions:', positions);
          console.log('Extracted candidates:', candidates);
          
          setPositions(positions);
          setCandidates(candidates);
        } catch (ballotError) {
          console.warn('Ballot endpoint failed, falling back to individual endpoints:', ballotError);
          console.log('Ballot error details:', {
            status: ballotError.response?.status,
            url: ballotError.config?.url,
            message: ballotError.message
          });
          
          // Fallback: Get positions and candidates separately
          try {
            const [positions, candidates, votersData] = await Promise.all([
              getElectionPositions(electionToUse.id),
              getElectionCandidates(electionToUse.id),
              getVoters()
            ]);
            
            console.log('Fallback - Positions received:', positions);
            console.log('Fallback - Candidates received:', candidates);
            console.log('Fallback - Voters received:', votersData);
            
            setPositions(positions);
            setCandidates(candidates);
            voters = votersData;
          } catch (fallbackError) {
            console.error('Fallback endpoints also failed:', fallbackError);
            throw fallbackError; // Re-throw to be caught by outer catch block
          }
        }
        
        // Find the voter in the voters list
        console.log('Searching for voter with userId:', userId);
        console.log('UserId type:', typeof userId);
        console.log('Available voters:', voters.map(v => ({ 
          id: v.id, 
          idType: typeof v.id, 
          name: v.name, 
          studentId: v.studentId, 
          email: v.email 
        })));
        
        // Check if there's a type mismatch
        const userIdString = String(userId);
        const userIdNumber = Number(userId);
        console.log('UserId as string:', userIdString);
        console.log('UserId as number:', userIdNumber);
        
        // Try multiple ways to find the voter
        let voter = voters.find(v => v.id === userId);
        console.log('Direct ID match result:', voter);
        
        if (!voter) {
          // Try finding by email if available
          try {
            const authData = await fetch('http://localhost:3001/auth/status', { credentials: 'include' });
            if (authData.ok) {
              const userData = await authData.json();
              console.log('Auth user data for email search:', userData);
              
              if (userData.user?.email) {
                voter = voters.find(v => v.email === userData.user.email);
                console.log('Found voter by email:', voter);
              }
            }
          } catch (emailError) {
            console.warn('Could not fetch user email:', emailError);
          }
        }
        
        if (!voter) {
          // Try finding by student ID if available
          try {
            const authData = await fetch('http://localhost:3001/auth/status', { credentials: 'include' });
            if (authData.ok) {
              const userData = await authData.json();
              console.log('Auth user data for student ID search:', userData);
              
              if (userData.user?.studentId) {
                voter = voters.find(v => v.studentId === userData.user.studentId);
                console.log('Found voter by student ID:', voter);
              }
            }
          } catch (studentIdError) {
            console.warn('Could not fetch user student ID:', studentIdError);
          }
        }
        
        // Try type conversion if still not found
        if (!voter) {
          console.log('Trying type conversion search...');
          voter = voters.find(v => String(v.id) === String(userId));
          console.log('Type conversion search result:', voter);
        }
        
        if (!voter) {
          // Try finding by exact string match
          voter = voters.find(v => v.id === userIdString);
          console.log('String match search result:', voter);
        }
        
        if (!voter) {
          // Try finding by exact number match
          voter = voters.find(v => v.id === userIdNumber);
          console.log('Number match search result:', voter);
        }
        
        // Try direct API call to get voter by ID
        if (!voter) {
          try {
            console.log('Trying direct API call to get voter by ID:', userId);
            const directVoterResponse = await fetch(`http://localhost:3001/voters/${userId}`, { credentials: 'include' });
            console.log('Direct voter API response status:', directVoterResponse.status);
            
            if (directVoterResponse.ok) {
              const directVoter = await directVoterResponse.json();
              console.log('Direct voter API response:', directVoter);
              
              // Check if this voter exists in our voters list
              const voterInList = voters.find(v => v.id === directVoter.id);
              console.log('Voter found in list via direct API:', voterInList);
              
              if (voterInList) {
                voter = voterInList;
                console.log('Using voter from direct API call');
              }
            }
          } catch (directError) {
            console.warn('Direct voter API call failed:', directError);
          }
        }
        
        if (!voter) {
          console.error('Voter not found in voters list. User ID:', userId);
          console.error('Available voters:', voters.map(v => ({ 
            id: v.id, 
            idType: typeof v.id, 
            name: v.name, 
            studentId: v.studentId, 
            email: v.email 
          })));
          setError('Your account was not found in the voters list. Please contact an administrator.');
          setLoading(false);
          return;
        }
        
        setUser(voter);
        setHasVoted(voter?.hasVoted);
      } catch (error) {
        console.error('Error fetching vote data:', error);
        
        // Provide more specific error messages
        if (error.response?.status === 404) {
          if (error.config?.url?.includes('/ballot')) {
            setError('No ballot data found for this election. The election may not have positions or candidates assigned yet.');
          } else {
            setError('Election data not found. Please check if the election is properly configured.');
          }
        } else if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (error.response?.status === 403) {
          setError('Access denied. You may not have permission to view this election.');
        } else {
          setError('Failed to load election data. Please try again or contact support.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeElection, triggerImmediateRefresh]);

  const handleSelect = (positionId, candidateId) => {
    const currentPosition = positions.find(p => p.id === positionId);
    const voteLimit = currentPosition?.voteLimit || 1;
    
    setSelectedVotes(prev => {
      const currentSelections = prev[positionId] || [];
      
      if (voteLimit === 1) {
        // Single selection - replace the selection
        return { ...prev, [positionId]: [candidateId] };
      } else {
        // Multiple selection - toggle the selection
        const isSelected = currentSelections.includes(candidateId);
        if (isSelected) {
          // Remove from selection
          return { 
            ...prev, 
            [positionId]: currentSelections.filter(id => id !== candidateId) 
          };
        } else {
          // Add to selection (if under limit)
          if (currentSelections.length < voteLimit) {
            return { 
              ...prev, 
              [positionId]: [...currentSelections, candidateId] 
            };
          }
          // Already at limit, don't add
          return prev;
        }
      }
    });
  };

  const handleNext = () => {
    if (currentPositionIndex < positions.length - 1) {
      setCurrentPositionIndex(currentPositionIndex + 1);
    } else {
      // All positions voted on, show confirmation
      setShowConfirmation(true);
    }
  };

  const handlePrevious = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(currentPositionIndex - 1);
    }
  };

  const handleFirstConfirmation = () => {
    setShowConfirmation(false);
    setShowIdConfirmation(true);
  };

  const handleIdConfirmation = async () => {
    if (idConfirmation.toLowerCase() !== 'confirm') {
      setError('Please type "CONFIRM" exactly to proceed');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    
    // Use the voter ID from the voters table, not the JWT user ID
    if (!user) {
      setError('User information not found. Please log in again.');
      return;
    }
    
    if (!electionToUse || !electionToUse.id) {
      setError('Election information not found. Please refresh the page and try again.');
      return;
    }
    
    const voterId = user.id; // This is the voter's ID from the voters table
    const studentId = user.studentId;
    
    try {
      console.log('Starting vote submission with election:', electionToUse);
      console.log('User data:', user);
      console.log('Selected votes:', selectedVotes);
      
      // Submit votes for all positions
      const positionsToVote = positions.filter(pos => selectedVotes[pos.id] && selectedVotes[pos.id].length > 0);
      let voteCount = 0;
      const totalVotes = positionsToVote.reduce((total, pos) => total + selectedVotes[pos.id].length, 0);
      
      console.log('Positions to vote:', positionsToVote);
      console.log('Total votes to submit:', totalVotes);
      
      for (let i = 0; i < positionsToVote.length; i++) {
        const pos = positionsToVote[i];
        const candidateIds = selectedVotes[pos.id];
        
        console.log(`Processing position ${pos.id} (${pos.name}) with ${candidateIds.length} candidates`);
        
        for (let j = 0; j < candidateIds.length; j++) {
          const candidateId = candidateIds[j];
          voteCount++;
          
          const voteData = {
            voterId: String(voterId), // Ensure voterId is a string
            candidateId: String(candidateId), // Ensure candidateId is a string
            electionId: String(electionToUse.id), // Ensure electionId is a string
            positionId: String(pos.id) // Ensure positionId is a string
          };
          
          console.log(`Submitting vote ${voteCount}/${totalVotes}:`, voteData);
          console.log(`Vote data types:`, {
            voterId: typeof voteData.voterId,
            candidateId: typeof voteData.candidateId,
            electionId: typeof voteData.electionId,
            positionId: typeof voteData.positionId
          });
          
          try {
            await createVote(voteData);
            console.log(`Vote ${voteCount} submitted successfully`);
          } catch (voteError) {
            console.error(`Failed to submit vote ${voteCount}:`, voteError);
            throw voteError; // Re-throw to stop the process
          }
        }
      }
      
      setSuccess('Your votes have been submitted successfully! Thank you for participating.');
      setHasVoted(true);
      setShowIdConfirmation(false);
      setShowFinalScreen(true);
    } catch (err) {
      console.error('Vote submission error:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      console.error('Error response headers:', err.response?.headers);
      
      // Try to get more detailed error information
      let errorMessage = 'Failed to submit votes';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentPosition = () => positions[currentPositionIndex];
  const getCurrentCandidates = () => candidates.filter(c => c.positionId === getCurrentPosition()?.id);
  const isCurrentPositionVoted = () => {
    const currentSelections = selectedVotes[getCurrentPosition()?.id] || [];
    return currentSelections.length > 0;
  };
  const isLastPosition = () => currentPositionIndex === positions.length - 1;
  const allPositionsVoted = () => positions.every(pos => {
    const selections = selectedVotes[pos.id] || [];
    return selections.length > 0;
  });

  const getCurrentSelections = () => selectedVotes[getCurrentPosition()?.id] || [];
  const isCandidateSelected = (candidateId) => {
    const selections = getCurrentSelections();
    return selections.includes(candidateId);
  };

  const getSelectionCount = () => {
    const selections = getCurrentSelections();
    return selections.length;
  };

  const getVoteLimit = () => {
    return getCurrentPosition()?.voteLimit || 1;
  };

  const canSelectMore = () => {
    return getSelectionCount() < getVoteLimit();
  };

  if (loading) {
    return (
      <div className="vote-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading voting interface...</p>
      </div>
    );
  }

  // Check if user can vote (has active election)
  if (!canVote) {
    return <ElectionStatusMessage type="vote" />;
  }

  // Check if user is found in voters list
  if (!user) {
    return (
      <div className="vote-error">
        <div className="alert alert-danger text-center">
          <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
          <h4>User Not Found</h4>
          <div className="error-message-content">
            <p className="mb-2">Your account was not found in the voters list.</p>
            <p className="mb-0">Please contact an administrator to register you as a voter.</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasVoted && !showFinalScreen) {
    return (
      <div className="vote-locked-container">
        <div className="vote-locked-content">
          <div className="vote-locked-icon">
            <i className="fas fa-lock"></i>
          </div>
          <h2>Voting Complete</h2>
          <p>You have already cast your votes. Thank you for participating in the election!</p>
          <div className="vote-locked-actions">
            <button className="btn btn-primary" onClick={() => navigate('/results')}>
              <i className="fas fa-chart-bar me-2"></i>
              View Results
            </button>
            <button className="btn btn-outline-primary" onClick={() => navigate('/user/dashboard')}>
              <i className="fas fa-home me-2"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showFinalScreen) {
    return (
      <div className="vote-final-screen">
        <div className="vote-final-content">
          <div className="vote-final-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Vote Confirmed!</h2>
          <p>Your votes have been successfully recorded and submitted. Thank you for participating in the election.</p>
          <div className="vote-final-info">
            <p><strong>Student ID:</strong> {user?.studentId}</p>
            <p><strong>Voter Name:</strong> {user?.name}</p>
            <p><strong>Submission Time:</strong> {new Date().toLocaleString()}</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/user/dashboard')}>
            <i className="fas fa-home me-2"></i>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="vote-no-positions">
        <div className="vote-no-positions-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>No Positions Available</h2>
          <p>There are no voting positions available at the moment. Please check back later.</p>
                      <button className="btn btn-outline-primary" onClick={() => navigate('/user/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vote-container">
      {/* Progress Bar */}
      <div className="vote-progress">
        <div className="vote-progress-bar">
          <div 
            className="vote-progress-fill" 
            style={{ width: `${((currentPositionIndex + 1) / positions.length) * 100}%` }}
          ></div>
        </div>
        <div className="vote-progress-text">
          Position {currentPositionIndex + 1} of {positions.length}
        </div>
      </div>

      {/* Current Position */}
      <div className="vote-position-section">
        <h2 className="vote-position-title">
          {getCurrentPosition()?.name}
        </h2>
        <p className="vote-position-subtitle">
          {getVoteLimit() === 1 
            ? 'Select your preferred candidate for this position'
            : `Select up to ${getVoteLimit()} candidates for this position (${getSelectionCount()}/${getVoteLimit()} selected)`
          }
        </p>

        {error && (
          <div className="alert alert-danger vote-inline-error">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success vote-inline-success">
            <i className="fas fa-check-circle me-2"></i>
            {success}
          </div>
        )}

        <div className="vote-candidates-grid">
          {getCurrentCandidates().map((candidate, index) => (
            <div 
              key={candidate.id} 
              className={`vote-candidate-card-modern ${isCandidateSelected(candidate.id) ? 'selected' : ''} ${!isCandidateSelected(candidate.id) && !canSelectMore() ? 'disabled' : ''}`}
              onClick={() => handleSelect(getCurrentPosition()?.id, candidate.id)}
            >
              <div className="vote-candidate-card-header">
                <div className="vote-candidate-rank-badge">
                  <span className="rank-number">{index + 1}</span>
                </div>
                <div className="vote-candidate-photo-container">
                  {candidate.photoUrl && !imgError[candidate.id] ? (
                    <img 
                      src={getCandidatePhotoUrl(candidate.photoUrl)}
                      alt={candidate.name} 
                      className="vote-candidate-photo"
                      onError={e => {
                        setImgError(prev => ({ ...prev, [candidate.id]: true }));
                        e.target.style.display = 'none';
                        e.target.parentNode.querySelector('.candidate-photo-placeholder').style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <CandidatePhotoPlaceholder className="candidate-photo-placeholder" style={{ display: candidate.photoUrl && !imgError[candidate.id] ? 'none' : 'flex' }} />
                </div>
                <div className="vote-candidate-overlay">
                  <h3 className="vote-candidate-overlay-name">
                    {candidate.name}
                    <span className="verified"><i className="fas fa-check-circle"></i></span>
                  </h3>
                  <div className="vote-candidate-overlay-position">{candidate.positionName}</div>
                  <p className="vote-candidate-overlay-description">
                    {candidate.description ? 
                      candidate.description.substring(0, 120) + (candidate.description.length > 120 ? '...' : '') :
                      'Learn more about this candidate and their vision for the position.'
                    }
                  </p>
                </div>
                <div className="vote-candidate-selection-overlay">
                  <input
                    type={getVoteLimit() === 1 ? "radio" : "checkbox"}
                    name={`position-${getCurrentPosition()?.id}`}
                    value={candidate.id}
                    checked={isCandidateSelected(candidate.id)}
                    onChange={() => handleSelect(getCurrentPosition()?.id, candidate.id)}
                    disabled={!isCandidateSelected(candidate.id) && !canSelectMore()}
                    className="vote-selection-input"
                  />
                  <span className={`vote-selection-indicator ${getVoteLimit() === 1 ? 'radio-custom' : 'checkbox-custom'}`}></span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {getCurrentCandidates().length === 0 && (
          <div className="vote-no-candidates">
            <i className="fas fa-user-slash"></i>
            <p>No candidates available for this position.</p>
          </div>
        )}

        {getVoteLimit() > 1 && (
          <div className="vote-limit-info">
            <div className="vote-limit-progress">
              <div className="vote-limit-bar">
                <div 
                  className="vote-limit-fill" 
                  style={{ width: `${(getSelectionCount() / getVoteLimit()) * 100}%` }}
                ></div>
              </div>
              <span className="vote-limit-text">
                {getSelectionCount()} of {getVoteLimit()} candidates selected
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="vote-navigation">
        <button 
          className="btn btn-outline-secondary" 
          onClick={handlePrevious}
          disabled={currentPositionIndex === 0}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Previous
        </button>
        
        <div className="vote-navigation-center">
          <button 
            className="btn btn-outline-info btn-sm"
            onClick={() => setShowVoteSummary(!showVoteSummary)}
          >
            <i className={`fas ${showVoteSummary ? 'fa-eye-slash' : 'fa-eye'} me-2`}></i>
            {showVoteSummary ? 'Hide Summary' : 'Show Summary'}
            {!showVoteSummary && (
              <span className="summary-count-badge">
                {positions.filter(pos => selectedVotes[pos.id]?.length > 0).length}/{positions.length}
              </span>
            )}
          </button>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={handleNext}
          disabled={!isCurrentPositionVoted()}
        >
          {isLastPosition() ? (
            <>
              <i className="fas fa-check me-2"></i>
              Review & Submit
            </>
          ) : (
            <>
              Next
              <i className="fas fa-arrow-right ms-2"></i>
            </>
          )}
        </button>
      </div>

      {/* Collapsible Vote Summary */}
      {showVoteSummary && (
        <div className="vote-summary-collapsible">
          <div className="vote-summary-header">
            <h4>Your Votes Summary</h4>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowVoteSummary(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="vote-summary-list">
            {positions.map((pos, index) => {
              const selectedCandidates = candidates.filter(c => selectedVotes[pos.id]?.includes(c.id));
              return (
                <div key={pos.id} className={`vote-summary-item ${index === currentPositionIndex ? 'current' : ''}`}>
                  <span className="vote-summary-position">{pos.name}:</span>
                  <div className="vote-summary-candidates">
                    {selectedCandidates.length > 0 ? (
                      <div className="selected-candidates-grid">
                        {selectedCandidates.map(candidate => (
                          <div key={candidate.id} className="selected-candidate-item">
                            <div className="candidate-avatar-wrapper">
                            {candidate.photoUrl && !imgError[candidate.id] ? (
                              <img 
                                  src={getCandidatePhotoUrl(candidate.photoUrl)} 
                                alt={candidate.name} 
                                className="selected-candidate-photo"
                                onError={() => setImgError(prev => ({ ...prev, [candidate.id]: true }))}
                              />
                            ) : (
                                <CandidatePhotoPlaceholder className="selected-candidate-photo-placeholder" />
                              )}
                              </div>
                            <span className="selected-candidate-name">{candidate.name}</span>
                          </div>
                        ))}
                        {selectedCandidates.length > 3 && (
                          <div className="candidate-count-badge">
                            +{selectedCandidates.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="vote-summary-candidate">Not selected</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* First Confirmation Modal */}
      {showConfirmation && (
        <div className="vote-confirmation-overlay">
          <div className="vote-confirmation-modal">
            <div className="vote-confirmation-header">
              <i className="fas fa-exclamation-triangle text-warning"></i>
              <h3>First Confirmation</h3>
            </div>
            <div className="vote-confirmation-body">
              <p><strong>Warning:</strong> You cannot change your votes after submission.</p>
              <div className="vote-confirmation-summary">
                <h5>Vote Summary:</h5>
                {positions.map(pos => {
                  const selectedCandidates = candidates.filter(c => selectedVotes[pos.id]?.includes(c.id));
                  return (
                    <div key={pos.id} className="vote-confirmation-item">
                      <strong>{pos.name}:</strong>
                      <div className="confirmation-candidates">
                        {selectedCandidates.length > 0 ? (
                          <div className="confirmation-candidates-grid">
                            {selectedCandidates.map(candidate => (
                              <div key={candidate.id} className="confirmation-candidate-item">
                                <div className="candidate-avatar-wrapper">
                                {candidate.photoUrl && !imgError[candidate.id] ? (
                                  <img 
                                      src={getCandidatePhotoUrl(candidate.photoUrl)} 
                                    alt={candidate.name} 
                                    className="confirmation-candidate-photo"
                                    onError={() => setImgError(prev => ({ ...prev, [candidate.id]: true }))}
                                  />
                                ) : (
                                    <CandidatePhotoPlaceholder className="confirmation-candidate-photo-placeholder" />
                                  )}
                                  </div>
                                <span className="confirmation-candidate-name">{candidate.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>Not selected</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="vote-confirmation-actions">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => setShowConfirmation(false)}
              >
                Review Again
              </button>
              <button 
                className="btn btn-warning" 
                onClick={handleFirstConfirmation}
              >
                <i className="fas fa-arrow-right me-2"></i>
                Proceed to ID Confirmation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ID Confirmation Modal */}
      {showIdConfirmation && (
        <div className="vote-confirmation-overlay">
          <div className="vote-confirmation-modal">
            <div className="vote-confirmation-header">
              <i className="fas fa-shield-alt text-danger"></i>
              <h3>Final ID Confirmation</h3>
            </div>
            <div className="vote-confirmation-body">
              <div className="id-confirmation-section">
                <p><strong>Student ID Verification:</strong></p>
                <p className="student-id-display">{user?.studentId}</p>
                <p>To finalize your vote submission, please type <strong>"CONFIRM"</strong> in the field below:</p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type CONFIRM here..."
                  value={idConfirmation}
                  onChange={(e) => setIdConfirmation(e.target.value)}
                  style={{ textTransform: 'uppercase' }}
                />
                {error && (
                  <div className="alert alert-danger mt-2 vote-modal-error">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
              </div>
              <div className="vote-confirmation-summary">
                <h5>Final Vote Summary:</h5>
                {positions.map(pos => {
                  const selectedCandidates = candidates.filter(c => selectedVotes[pos.id]?.includes(c.id));
                  return (
                    <div key={pos.id} className="vote-confirmation-item">
                      <strong>{pos.name}:</strong>
                      <div className="confirmation-candidates">
                        {selectedCandidates.length > 0 ? (
                          <div className="confirmation-candidates-grid">
                            {selectedCandidates.map(candidate => (
                              <div key={candidate.id} className="confirmation-candidate-item">
                                <div className="candidate-avatar-wrapper">
                                {candidate.photoUrl && !imgError[candidate.id] ? (
                                  <img 
                                      src={getCandidatePhotoUrl(candidate.photoUrl)} 
                                    alt={candidate.name} 
                                    className="confirmation-candidate-photo"
                                    onError={() => setImgError(prev => ({ ...prev, [candidate.id]: true }))}
                                  />
                                ) : (
                                    <CandidatePhotoPlaceholder className="confirmation-candidate-photo-placeholder" />
                                  )}
                                  </div>
                                <span className="confirmation-candidate-name">{candidate.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>Not selected</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="vote-confirmation-actions">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => {
                  setShowIdConfirmation(false);
                  setShowConfirmation(true);
                  setError('');
                }}
                disabled={submitting}
              >
                Go Back
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleIdConfirmation}
                disabled={submitting || idConfirmation.toLowerCase() !== 'confirm'}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    Final Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vote; 