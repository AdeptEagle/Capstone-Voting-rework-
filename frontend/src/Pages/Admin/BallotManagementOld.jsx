import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getBallots, 
  createBallot, 
  updateBallot, 
  deleteBallot, 
  activateBallot, 
  pauseBallot, 
  endBallot,
  getBallotResults,
  getPositions,
  getCandidates
} from '../../services/api';
import './BallotManagement.css';

const BallotManagement = () => {
  const [ballots, setBallots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBallot, setEditingBallot] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({
    Ballot_Title: '',
    Ballot_Description: '',
    Ballot_StartDate: '',
    Ballot_EndDate: '',
    Ballot_RequireAllPositions: true,
    Ballot_ShowResults: true,
    Ballot_ShowResultsAfter: '',
    Ballot_ShowLiveResults: true,
    positionIds: [],
    candidateIds: []
  });
  const [loadingForm, setLoadingForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBallots();
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [positionsData, candidatesData] = await Promise.all([
        getPositions(),
        getCandidates()
      ]);
      console.log('Fetched positions:', positionsData);
      console.log('Fetched candidates:', candidatesData);
      setPositions(positionsData);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const fetchBallots = async () => {
    try {
      setLoading(true);
      const ballotsData = await getBallots();
      setBallots(ballotsData);
    } catch (error) {
      console.error('Error fetching ballots:', error);
      setError('Failed to load ballots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get Philippine time in datetime-local format
  const getPhilippineTimeForInput = (addMinutes = 0) => {
    const now = new Date();
    // Convert to Philippine time (UTC+8)
    const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const futureTime = new Date(philippineTime.getTime() + (addMinutes * 60 * 1000));
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    return futureTime.toISOString().slice(0, 16);
  };

  // Helper function to convert datetime-local to ISO format for API
  const convertToISO = (dateTimeLocal) => {
    if (!dateTimeLocal) return null;
    // datetime-local format: YYYY-MM-DDTHH:MM
    // Convert to ISO format: YYYY-MM-DDTHH:MM:SS.sssZ
    return new Date(dateTimeLocal).toISOString();
  };

  const handleCreateBallot = () => {
    setEditingBallot(null);
    setFormData({
      Ballot_Title: '',
      Ballot_Description: '',
      Ballot_StartDate: getPhilippineTimeForInput(10), // Default to 10 minutes from now
      Ballot_EndDate: getPhilippineTimeForInput(60 * 24), // Default to 24 hours from now
      // Remove confusing ballot-level vote limits - these are managed per position
      Ballot_RequireAllPositions: true,
      Ballot_ShowResults: true,
      Ballot_ShowResultsAfter: '',
      Ballot_ShowLiveResults: true,
      positionIds: [],
      candidateIds: []
    });
    setShowCreateForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePositionChange = (positionId, checked) => {
    setFormData(prev => {
      const newPositionIds = checked 
        ? [...prev.positionIds, positionId]
        : prev.positionIds.filter(id => id !== positionId);
      
      // Remove candidates that belong to unselected positions
      const newCandidateIds = prev.candidateIds.filter(candidateId => {
        const candidate = candidates.find(c => c.id === candidateId);
        return candidate && newPositionIds.includes(candidate.positionId);
      });
      
      return {
        ...prev,
        positionIds: newPositionIds,
        candidateIds: newCandidateIds
      };
    });
  };

  const handleCandidateChange = (candidateId, checked) => {
    setFormData(prev => ({
      ...prev,
      candidateIds: checked 
        ? [...prev.candidateIds, candidateId]
        : prev.candidateIds.filter(id => id !== candidateId)
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 FORM SUBMIT TRIGGERED!');
    setLoadingForm(true);
    setError('');

    // Client-side validation
    if (!formData.Ballot_Title.trim()) {
      setError('Ballot title is required');
      setLoadingForm(false);
      return;
    }

    if (!formData.Ballot_StartDate) {
      setError('Start date is required');
      setLoadingForm(false);
      return;
    }

    if (!formData.Ballot_EndDate) {
      setError('End date is required');
      setLoadingForm(false);
      return;
    }

    if (formData.positionIds.length === 0) {
      setError('At least one position must be selected');
      setLoadingForm(false);
      return;
    }

    if (!formData.candidateIds || formData.candidateIds.length === 0) {
      setError('At least one candidate must be selected');
      setLoadingForm(false);
      return;
    }

    // Validate that each selected position has at least one candidate
    const selectedPositions = new Set(formData.positionIds);
    const candidatePositions = new Set(
      formData.candidateIds.map(candidateId => {
        const candidate = candidates.find(c => c.id === candidateId);
        return candidate?.positionId;
      }).filter(Boolean)
    );

    const positionsWithoutCandidates = formData.positionIds.filter(posId => !candidatePositions.has(posId));
    if (positionsWithoutCandidates.length > 0) {
      const positionNames = positionsWithoutCandidates.map(posId => {
        const position = positions.find(p => p.id === posId);
        return position?.Position_Title || 'Unknown Position';
      }).join(', ');
      setError(`Each position must have at least one candidate. Missing candidates for: ${positionNames}`);
      setLoadingForm(false);
      return;
    }

    console.log('🧪 VALIDATION DEBUG:');
    console.log('Positions selected:', formData.positionIds);
    console.log('Candidates selected:', formData.candidateIds);
    console.log('Submitting ballot with data:', formData);
    console.log('Available positions:', positions);
    console.log('Available candidates:', candidates);

    try {
      // Simplified date conversion
      const convertToISO = (localDateTime) => {
        if (!localDateTime) return null;
        return new Date(localDateTime).toISOString();
      };

      // Clean the form data before sending
      const cleanedFormData = {
        Ballot_Title: formData.Ballot_Title.trim(),
        Ballot_Description: formData.Ballot_Description.trim() || null,
        Ballot_StartDate: convertToISO(formData.Ballot_StartDate),
        Ballot_EndDate: convertToISO(formData.Ballot_EndDate),
        Ballot_RequireAllPositions: formData.Ballot_RequireAllPositions,
        Ballot_ShowResults: formData.Ballot_ShowResults,
        Ballot_ShowResultsAfter: formData.Ballot_ShowResultsAfter.trim() === '' ? null : convertToISO(formData.Ballot_ShowResultsAfter),
        Ballot_ShowLiveResults: formData.Ballot_ShowLiveResults,
        positionIds: formData.positionIds,
        candidateIds: formData.candidateIds
      };

      console.log('🔧 CLEANED DATA:', cleanedFormData);
      console.log('📅 DATE CONVERSION DEBUG:');
      console.log('Original Start Date:', formData.Ballot_StartDate);
      console.log('Converted Start Date:', convertToISO(formData.Ballot_StartDate));
      console.log('Original End Date:', formData.Ballot_EndDate);
      console.log('Converted End Date:', convertToISO(formData.Ballot_EndDate));

      if (editingBallot) {
        console.log('📝 Updating ballot:', editingBallot.id);
        await updateBallot(editingBallot.id, cleanedFormData);
        setSuccess('Ballot updated successfully!');
      } else {
        console.log('🆕 Creating new ballot...');
        const result = await createBallot(cleanedFormData);
        console.log('✅ Ballot created successfully:', result);
        setSuccess('Ballot created successfully!');
      }
      
      setShowCreateForm(false);
      fetchBallots();
    } catch (error) {
      console.error('Error saving ballot:', error);
      console.error('Error response:', error.response?.data);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save ballot. Please try again.';
      
      if (error.response?.data?.message) {
        const serverMessage = error.response.data.message;
        if (Array.isArray(serverMessage)) {
          errorMessage = serverMessage.join(', ');
        } else {
          errorMessage = serverMessage;
        }
      } else if (error.response?.status === 400) {
        errorMessage = 'Please check your input data and try again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please contact support if this persists.';
      }
      
      setError(errorMessage);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleEditBallot = (ballot) => {
    setEditingBallot(ballot);
    setShowCreateForm(true);
  };

  const handleDeleteBallot = async (ballotId) => {
    if (!window.confirm('Are you sure you want to delete this ballot? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBallot(ballotId);
      setSuccess('Ballot deleted successfully!');
      fetchBallots();
    } catch (error) {
      console.error('Error deleting ballot:', error);
      setError('Failed to delete ballot. Please try again.');
    }
  };

  const handleBallotAction = async (ballotId, action) => {
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
      fetchBallots();
    } catch (error) {
      console.error(`Error ${action}ing ballot:`, error);
      setError(`Failed to ${action} ballot. Please try again.`);
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

  const getBallotStatus = (ballot) => {
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

  const getFilteredBallots = () => {
    let filtered = ballots;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ballot => {
        const status = getBallotStatus(ballot);
        return status.status === filterStatus;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ballot =>
        ballot.Ballot_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ballot.Ballot_Description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusCounts = () => {
    const counts = { all: ballots.length, active: 0, upcoming: 0, ended: 0, paused: 0, cancelled: 0 };
    
    ballots.forEach(ballot => {
      const status = getBallotStatus(ballot);
      counts[status.status] = (counts[status.status] || 0) + 1;
    });

    return counts;
  };

  if (loading) {
    return (
      <div className="ballot-management-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading ballots...</p>
        </div>
      </div>
    );
  }

  const filteredBallots = getFilteredBallots();
  const statusCounts = getStatusCounts();

  // Calculate statistics
  const stats = {
    total: ballots.length,
    active: ballots.filter(b => b.Ballot_IsActive && b.Ballot_Status === 'ACTIVE').length,
    upcoming: ballots.filter(b => {
      const now = new Date();
      const startDate = new Date(b.Ballot_StartDate);
      return !b.Ballot_IsActive && startDate > now;
    }).length,
    ended: ballots.filter(b => b.Ballot_Status === 'ENDED').length,
    paused: ballots.filter(b => b.Ballot_Status === 'PAUSED').length,
    cancelled: ballots.filter(b => b.Ballot_Status === 'CANCELLED').length
  };

  return (
    <div className="ballot-management-container">
      {/* Header Section */}
      <header>
        <h1>Ballot Management</h1>
        <p>Manage all voting ballots in your system</p>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Ballots</p>
          </div>
          <div className="stat-icon blue">
            <i className="fas fa-clipboard-list"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
          <div className="stat-icon green">
            <i className="fas fa-check-circle"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.upcoming}</h3>
            <p>Upcoming</p>
          </div>
          <div className="stat-icon yellow">
            <i className="fas fa-clock"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.ended}</h3>
            <p>Ended</p>
          </div>
          <div className="stat-icon red">
            <i className="fas fa-times-circle"></i>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-container">
          <div className="search-box">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search ballots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({stats.total})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
              onClick={() => setFilterStatus('active')}
            >
              Active ({stats.active})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilterStatus('upcoming')}
            >
              Upcoming ({stats.upcoming})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'ended' ? 'active' : ''}`}
              onClick={() => setFilterStatus('ended')}
            >
              Ended ({stats.ended})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'paused' ? 'active' : ''}`}
              onClick={() => setFilterStatus('paused')}
            >
              Paused ({stats.paused})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilterStatus('cancelled')}
            >
              Cancelled ({stats.cancelled})
            </button>
          </div>
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


      {/* Ballots Grid */}
      <div className="ballots-grid">
        {filteredBallots.length === 0 ? (
          <div className="no-ballots">
            <i className="fas fa-inbox"></i>
            <h3>No Ballots Found</h3>
            <p>
              {searchTerm || filterStatus !== 'all' 
                ? 'No ballots match your current filters.' 
                : 'No ballots have been created yet.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button 
                className="btn btn-primary"
                onClick={handleCreateBallot}
              >
                <i className="fas fa-plus"></i>
                Create Ballot
              </button>
            )}
          </div>
        ) : (
          filteredBallots.map(ballot => {
            const status = getBallotStatus(ballot);
            
            return (
              <div key={ballot.id} className="ballot-card">
                <div className="ballot-header">
                  <h3>{ballot.Ballot_Title}</h3>
                  <span className={`status-badge ${status.color}`}>
                    {status.text}
                  </span>
                </div>

                {ballot.Ballot_Description && (
                  <p className="ballot-description">{ballot.Ballot_Description}</p>
                )}

                <div className="ballot-details">
                  <div className="detail-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Starts: {formatDate(ballot.Ballot_StartDate)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar-check"></i>
                    <span>Ends: {formatDate(ballot.Ballot_EndDate)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-users"></i>
                    <span>Positions: {ballot.ballotPositions?.length || 0}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-user-tie"></i>
                    <span>Candidates: {ballot.ballotCandidates?.length || 0}</span>
                  </div>
                </div>

                <div className="ballot-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => navigate(`/admin/ballot-details/${ballot.id}`)}
                  >
                    <i className="fas fa-eye"></i>
                    View Details
                  </button>
                  
                  {status.status !== 'ended' && (
                    <button 
                      className="btn btn-outline"
                      onClick={() => handleEditBallot(ballot)}
                      title="Edit ballot"
                    >
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                  )}

                  {status.status === 'upcoming' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleBallotAction(ballot.id, 'activate')}
                    >
                      <i className="fas fa-play"></i>
                      Activate
                    </button>
                  )}

                  {status.status === 'active' && (
                    <>
                      <button 
                        className="btn btn-warning"
                        onClick={() => handleBallotAction(ballot.id, 'pause')}
                      >
                        <i className="fas fa-pause"></i>
                        Pause
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleBallotAction(ballot.id, 'end')}
                      >
                        <i className="fas fa-stop"></i>
                        End
                      </button>
                    </>
                  )}

                  {status.status === 'paused' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleBallotAction(ballot.id, 'activate')}
                    >
                      <i className="fas fa-play"></i>
                      Resume
                    </button>
                  )}

                  <button 
                    className={`btn btn-danger ${status.status === 'ended' ? 'disabled' : ''}`}
                    onClick={() => status.status !== 'ended' && handleDeleteBallot(ballot.id)}
                    disabled={status.status === 'ended'}
                    title={status.status === 'ended' ? 'Cannot delete ended ballot' : 'Delete ballot'}
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Ballot Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingBallot ? 'Edit Ballot' : 'Create New Ballot'}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Ballot Title *</label>
                <input
                  type="text"
                  name="Ballot_Title"
                  value={formData.Ballot_Title}
                  onChange={handleFormChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="Ballot_Description"
                  value={formData.Ballot_Description}
                  onChange={handleFormChange}
                  className="form-control"
                  rows={3}
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="datetime-local"
                      name="Ballot_StartDate"
                      value={formData.Ballot_StartDate}
                      onChange={handleFormChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">End Date *</label>
                    <input
                      type="datetime-local"
                      name="Ballot_EndDate"
                      value={formData.Ballot_EndDate}
                      onChange={handleFormChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vote limits are now managed per position, not per ballot */}
              <div className="alert alert-info">
                <i className="fas fa-info-circle"></i>
                <strong>Note:</strong> Vote limits are configured per position in the Position Management section. 
                Each position can have its own vote limit (e.g., President: 1 vote, Senators: 3 votes).
              </div>

              {/* Settings */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <i className="fas fa-cogs"></i> Settings
                </h4>
                
                <div className="form-group">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="Ballot_RequireAllPositions"
                      checked={formData.Ballot_RequireAllPositions}
                      onChange={handleFormChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">
                      <strong>Require All Positions</strong>
                      <small className="text-muted d-block">Voters must vote for all positions before submitting</small>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="Ballot_ShowResults"
                      checked={formData.Ballot_ShowResults}
                      onChange={handleFormChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">
                      <strong>Show Results</strong>
                      <small className="text-muted d-block">Allow users to view results after voting</small>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="Ballot_ShowLiveResults"
                      checked={formData.Ballot_ShowLiveResults}
                      onChange={handleFormChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">
                      <strong>Show Live Results</strong>
                      <small className="text-muted d-block">Update results in real-time during voting</small>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Show Results After (Optional)</label>
                  <input
                    type="datetime-local"
                    name="Ballot_ShowResultsAfter"
                    value={formData.Ballot_ShowResultsAfter}
                    onChange={handleFormChange}
                    className="form-control"
                  />
                  <small className="text-muted">If set, results will only be visible after this date</small>
                </div>
              </div>

              {/* Positions Selection */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <i className="fas fa-users-cog"></i> Positions
                </h4>
                
                <label className="form-label">Select Positions * (Required - Select at least one)</label>
                {positions.length === 0 ? (
                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    No positions available. Please create positions first before creating a ballot.
                  </div>
                ) : (
                  <div className="positions-list">
                    {positions.map(position => (
                      <div key={position.id} className="form-check">
                        <input
                          type="checkbox"
                          id={`position-${position.id}`}
                          checked={formData.positionIds.includes(position.id)}
                          onChange={(e) => handlePositionChange(position.id, e.target.checked)}
                          className="form-check-input"
                        />
                        <label className="form-check-label" htmlFor={`position-${position.id}`}>
                          <strong>{position.Position_Title}</strong>
                          <small className="text-muted d-block">Vote limit: {position.voteLimit || 1} vote{(position.voteLimit || 1) !== 1 ? 's' : ''} per voter</small>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {formData.positionIds.length === 0 && (
                  <div className="text-danger mt-1">
                    <small><i className="fas fa-exclamation-circle"></i> You must select at least one position</small>
                  </div>
                )}
              </div>

              {/* Candidates Selection */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <i className="fas fa-user-friends"></i> Candidates
                </h4>
                
                <label className="form-label">Select Candidates * (Required - Select at least one)</label>
                {candidates.length === 0 ? (
                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    No candidates available. Please create candidates first before creating a ballot.
                  </div>
                ) : (
                  <div className="candidates-list">
                    {candidates.map(candidate => {
                      const isPositionSelected = formData.positionIds.includes(candidate.positionId);
                      return (
                        <div key={candidate.id} className={`form-check ${!isPositionSelected ? 'text-muted' : ''}`}>
                          <input
                            type="checkbox"
                            id={`candidate-${candidate.id}`}
                            checked={formData.candidateIds.includes(candidate.id)}
                            onChange={(e) => handleCandidateChange(candidate.id, e.target.checked)}
                            className="form-check-input"
                            disabled={!isPositionSelected}
                          />
                          <label className="form-check-label" htmlFor={`candidate-${candidate.id}`}>
                            {candidate.Candidate_Name} ({candidate.position?.Position_Title})
                            {!isPositionSelected && <small> - Position not selected</small>}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
                {formData.candidateIds.length === 0 && (
                  <div className="text-danger mt-1">
                    <small><i className="fas fa-exclamation-circle"></i> You must select at least one candidate</small>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={loadingForm}
                >
                  {loadingForm ? 'Saving...' : (editingBallot ? 'Update Ballot' : 'Create Ballot')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BallotManagement;
