import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getBallots, 
  createBallot, 
  createBallotFromTemplate, 
  updateBallot, 
  deleteBallot, 
  activateBallot, 
  pauseBallot, 
  endBallot,
  getBallotResults,
  getPositions,
  getCandidates
} from '../../services/api';
import { getDefaultBallotDates } from '../../utils/timezone';
import TemplateSelector from '../../components/TemplateSelector';
import CandidateSelector from '../../components/CandidateSelector';
import './BallotManagement.css';

const BallotManagement = () => {
  const [ballots, setBallots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showCandidateSelector, setShowCandidateSelector] = useState(false);
  const [showCreateOptions, setShowCreateOptions] = useState(false);
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
    Ballot_AllowAbstain: false,
    positionIds: [],
    candidateIds: []
  });
  const [loadingForm, setLoadingForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBallots();
    fetchFormData();
  }, []);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showTemplateSelector) {
          setShowTemplateSelector(false);
        } else if (showCandidateSelector) {
          setShowCandidateSelector(false);
        } else if (showCreateOptions) {
          setShowCreateOptions(false);
        } else if (showCreateForm) {
          setShowCreateForm(false);
          setEditingBallot(null);
          resetForm();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showTemplateSelector, showCandidateSelector, showCreateOptions, showCreateForm]);

  const fetchFormData = async () => {
    try {
      const [positionsData, candidatesData] = await Promise.all([
        getPositions(),
        getCandidates()
      ]);
      setPositions(positionsData);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const fetchBallots = async () => {
    try {
      setLoading(true);
      const data = await getBallots();
      setBallots(data);
    } catch (error) {
      console.error('Error fetching ballots:', error);
      setError('Failed to load ballots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBallotStatus = (ballot) => {
    const now = new Date();
    const startDate = new Date(ballot.Ballot_StartDate);
    const endDate = new Date(ballot.Ballot_EndDate);

    if (ballot.Ballot_Status === 'ENDED') {
      return { status: 'ended', text: 'Ended', color: 'red' };
    }
    if (ballot.Ballot_Status === 'PAUSED') {
      return { status: 'paused', text: 'Paused', color: 'yellow' };
    }
    if (ballot.Ballot_Status === 'CANCELLED') {
      return { status: 'cancelled', text: 'Cancelled', color: 'gray' };
    }
    if (now < startDate) {
      return { status: 'upcoming', text: 'Upcoming', color: 'blue' };
    }
    if (now > endDate) {
      return { status: 'ended', text: 'Ended', color: 'red' };
    }
    if (ballot.Ballot_IsActive) {
      return { status: 'active', text: 'Active', color: 'green' };
    }
    return { status: 'draft', text: 'Draft', color: 'gray' };
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
        ballot.Ballot_Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ballot.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const handleCreateBallot = () => {
    setEditingBallot(null);
    
    // Get default dates in Philippine timezone
    const { startDate, endDate } = getDefaultBallotDates();
    
    setFormData({
      Ballot_Title: '',
      Ballot_Description: '',
      Ballot_StartDate: startDate,
      Ballot_EndDate: endDate,
      Ballot_RequireAllPositions: true,
      Ballot_ShowResults: true,
      Ballot_ShowResultsAfter: '',
      Ballot_ShowLiveResults: true,
      Ballot_AllowAbstain: false,
      positionIds: [],
      candidateIds: []
    });
    setShowCreateOptions(true);
  };

  const handleEditBallot = (ballot) => {
    setEditingBallot(ballot);
    setFormData({
      Ballot_Title: ballot.Ballot_Title,
      Ballot_Description: ballot.Ballot_Description || '',
      Ballot_StartDate: ballot.Ballot_StartDate.split('T')[0],
      Ballot_EndDate: ballot.Ballot_EndDate.split('T')[0],
      Ballot_RequireAllPositions: ballot.Ballot_RequireAllPositions,
      Ballot_ShowResults: ballot.Ballot_ShowResults,
      Ballot_ShowResultsAfter: ballot.Ballot_ShowResultsAfter || '',
      Ballot_ShowLiveResults: ballot.Ballot_ShowLiveResults,
      Ballot_AllowAbstain: ballot.Ballot_AllowAbstain || false,
      positionIds: ballot.ballotPositions?.map(bp => bp.BallotPosition_PositionId) || [],
      candidateIds: ballot.ballotCandidates?.map(bc => bc.BallotCandidate_CandidateId) || []
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

  const handleCreateBallotClick = () => {
    setShowCreateOptions(true);
  };

  const handleCreateFromTemplate = () => {
    setShowCreateOptions(false);
    setShowTemplateSelector(true);
  };

  const handleCreateFromScratch = () => {
    setShowCreateOptions(false);
    setShowTemplateSelector(false); // Ensure template selector is closed
    // Reset form data to remove any template-related data
    setFormData({
      Ballot_Title: '',
      Ballot_Description: '',
      Ballot_StartDate: '',
      Ballot_EndDate: '',
      Ballot_RequireAllPositions: true,
      Ballot_ShowResults: true,
      Ballot_ShowResultsAfter: '',
      Ballot_ShowLiveResults: true,
      Ballot_AllowAbstain: false,
      positionIds: [],
      candidateIds: [],
      isFromTemplate: false, // Ensure this is false for scratch creation
      templateId: null
    });
    setShowCreateForm(true);
  };

  const handleCandidateSelectionComplete = async (selectedCandidates) => {
    setShowCandidateSelector(false);
    setLoadingForm(true);
    setError('');

    // Validate that we have the required data
    if (!formData.positionIds || formData.positionIds.length === 0) {
      setError('No positions selected. Please go back and select positions first.');
      setLoadingForm(false);
      return;
    }

    if (!selectedCandidates || selectedCandidates.length === 0) {
      setError('No candidates selected. Please select at least one candidate for each position.');
      setLoadingForm(false);
      return;
    }

    try {
      if (formData.isFromTemplate) {
        // Create ballot from template with selected candidates
        const ballotData = {
          title: formData.Ballot_Title,
          description: formData.Ballot_Description,
          startDate: new Date(formData.Ballot_StartDate).toISOString(),
          endDate: new Date(formData.Ballot_EndDate).toISOString(),
          showResultsAfter: formData.Ballot_ShowResultsAfter || undefined,
          candidateIds: selectedCandidates
        };
        
        console.log('🚀 Creating ballot from template with data:', {
          templateId: formData.templateId,
          ballotData: ballotData
        });
        
        await createBallotFromTemplate(formData.templateId, ballotData);
        setSuccess('Ballot created from template successfully!');
      } else {
        // Create ballot from scratch with selected candidates
        const ballotData = {
          Ballot_Title: formData.Ballot_Title,
          Ballot_Description: formData.Ballot_Description,
          Ballot_StartDate: new Date(formData.Ballot_StartDate).toISOString(),
          Ballot_EndDate: new Date(formData.Ballot_EndDate).toISOString(),
          Ballot_RequireAllPositions: formData.Ballot_RequireAllPositions,
          Ballot_ShowResults: formData.Ballot_ShowResults,
          Ballot_ShowResultsAfter: formData.Ballot_ShowResultsAfter ? new Date(formData.Ballot_ShowResultsAfter).toISOString() : undefined,
          Ballot_ShowLiveResults: formData.Ballot_ShowLiveResults,
          Ballot_AllowAbstain: formData.Ballot_AllowAbstain,
          positionIds: formData.positionIds,
          candidateIds: selectedCandidates
        };
        
        console.log('🚀 Creating ballot from scratch with data:', ballotData);
        console.log('🔍 Form data positionIds:', formData.positionIds);
        console.log('🔍 Selected candidates:', selectedCandidates);
        console.log('🔍 Available positions:', positions);
        console.log('🔍 Filtered positions for candidate selector:', positions.filter(pos => formData.positionIds.includes(pos.id)));
        
        await createBallot(ballotData);
        setSuccess('Ballot created successfully!');
      }
      
      fetchBallots();
    } catch (error) {
      console.error('Error creating ballot:', error);
      setError('Failed to create ballot. Please try again.');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleGoBackToOptions = () => {
    setShowTemplateSelector(false);
    setShowCandidateSelector(false);
    setShowCreateForm(false);
    setShowCreateOptions(true);
  };

  const handleTemplateSelect = (template) => {
    setShowTemplateSelector(false);
    setShowCreateForm(true);
    
    // Pre-fill form with template data
    const templateData = typeof template.BallotTemplate_Data === 'string' 
      ? JSON.parse(template.BallotTemplate_Data) 
      : template.BallotTemplate_Data;
    
    // Get default dates in Philippine timezone
    const { startDate, endDate } = getDefaultBallotDates();
    
    setFormData({
      ...formData,
      Ballot_Title: templateData.title || '',
      Ballot_Description: templateData.description || '',
      Ballot_StartDate: startDate,
      Ballot_EndDate: endDate,
      Ballot_RequireAllPositions: templateData.requireAllPositions !== false,
      Ballot_ShowResults: templateData.showResults !== false,
      Ballot_ShowLiveResults: templateData.showLiveResults !== false,
      Ballot_AllowAbstain: templateData.allowAbstain || false,
      positionIds: templateData.positions ? templateData.positions.map(p => p.positionId || p.positionTitle) : [],
      templatePositions: templateData.positions || [], // Store template positions for display
      isFromTemplate: true, // Flag to indicate this is from template
      templateId: template.id // Store template ID
    });
  };

  const handleModalOverlayClick = (e, modalType) => {
    // Only close if clicking the overlay itself, not the modal content
    if (e.target === e.currentTarget) {
      switch (modalType) {
        case 'createOptions':
          setShowCreateOptions(false);
          break;
        case 'templateSelector':
          setShowTemplateSelector(false);
          break;
        case 'candidateSelector':
          setShowCandidateSelector(false);
          break;
        case 'createForm':
          setShowCreateForm(false);
          setEditingBallot(null);
          resetForm();
          break;
        default:
          break;
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setError('');

    // Validate that positions are selected for non-template ballots
    if (!formData.isFromTemplate && formData.positionIds.length === 0) {
      setError('Please select at least one position before creating the ballot.');
      setLoadingForm(false);
      return;
    }

    try {
      if (editingBallot) {
        await updateBallot(editingBallot.id, formData);
        setSuccess('Ballot updated successfully!');
        setShowCreateForm(false);
        fetchBallots();
      } else if (formData.isFromTemplate) {
        // For templates, show candidate selector instead of creating ballot directly
        setShowCreateForm(false);
        setShowCandidateSelector(true);
      } else {
        // For create from scratch, show candidate selection modal
        setShowCreateForm(false);
        setShowCandidateSelector(true);
      }
    } catch (error) {
      console.error('Error saving ballot:', error);
      setError('Failed to save ballot. Please try again.');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleDeleteBallot = async (ballotId) => {
    if (!window.confirm('Are you sure you want to delete this ballot?')) {
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
      switch (action) {
        case 'activate':
          await activateBallot(ballotId);
          setSuccess('Ballot activated successfully!');
          break;
        case 'pause':
          await pauseBallot(ballotId);
          setSuccess('Ballot paused successfully!');
          break;
        case 'end':
          await endBallot(ballotId);
          setSuccess('Ballot ended successfully!');
          break;
        default:
          break;
      }
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

  const filteredBallots = getFilteredBallots();

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
            <i className="fas fa-vote-yea"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
          <div className="stat-icon green">
            <i className="fas fa-play-circle"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.upcoming}</h3>
            <p>Upcoming</p>
          </div>
          <div className="stat-icon yellow">
            <i className="fas fa-calendar-plus"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.ended}</h3>
            <p>Ended</p>
          </div>
          <div className="stat-icon red">
            <i className="fas fa-stop-circle"></i>
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

      {/* Error and Success Messages */}
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

      {/* Ballots Table */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-text">Loading...</div>
          <p>Loading ballots...</p>
        </div>
      ) : filteredBallots.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-clipboard-list"></i>
          <h3>No ballots found</h3>
          <p>
            {searchTerm || filterStatus !== 'all' 
              ? 'No ballots match your current filters.' 
              : 'Create your first ballot to get started.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button onClick={handleCreateBallot}>
              <i className="fas fa-plus"></i>
              New Ballot
            </button>
          )}
        </div>
      ) : (
        <div className="ballots-table">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ballot Name</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Participants</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBallots.map((ballot) => {
                  const status = getBallotStatus(ballot);
                  
                  return (
                    <tr key={ballot.id}>
                      <td>
                        <div className="ballot-info">
                          <div className="ballot-details">
                            <h4>{ballot.Ballot_Title}</h4>
                            <p>ID: {ballot.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${status.status}`}>
                          {status.text}
                        </span>
                      </td>
                      <td>{new Date(ballot.Ballot_StartDate).toLocaleDateString()}</td>
                      <td>{new Date(ballot.Ballot_EndDate).toLocaleDateString()}</td>
                      <td>{ballot._count?.userHistory || 0}</td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => navigate(`/admin/ballot-details/${ballot.id}`)}
                            title="View Ballot Details"
                          >
                            <i className="fas fa-eye"></i>
                            <span>View</span>
                          </button>
                          <button 
                            className="action-btn results-btn"
                            onClick={() => navigate(`/admin/ballot-details/${ballot.id}?tab=results`)}
                            title="View Results"
                          >
                            <i className="fas fa-chart-bar"></i>
                            <span>Results</span>
                          </button>
                          {status.status !== 'ended' && (
                            <button 
                              className="action-btn edit-btn"
                              onClick={() => handleEditBallot(ballot)}
                              title="Edit Ballot"
                            >
                              <i className="fas fa-edit"></i>
                              <span>Edit</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fixed Create Button */}
      <div className="fixed-create-btn">
        <button 
          className="create-btn"
          onClick={handleCreateBallot}
          title="Create New Ballot"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {/* Create Options Modal */}
      {showCreateOptions && (
        <div 
          className="modal-overlay"
          onClick={(e) => handleModalOverlayClick(e, 'createOptions')}
        >
          <div className="modal-content create-options-modal">
            <div className="modal-header">
              <h2>Create New Ballot</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateOptions(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p className="create-options-description">
                Choose how you'd like to create your ballot:
              </p>
              <p className="modal-hint">
                <i className="fas fa-info-circle"></i>
                Press ESC or click outside to close
              </p>
              <div className="create-options">
                <button 
                  className="create-option-btn"
                  onClick={handleCreateFromTemplate}
                >
                  <div className="option-icon">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div className="option-content">
                    <h3>From Template</h3>
                    <p>Use a pre-configured template with positions and settings</p>
                  </div>
                </button>
                <button 
                  className="create-option-btn"
                  onClick={handleCreateFromScratch}
                >
                  <div className="option-icon">
                    <i className="fas fa-edit"></i>
                  </div>
                  <div className="option-content">
                    <h3>From Scratch</h3>
                    <p>Create a custom ballot with your own settings</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Template Selector Modal */}
        {showTemplateSelector && (
          <div 
            className="modal-overlay"
            onClick={(e) => handleModalOverlayClick(e, 'templateSelector')}
          >
            <div className="modal-content template-selector-modal">
              <TemplateSelector 
                onSelect={handleTemplateSelect}
                onCancel={() => setShowTemplateSelector(false)}
                onGoBack={handleGoBackToOptions}
              />
            </div>
          </div>
        )}

      {/* Candidate Selector Modal */}
      {showCandidateSelector && (
        <div 
          className="modal-overlay"
          onClick={(e) => handleModalOverlayClick(e, 'candidateSelector')}
        >
          <div className="modal-content candidate-selector-modal">
            <CandidateSelector 
              templatePositions={formData.templatePositions || []}
              selectedPositions={formData.isFromTemplate ? [] : positions.filter(pos => formData.positionIds.includes(pos.id))}
              onComplete={handleCandidateSelectionComplete}
              onCancel={() => setShowCandidateSelector(false)}
              onGoBack={() => {
                setShowCandidateSelector(false);
                if (formData.isFromTemplate) {
                  setShowTemplateSelector(true);
                } else {
                  setShowCreateForm(true);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Create/Edit Ballot Modal */}
      {showCreateForm && (
        <div 
          className="modal-overlay"
          onClick={(e) => handleModalOverlayClick(e, 'createForm')}
        >
          <div className="modal-content ballot-creation-modal">
            <div className="modal-header">
              <div className="modal-header-left">
                <button 
                  className="go-back-btn"
                  onClick={handleGoBackToOptions}
                  title="Go back to options"
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <div className="modal-title-section">
                  <h2>{editingBallot ? 'Edit Ballot' : 'Create New Ballot'}</h2>
                  <p className="modal-subtitle">
                    {editingBallot ? 'Update ballot settings and configuration' : 'Configure your ballot settings and select positions'}
                  </p>
                </div>
              </div>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="modal-body">
              {/* Basic Information Section */}
              <div className="form-section">
                <div className="section-header">
                  <h3><i className="fas fa-info-circle"></i> Basic Information</h3>
                  <p>Enter the basic details for your ballot</p>
                </div>
                <div className="section-content">
                  <div className="form-group">
                    <label className="form-label">Ballot Title *</label>
                    <input
                      type="text"
                      name="Ballot_Title"
                      value={formData.Ballot_Title}
                      onChange={handleFormChange}
                      className="form-control"
                      placeholder="Enter ballot title"
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
                      rows="3"
                      placeholder="Enter ballot description (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Show template info when using a template */}
              {formData.isFromTemplate && (
                <div className="form-group">
                  <div className="template-info">
                    <h4>📋 Template Selected</h4>
                    <p>This ballot will use the template's predefined positions. After filling in the details, you'll be able to select specific candidates for each position.</p>
                    <div className="template-positions">
                      <strong>Positions included:</strong>
                      <ul>
                        {formData.templatePositions && formData.templatePositions.length > 0 ? (
                          formData.templatePositions.map((position, index) => (
                            <li key={index}>
                              {position.positionTitle || position.title || `Position ${index + 1}`}
                            </li>
                          ))
                        ) : (
                          <li>Loading positions...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Section */}
              <div className="form-section">
                <div className="section-header">
                  <h3><i className="fas fa-calendar-alt"></i> Schedule</h3>
                  <p>Set the start and end times for your ballot</p>
                </div>
                <div className="section-content">
                  <div className="form-row">
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
              </div>

              {/* Positions Section */}
              {!formData.isFromTemplate && (
                <div className="form-section">
                  <div className="section-header">
                    <h3><i className="fas fa-users"></i> Positions</h3>
                    <p>Select the positions to include in this ballot</p>
                  </div>
                  <div className="section-content">
                    <div className="checkbox-grid">
                      {positions.map(position => (
                        <label key={position.id} className="checkbox-item">
                          <input
                            type="checkbox"
                            value={position.id}
                            checked={formData.positionIds.includes(position.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  positionIds: [...prev.positionIds, position.id]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  positionIds: prev.positionIds.filter(id => id !== position.id)
                                }));
                              }
                            }}
                          />
                          <span className="checkbox-label">{position.Position_Title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Candidates Section - Show next step message */}
              {!formData.isFromTemplate && formData.positionIds.length > 0 && (
                <div className="form-section">
                  <div className="section-content">
                    <div className="next-step-message">
                      <i className="fas fa-arrow-right"></i>
                      <p>After filling in the details, you'll be able to select specific candidates for each position.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show message when no positions are selected */}
              {!formData.isFromTemplate && formData.positionIds.length === 0 && (
                <div className="form-section">
                  <div className="section-content">
                    <div className="no-positions-message">
                      <i className="fas fa-arrow-up"></i>
                      <p>Please select positions above to proceed to candidate selection</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ballot Settings Section */}
              <div className="form-section">
                <div className="section-header">
                  <h3><i className="fas fa-cog"></i> Ballot Settings</h3>
                  <p>Configure advanced options for your ballot</p>
                </div>
                <div className="section-content">
                  <div className="settings-grid">
                    <div className="setting-item">
                      <div className="setting-content">
                        <div className="setting-header">
                          <strong>Allow Abstain Option</strong>
                          <div className="toggle-container">
                            <input
                              type="checkbox"
                              id="Ballot_AllowAbstain"
                              name="Ballot_AllowAbstain"
                              checked={formData.Ballot_AllowAbstain}
                              onChange={handleFormChange}
                              className="toggle-input"
                            />
                            <label htmlFor="Ballot_AllowAbstain" className="toggle-label">
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                        <p className="setting-description">Enable voters to abstain from voting on specific positions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
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
                  {loadingForm ? 'Saving...' : (editingBallot ? 'Update Ballot' : (formData.isFromTemplate ? 'Continue' : 'Create Ballot'))}
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
