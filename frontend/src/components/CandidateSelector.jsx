import React, { useState, useEffect } from 'react';
import { getCandidates } from '../services/api';
import './CandidateSelector.css';

const CandidateSelector = ({ 
  templatePositions, 
  onComplete, 
  onCancel, 
  onGoBack 
}) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    // Template positions received
  }, [templatePositions]);

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onCancel]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const candidatesData = await getCandidates();
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateToggle = (positionTitle, candidateId) => {
    setSelectedCandidates(prev => {
      const positionCandidates = prev[positionTitle] || [];
      const isSelected = positionCandidates.includes(candidateId);
      
      if (isSelected) {
        return {
          ...prev,
          [positionTitle]: positionCandidates.filter(id => id !== candidateId)
        };
      } else {
        return {
          ...prev,
          [positionTitle]: [...positionCandidates, candidateId]
        };
      }
    });
  };

  const handleComplete = () => {
    // Flatten all selected candidates into a single array
    const allSelectedCandidates = Object.values(selectedCandidates).flat();
    onComplete(allSelectedCandidates);
  };

  const isCandidateSelected = (positionTitle, candidateId) => {
    return selectedCandidates[positionTitle]?.includes(candidateId) || false;
  };

  const handleSelectAllForPosition = (positionTitle) => {
    const positionCandidates = getCandidatesForPosition(positionTitle);
    const allCandidateIds = positionCandidates.map(candidate => candidate.id);
    
    setSelectedCandidates(prev => ({
      ...prev,
      [positionTitle]: allCandidateIds
    }));
  };

  const handleDeselectAllForPosition = (positionTitle) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [positionTitle]: []
    }));
  };

  const isAllSelectedForPosition = (positionTitle) => {
    const positionCandidates = getCandidatesForPosition(positionTitle);
    const selectedForPosition = selectedCandidates[positionTitle] || [];
    return positionCandidates.length > 0 && selectedForPosition.length === positionCandidates.length;
  };

  const isSomeSelectedForPosition = (positionTitle) => {
    const selectedForPosition = selectedCandidates[positionTitle] || [];
    return selectedForPosition.length > 0;
  };

  const getCandidatesForPosition = (positionTitle) => {
    const filteredCandidates = candidates.filter(candidate => {
      // The position data is nested under candidate.position.Position_Title
      const candidatePosition = candidate.position?.Position_Title;
      return candidatePosition === positionTitle;
    });
    
    return filteredCandidates;
  };

  const canComplete = () => {
    // Check if at least one candidate is selected for each position
    return templatePositions.every(position => {
      const positionCandidates = selectedCandidates[position.positionTitle] || [];
      return positionCandidates.length > 0;
    });
  };

  if (loading) {
    return (
      <div className="candidate-selector">
        <div className="candidate-selector-header">
          <button 
            className="go-back-btn"
            onClick={onGoBack}
            title="Go back to template selection"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h3>Select Candidates</h3>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="candidate-selector-body">
          <div className="loading-message">
            <p>Loading candidates...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidate-selector">
        <div className="candidate-selector-header">
          <button 
            className="go-back-btn"
            onClick={onGoBack}
            title="Go back to template selection"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h3>Select Candidates</h3>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="candidate-selector-body">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchCandidates}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-selector">
      <div className="candidate-selector-header">
        <button 
          className="go-back-btn"
          onClick={onGoBack}
          title="Go back to template selection"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h3>Select Candidates</h3>
        <button className="btn btn-secondary btn-sm" onClick={onCancel}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="candidate-selector-body">
        <div className="candidate-selector-description">
          <p>Choose which candidates will run for each position in this ballot:</p>
        </div>

        {templatePositions.map((position, index) => {
          const positionCandidates = getCandidatesForPosition(position.positionTitle);
          
          return (
            <div key={index} className="position-candidates-section">
              <div className="position-header">
                <div className="position-title-section">
                  <h4>{position.positionTitle}</h4>
                  <span className="vote-limit">Vote Limit: {position.voteLimit}</span>
                </div>
                <div className="position-actions">
                  {isAllSelectedForPosition(position.positionTitle) ? (
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDeselectAllForPosition(position.positionTitle)}
                      title="Deselect all candidates for this position"
                    >
                      <i className="fas fa-times"></i>
                      Deselect All
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSelectAllForPosition(position.positionTitle)}
                      title="Select all candidates for this position"
                    >
                      <i className="fas fa-check-double"></i>
                      Select All
                    </button>
                  )}
                </div>
              </div>
              
              {positionCandidates.length > 0 ? (
                <div className="candidates-grid">
                  {positionCandidates.map(candidate => (
                    <div 
                      key={candidate.id}
                      className={`candidate-card ${
                        isCandidateSelected(position.positionTitle, candidate.id) ? 'selected' : ''
                      }`}
                      onClick={() => handleCandidateToggle(position.positionTitle, candidate.id)}
                    >
                      <div className="candidate-checkbox">
                        <i className={`fas ${isCandidateSelected(position.positionTitle, candidate.id) ? 'fa-check-square' : 'fa-square'}`}></i>
                      </div>
                      <div className="candidate-info">
                        <h5>{candidate.Candidate_Name}</h5>
                        <p className="candidate-student-id">{candidate.Candidate_StudentId}</p>
                        {candidate.Candidate_Email && (
                          <p className="candidate-email">{candidate.Candidate_Email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-candidates">
                  <i className="fas fa-user-slash"></i>
                  <p>No candidates found for this position</p>
                  <small>You may need to create candidates for this position first</small>
                </div>
              )}
            </div>
          );
        })}

        <div className="candidate-selector-actions">
          <button 
            className="btn btn-primary"
            onClick={handleComplete}
            disabled={!canComplete()}
          >
            <i className="fas fa-check"></i>
            Continue to Ballot Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateSelector;
