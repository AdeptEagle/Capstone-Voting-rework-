import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getPositions, 
  getCandidates, 
  getDepartments, 
  createElection
} from '../services/api';
import './BallotCreation.css';

const BallotCreation = () => {
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(4); // Reduced from 5 to 4
  
  // Data fetching states
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data states
  const [electionData, setElectionData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: false
  });
  
  // Position management
  const [selectedPositions, setSelectedPositions] = useState([]);
  
  // Candidate management
  const [positionCandidates, setPositionCandidates] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [positionsData, candidatesData, departmentsData] = await Promise.all([
        getPositions(),
        getCandidates(),
        getDepartments()
      ]);
      
      setPositions(positionsData || []);
      setCandidates(candidatesData || []);
      setDepartments(departmentsData || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Election Details
  const handleElectionDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setElectionData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Step 2: Position Selection
  const handlePositionSelection = (positionId, isSelected) => {
    if (isSelected) {
      setSelectedPositions(prev => [...prev, positionId]);
    } else {
      setSelectedPositions(prev => prev.filter(id => id !== positionId));
      // Remove candidates for this position
      setPositionCandidates(prev => {
        const newState = { ...prev };
        delete newState[positionId];
        return newState;
      });
    }
  };

  const handleSelectAllPositions = () => {
    const allPositionIds = positions.map(p => p.id);
    setSelectedPositions(allPositionIds);
  };

  const handleDeselectAllPositions = () => {
    setSelectedPositions([]);
    setPositionCandidates({});
  };

  // Step 3: Candidate Assignment
  const handleCandidateAssignment = (positionId, candidateId, isSelected) => {
    setPositionCandidates(prev => {
      const currentCandidates = prev[positionId] || [];
      if (isSelected) {
        return {
          ...prev,
          [positionId]: [...currentCandidates, candidateId]
        };
      } else {
        return {
          ...prev,
          [positionId]: currentCandidates.filter(id => id !== candidateId)
        };
      }
    });
  };

  const handleSelectAllCandidates = (positionId) => {
    const candidatesForPosition = candidates.filter(c => c.positionId === positionId);
    const candidateIds = candidatesForPosition.map(c => c.id);
    setPositionCandidates(prev => ({
      ...prev,
      [positionId]: candidateIds
    }));
  };

  const handleDeselectAllCandidates = (positionId) => {
    setPositionCandidates(prev => {
      const newState = { ...prev };
      delete newState[positionId];
      return newState;
    });
  };

  // Step 4: Review and Create
  const prepareReviewData = () => {
    const allPositions = selectedPositions.map(id => positions.find(p => p.id === id)).filter(Boolean);
    const allCandidates = Object.values(positionCandidates).flat().map(id => candidates.find(c => c.id === id)).filter(Boolean);

    return {
      election: electionData,
      positions: allPositions,
      candidates: allCandidates,
      positionCandidates: positionCandidates
    };
  };

  const handleCreateBallot = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate required data
      if (!electionData.title || !electionData.startDate || !electionData.endDate) {
        throw new Error('Please fill in all required election details');
      }

      if (selectedPositions.length === 0) {
        throw new Error('Please select at least one position');
      }

      // Note: Position and candidate assignments will be handled separately
      // For now, we just create the election with basic details

      // Prepare election data - only send fields expected by CreateElectionDto
      const electionPayload = {
        title: electionData.title,
        description: electionData.description,
        startDate: new Date(electionData.startDate).toISOString(),
        endDate: new Date(electionData.endDate).toISOString(),
        isActive: electionData.isActive
      };

      // Create the election
      const result = await createElection(electionPayload);
      
      setSuccess('Election created successfully! You can now assign positions and candidates.');
      setTimeout(() => {
        navigate('/admin/elections');
      }, 2000);

    } catch (error) {
      console.error('Error creating ballot:', error);
      setError(error.message || 'Failed to create ballot');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!electionData.title || !electionData.startDate || !electionData.endDate) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (currentStep === 2) {
      if (selectedPositions.length === 0) {
        setError('Please select at least one position');
        return;
      }
    } else if (currentStep === 3) {
      // For now, just validate that positions are selected
      // Candidate assignment validation can be added later
    }

    setError('');
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ElectionDetailsStep 
          electionData={electionData} 
          onChange={handleElectionDataChange} 
        />;
      case 2:
        return <PositionSelectionStep 
          positions={positions}
          selectedPositions={selectedPositions}
          onPositionSelect={handlePositionSelection}
          onSelectAll={handleSelectAllPositions}
          onDeselectAll={handleDeselectAllPositions}
        />;
      case 3:
        return <CandidateAssignmentStep 
          positions={positions}
          candidates={candidates}
          selectedPositions={selectedPositions}
          positionCandidates={positionCandidates}
          onCandidateAssign={handleCandidateAssignment}
          onSelectAllCandidates={handleSelectAllCandidates}
          onDeselectAllCandidates={handleDeselectAllCandidates}
        />;
      case 4:
        return <ReviewStep 
          data={prepareReviewData()}
          onConfirm={handleCreateBallot}
          loading={loading}
        />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="ballot-creation-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading ballot creation wizard...</p>
      </div>
    );
  }

  return (
    <div className="ballot-creation-container">
      <div className="ballot-creation-header">
        <h2>Create New Ballot</h2>
        <p className="text-muted">Multi-step wizard to create a comprehensive voting ballot</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress">
          <div 
            className="progress-bar" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="step-indicators">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step} 
              className={`step-indicator ${currentStep >= step ? 'active' : ''}`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="step-labels">
          <span>Election Details</span>
          <span>Positions</span>
          <span>Candidates</span>
          <span>Review</span>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </div>
      )}

      {/* Step Content */}
      <div className="step-content">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="step-navigation">
        <button 
          className="btn btn-outline-secondary"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Previous
        </button>
        
        {currentStep < totalSteps ? (
          <button 
            className="btn btn-primary"
            onClick={nextStep}
          >
            Next
            <i className="fas fa-arrow-right ms-2"></i>
          </button>
        ) : (
          <button 
            className="btn btn-success"
            onClick={handleCreateBallot}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Create Ballot
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Step Components
const ElectionDetailsStep = ({ electionData, onChange }) => (
  <div className="step-card">
    <h3>Step 1: Election Details</h3>
    <p className="text-muted">Define the basic information for your election</p>
    
    <div className="row">
      <div className="col-md-6">
        <div className="mb-3">
          <label className="form-label">Election Title *</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={electionData.title}
            onChange={onChange}
            placeholder="e.g., Student Council Election 2024"
            required
          />
        </div>
      </div>
      <div className="col-md-6">
        <div className="mb-3">
          <label className="form-label">Start Date & Time *</label>
          <input
            type="datetime-local"
            className="form-control"
            name="startDate"
            value={electionData.startDate}
            onChange={onChange}
            required
          />
        </div>
      </div>
    </div>
    
    <div className="row">
      <div className="col-md-6">
        <div className="mb-3">
          <label className="form-label">End Date & Time *</label>
          <input
            type="datetime-local"
            className="form-control"
            name="endDate"
            value={electionData.endDate}
            onChange={onChange}
            required
          />
        </div>
      </div>
      <div className="col-md-6">
        <div className="mb-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              name="isActive"
              checked={electionData.isActive}
              onChange={onChange}
            />
            <label className="form-check-label">
              Start election immediately after creation
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <div className="mb-3">
      <label className="form-label">Description</label>
      <textarea
        className="form-control"
        name="description"
        value={electionData.description}
        onChange={onChange}
        rows="3"
        placeholder="Describe the election purpose and rules..."
      />
    </div>
  </div>
);

const PositionSelectionStep = ({ 
  positions, 
  selectedPositions, 
  onPositionSelect, 
  onSelectAll,
  onDeselectAll
}) => (
  <div className="step-card">
    <h3>Step 2: Position Selection</h3>
    <p className="text-muted">Select existing positions for the ballot</p>
    
    {/* Select/Deselect All */}
    <div className="select-all-container">
      <h6>Quick Actions</h6>
      <div className="select-all-buttons">
        <button 
          type="button" 
          className="btn btn-outline-primary btn-sm"
          onClick={onSelectAll}
        >
          <i className="fas fa-check-square me-2"></i>
          Select All
        </button>
        <button 
          type="button" 
          className="btn btn-outline-secondary btn-sm"
          onClick={onDeselectAll}
        >
          <i className="fas fa-square me-2"></i>
          Deselect All
        </button>
      </div>
    </div>
    
    {/* Existing Positions */}
    <div className="mb-4">
      <h5>Available Positions</h5>
      <div className="row">
        {positions.map(position => (
          <div key={position.id} className="col-md-6 mb-3">
            <div 
              className={`position-card ${selectedPositions.includes(position.id) ? 'selected' : ''}`}
              onClick={() => onPositionSelect(position.id, !selectedPositions.includes(position.id))}
            >
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedPositions.includes(position.id)}
                  onChange={(e) => onPositionSelect(position.id, e.target.checked)}
                />
                <label className="form-check-label">
                  <strong>{position.title}</strong>
                  <br />
                  <small className="text-muted">{position.description}</small>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CandidateAssignmentStep = ({
  positions,
  candidates,
  selectedPositions,
  positionCandidates,
  onCandidateAssign,
  onSelectAllCandidates,
  onDeselectAllCandidates
}) => {
  const allPositions = selectedPositions.map(id => ({ id, isExisting: true }));

  return (
    <div className="step-card">
      <h3>Step 3: Candidate Assignment</h3>
      <p className="text-muted">Assign existing candidates for each position</p>
      
      {allPositions.map((position, posIndex) => (
        <div key={position.id} className="position-candidates-section mb-4">
          <h5>
            {positions.find(p => p.id === position.id)?.title}
          </h5>
          
          {/* Select/Deselect All for this position */}
          <div className="select-all-container mb-3">
            <h6>Quick Actions</h6>
            <div className="select-all-buttons">
              <button 
                type="button" 
                className="btn btn-outline-primary btn-sm"
                onClick={() => onSelectAllCandidates(position.id)}
              >
                <i className="fas fa-check-square me-2"></i>
                Select All
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => onDeselectAllCandidates(position.id)}
              >
                <i className="fas fa-square me-2"></i>
                Deselect All
              </button>
            </div>
          </div>
          
          {/* Existing Candidates */}
          <div className="mb-3">
            <h6>Available Candidates</h6>
            <div className="row">
              {candidates
                .filter(candidate => candidate.positionId === position.id)
                .map(candidate => (
                  <div key={candidate.id} className="col-md-6 mb-2">
                    <div 
                      className={`candidate-card ${positionCandidates[position.id]?.includes(candidate.id) ? 'selected' : ''}`}
                      onClick={() => onCandidateAssign(position.id, candidate.id, !positionCandidates[position.id]?.includes(candidate.id))}
                    >
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={positionCandidates[position.id]?.includes(candidate.id) || false}
                          onChange={(e) => onCandidateAssign(position.id, candidate.id, e.target.checked)}
                        />
                        <label className="form-check-label">
                          <strong>{candidate.name}</strong>
                          <br />
                          <small className="text-muted">{candidate.studentId}</small>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ReviewStep = ({ data, onConfirm, loading }) => (
  <div className="step-card">
    <h3>Step 4: Review & Create</h3>
    <p className="text-muted">Review all information before creating the ballot</p>
    
    <div className="review-sections">
      {/* Election Details */}
      <div className="review-section">
        <h5>Election Details</h5>
        <div className="row">
          <div className="col-md-6">
            <p><strong>Title:</strong> {data.election.title}</p>
            <p><strong>Description:</strong> {data.election.description || 'No description'}</p>
          </div>
          <div className="col-md-6">
            <p><strong>Start Date:</strong> {new Date(data.election.startDate).toLocaleString()}</p>
            <p><strong>End Date:</strong> {new Date(data.election.endDate).toLocaleString()}</p>
            <p><strong>Active:</strong> {data.election.isActive ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
      
      {/* Positions */}
      <div className="review-section">
        <h5>Positions ({data.positions.length})</h5>
        <div className="row">
          {data.positions.map((position, index) => (
            <div key={index} className="col-md-6 mb-2">
              <div className="position-review-card">
                <strong>{position.title}</strong>
                <br />
                <small className="text-muted">
                  ID: {position.id} | Vote Limit: {position.voteLimit || 1}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Candidates */}
      <div className="review-section">
        <h5>Candidates ({data.candidates.length})</h5>
        <div className="row">
          {data.candidates.map((candidate, index) => (
            <div key={index} className="col-md-6 mb-2">
              <div className="candidate-review-card">
                <strong>{candidate.name}</strong>
                <br />
                <small className="text-muted">
                  {candidate.studentId} | {candidate.email}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <div className="alert alert-warning">
      <i className="fas fa-exclamation-triangle me-2"></i>
      <strong>Important:</strong> Once created, the ballot structure cannot be easily modified. 
      Please review all information carefully.
    </div>
  </div>
);

export default BallotCreation; 