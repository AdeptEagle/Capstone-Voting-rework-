import React, { useEffect, useState } from 'react';
import { getPositions, getCandidates, getVoters, createBallotVote, getAvailableBallots, getBallotById } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useBallot } from '../../contexts/BallotContext';
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
  const { canVote, hasActiveBallot, triggerImmediateRefresh, activeBallot } = useBallot();
  const [imgError, setImgError] = useState({}); // Track image errors by candidate ID
  const [ballotToUse, setBallotToUse] = useState(null); // Store the ballot to use for voting

  useEffect(() => {
    console.log('Vote component - activeBallot received:', activeBallot);
    console.log('Vote component - canVote:', canVote);
    console.log('Vote component - hasActiveBallot:', hasActiveBallot);
    
    // Trigger immediate ballot status refresh only if no active ballot exists
    if (!activeBallot) {
      console.log('No active ballot, triggering refresh...');
      triggerImmediateRefresh();
    }
    
    const fetchData = async () => {
      try {
        // Get user info from auth status endpoint instead of localStorage
        let userId = null;
        try {
          const authResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/auth/status`, {
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
        
        // Get available ballots instead of elections
        console.log('Fetching available ballots...');
        const availableBallots = await getAvailableBallots();
        console.log('Available ballots:', availableBallots);
        
        if (!availableBallots || availableBallots.length === 0) {
          console.log('No available ballots found');
          setError('No active ballots available for voting. Please check back later.');
          setLoading(false);
          return;
        }
        
        // Use the first available ballot
        const ballotToUse = availableBallots[0];
        console.log('Using ballot:', ballotToUse);
        
        if (!ballotToUse || !ballotToUse.id) {
          console.error('No valid ballot found:', ballotToUse);
          setError('No active ballot found. Please check back later.');
          setLoading(false);
          return;
        }
        
        // Store the ballot in state for use in vote submission
        setBallotToUse(ballotToUse);

        if (!userId) {
          console.error('No user ID found');
          setLoading(false);
          return;
        }

        console.log('Attempting to fetch ballot data for ballot ID:', ballotToUse.id);
        
        let ballotData, voters;
        
        try {
          // Try to get complete ballot data first
          console.log('Attempting to fetch ballot data for ballot ID:', ballotToUse.id);
          
          // First, test if backend is accessible
          try {
            const testResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/auth/status`, { credentials: 'include' });
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
          
          // Test if the ballot exists in the database
          try {
            const ballotTestResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/ballots/${ballotToUse.id}`, { credentials: 'include' });
            console.log('Ballot existence check response:', ballotTestResponse.status);
            
            if (ballotTestResponse.status === 404) {
              console.error('Ballot not found in database:', ballotToUse.id);
              setError('The ballot you are trying to access does not exist in the database. Please contact an administrator.');
              setLoading(false);
              return;
            }
          } catch (ballotTestError) {
            console.warn('Could not verify ballot existence:', ballotTestError);
          }
          
          [ballotData, voters] = await Promise.all([
            getBallotById(ballotToUse.id), // Get complete ballot data
            getVoters()
          ]);
          
          console.log('Ballot data received:', ballotData);
          console.log('🔍 Full ballot data structure:', JSON.stringify(ballotData, null, 2));
          console.log('Voters data received:', voters);
          console.log('Active ballot ID:', ballotToUse.id);
          
          // Debug the raw ballot data structure
          console.log('🔍 Raw ballot data structure:');
          if (ballotData.ballotPositions && ballotData.ballotPositions.length > 0) {
            console.log('First position candidates:', ballotData.ballotPositions[0]);
            if (ballotData.ballotCandidates && ballotData.ballotCandidates.length > 0) {
              const firstCandidate = ballotData.ballotCandidates[0];
              console.log('First candidate party data:', {
                name: firstCandidate.candidate.Candidate_Name,
                party_list_name: firstCandidate.candidate.party_list_name,
                partyListId: firstCandidate.candidate.partyListId,
                partyList: firstCandidate.candidate.partyList
              });
            }
          }
          
          // Extract positions and candidates from ballot data
          const positions = ballotData.ballotPositions.map(bp => bp.position);
          const candidates = ballotData.ballotCandidates.map(bc => ({
            ...bc.candidate,
            positionId: bc.BallotCandidate_PositionId,
            positionName: positions.find(p => p.id === bc.BallotCandidate_PositionId)?.Position_Title
          }));
        
                  console.log('Extracted positions:', positions);
          console.log('Extracted candidates:', candidates);
          
          // Debug the extracted candidates data
          console.log('🔍 Extracted candidates party data:');
          if (candidates.length > 0) {
            candidates.forEach((candidate, index) => {
              console.log(`Candidate ${index + 1}:`, {
                name: candidate.Candidate_Name,
                party_list_name: candidate.party_list_name,
                partyListId: candidate.partyListId,
                partyList: candidate.partyList,
                finalDisplayValue: candidate.partyList?.name || candidate.party_list_name || 'Independent'
              });
            });
          }
          
          
          
          setPositions(positions);
          setCandidates(candidates);
        } catch (ballotError) {
          console.warn('Ballot endpoint failed:', ballotError);
          console.log('Ballot error details:', {
            status: ballotError.response?.status,
            url: ballotError.config?.url,
            message: ballotError.message
          });
          
          // For ballot system, we don't have fallback endpoints like election system
          // Just throw the error to be handled by the outer catch block
          throw ballotError;
        }
        
        // Find the voter in the voters list
        console.log('Searching for voter with userId:', userId);
        console.log('UserId type:', typeof userId);
        console.log('Available voters:', voters.map(v => ({ 
          id: v.id, 
          idType: typeof v.id, 
          name: v.Voter_Name, 
          studentId: v.Voter_StudentId, 
          email: v.Voter_Email 
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
            const authData = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/auth/status`, { credentials: 'include' });
            if (authData.ok) {
              const userData = await authData.json();
              console.log('Auth user data for email search:', userData);
              
              if (userData.user?.Voter_Email) {
                voter = voters.find(v => v.Voter_Email === userData.user.Voter_Email);
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
            const authData = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/auth/status`, { credentials: 'include' });
            if (authData.ok) {
              const userData = await authData.json();
              console.log('Auth user data for student ID search:', userData);
              
              if (userData.user?.Voter_StudentId) {
                voter = voters.find(v => v.Voter_StudentId === userData.user.Voter_StudentId);
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
            const directVoterResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/voters/${userId}`, { credentials: 'include' });
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
            setError('No ballot data found. The ballot may not have positions or candidates assigned yet.');
          } else {
            setError('Ballot data not found. Please check if the ballot is properly configured.');
          }
        } else if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (error.response?.status === 403) {
          setError('Access denied. You may not have permission to view this ballot.');
        } else {
          setError('Failed to load ballot data. Please try again or contact support.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ballotToUse, triggerImmediateRefresh]);

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
    
    if (!ballotToUse || !ballotToUse.id) {
      setError('Ballot information not found. Please refresh the page and try again.');
      return;
    }
    
    const voterId = user.id; // This is the voter's ID from the voters table
    const studentId = user.studentId;
    
    try {
      console.log('Starting vote submission with ballot:', ballotToUse);
      console.log('User data:', user);
      console.log('Selected votes:', selectedVotes);
      
      // Prepare vote data for ballot submission
      const votes = [];
      Object.entries(selectedVotes).forEach(([positionId, candidateIds]) => {
        candidateIds.forEach(candidateId => {
          votes.push({
            positionId: positionId,
            candidateId: candidateId
          });
        });
      });
      
      // Client-side validation to prevent empty submissions
      if (!votes.length) {
        setError('No votes selected. Please select at least one candidate.');
        return;
      }

      console.log('Prepared votes for ballot submission:', votes);
      
      // Submit votes using ballot system
      const voteData = {
        ballotId: ballotToUse.id,
        votes: votes,
        ipAddress: null, // Could be added if needed
        userAgent: navigator.userAgent,
        sessionId: null // Could be added if needed
      };
      
      console.log('Submitting ballot vote:', voteData);
      await createBallotVote(voteData);
      console.log('Ballot vote submitted successfully');
      
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
      let errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to submit votes';
      
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
                
                {/* Candidate Photo Section */}
                <div className="vote-candidate-photo-section">
                  <div className="vote-candidate-photo-container">
                    {candidate.photoUrl || candidate.photo && !imgError[candidate.id] ? (
                      <img 
                        src={getCandidatePhotoUrl(candidate.photoUrl || candidate.photo)} 
                        alt={candidate.Candidate_Name} 
                        className="vote-candidate-photo"
                        onError={e => {
                          setImgError(prev => ({ ...prev, [candidate.id]: true }));
                          e.target.style.display = 'none';
                          e.target.parentNode.querySelector('.candidate-photo-placeholder').style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <CandidatePhotoPlaceholder className="candidate-photo-placeholder" style={{ display: candidate.photoUrl || candidate.photo && !imgError[candidate.id] ? 'none' : 'flex' }} />
                  </div>
                </div>

                {/* Candidate Info Section */}
                <div className="vote-candidate-info-section">
                  <h3 className="vote-candidate-name">
                    {candidate.Candidate_Name}
                    <span className="verified"><i className="fas fa-check-circle"></i></span>
                  </h3>
                  <div className="vote-candidate-position">{candidate.positionName}</div>
                  
                  {/* Party List Information */}
                  <div className="vote-candidate-party-list">
                    <span className="party-list-label">Party List:</span>
                    <span className="party-list-name">
                      {candidate.partyList?.name || candidate.party_list_name || 'Independent'}
                    </span>
                    {candidate.partyList?.color && (
                      <span 
                        className="party-list-color-indicator" 
                        style={{ backgroundColor: candidate.partyList.color }}
                        title={`${candidate.partyList.name} party color`}
                      ></span>
                    )}
                  </div>
                  
                  <p className="vote-candidate-description">
                    {candidate.description ? 
                      candidate.description.substring(0, 120) + (candidate.description.length > 120 ? '...' : '') :
                      'Learn more about this candidate and their vision for the position.'
                    }
                  </p>
                </div>

                {/* Selection Overlay */}
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
                            {candidate.photoUrl || candidate.photo && !imgError[candidate.id] ? (
                              <img 
                                  src={getCandidatePhotoUrl(candidate.photoUrl || candidate.photo)} 
                                alt={candidate.name} 
                                className="selected-candidate-photo"
                                onError={() => setImgError(prev => ({ ...prev, [candidate.id]: true }))}
                              />
                            ) : (
                                <CandidatePhotoPlaceholder className="selected-candidate-photo-placeholder" />
                              )}
                              </div>
                                                         <span className="selected-candidate-name">{candidate.Candidate_Name}</span>
                                                         <span className="selected-candidate-party">
                                                           {candidate.partyList?.name || candidate.party_list_name || 'Independent'}
                                                         </span>
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
                      <strong>{pos.Position_Title}:</strong>
                      <div className="confirmation-candidates">
                        {selectedCandidates.length > 0 ? (
                          <div className="confirmation-candidates-grid">
                            {selectedCandidates.map(candidate => (
                              <div key={candidate.id} className="confirmation-candidate-item">
                                <div className="candidate-avatar-wrapper">
                                {candidate.photoUrl || candidate.photo && !imgError[candidate.id] ? (
                                  <img 
                                      src={getCandidatePhotoUrl(candidate.photoUrl || candidate.photo)} 
                                    alt={candidate.Candidate_Name} 
                                    className="confirmation-candidate-photo"
                                    onError={() => setImgError(prev => ({ ...prev, [candidate.id]: true }))}
                                  />
                                ) : (
                                    <CandidatePhotoPlaceholder className="confirmation-candidate-photo-placeholder" />
                                  )}
                                  </div>
                                <span className="confirmation-candidate-name">{candidate.Candidate_Name}</span>
                                <span className="confirmation-candidate-party">
                                  {candidate.partyList?.name || candidate.party_list_name || 'Independent'}
                                </span>
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
                      <strong>{pos.Position_Title}:</strong>
                      <div className="confirmation-candidates">
                        {selectedCandidates.length > 0 ? (
                          <div className="confirmation-candidates-grid">
                            {selectedCandidates.map(candidate => (
                              <div key={candidate.id} className="confirmation-candidate-item">
                                <div className="candidate-avatar-wrapper">
                                {candidate.photoUrl || candidate.photo && !imgError[candidate.id] ? (
                                  <img 
                                      src={getCandidatePhotoUrl(candidate.photoUrl || candidate.photo)} 
                                    alt={candidate.Candidate_Name} 
                                    className="confirmation-candidate-photo"
                                    onError={() => setImgError(prev => ({ ...prev, [candidate.id]: true }))}
                                  />
                                ) : (
                                    <CandidatePhotoPlaceholder className="confirmation-candidate-photo-placeholder" />
                                  )}
                                  </div>
                                <span className="confirmation-candidate-name">{candidate.Candidate_Name}</span>
                                <span className="confirmation-candidate-party">
                                  {candidate.partyList?.name || candidate.party_list_name || 'Independent'}
                                </span>
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