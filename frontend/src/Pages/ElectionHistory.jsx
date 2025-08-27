import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getElectionHistory, deleteElection } from '../services/api';
import './ElectionHistory.css';

const ElectionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedElection, setSelectedElection] = useState(null);
  const [resultsModal, setResultsModal] = useState({ show: false, election: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, election: null, confirmationText: '' });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getElectionHistory();
      console.log('Election history response:', data); // Debug log
      setHistory(data?.elections || []);
      setError('');
    } catch (error) {
      console.error('Error fetching election history:', error);
      setError('Failed to load election history');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not set';
    return new Date(dateTime).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'active':
        return 'success';
      case 'paused':
        return 'info';
      case 'stopped':
        return 'danger';
      case 'ended':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'fas fa-clock';
      case 'active':
        return 'fas fa-play-circle';
      case 'paused':
        return 'fas fa-pause-circle';
      case 'stopped':
        return 'fas fa-stop-circle';
      case 'ended':
        return 'fas fa-check-circle';
      default:
        return 'fas fa-question-circle';
    }
  };

  const viewElectionDetails = (election) => {
    console.log('Opening election details for:', election);
    console.log('Candidates data:', election.candidates);
    setSelectedElection(election);
  };

  const closeElectionDetails = () => {
    setSelectedElection(null);
  };

  const openResultsModal = (election) => {
    setResultsModal({
      show: true,
      election: election
    });
  };

  const closeResultsModal = () => {
    setResultsModal({
      show: false,
      election: null
    });
  };

  const openDeleteModal = (election) => {
    setDeleteModal({
      show: true,
      election: election,
      confirmationText: ''
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      show: false,
      election: null,
      confirmationText: ''
    });
  };

  const handleDeleteElection = async () => {
    const { election, confirmationText } = deleteModal;
    
    if (confirmationText !== election.title) {
      setError('Ballot name does not match. Please type the exact ballot name to confirm deletion.');
      return;
    }

    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      await deleteElection(election.electionId);
      
      setSuccess(
        <div>
          Election "{election.title}" moved to trash successfully! 
          <button 
            className="btn btn-link p-0 ms-2" 
            onClick={() => window.location.href = '/trash-bin?tab=elections'}
          >
            Go to Trash Bin
          </button>
        </div>
      );
      closeDeleteModal();
      await fetchHistory(); // Refresh the list
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error deleting election:', error);
      setError(error.response?.data?.error || 'Failed to delete election');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="election-history-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading election history...</p>
      </div>
    );
  }

  return (
    <div className="election-history-container">
      {/* Unified Professional Header */}
      <div className="dashboard-header-pro">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title-pro">Election History</h1>
            <p className="dashboard-subtitle-pro">View completed elections and their results</p>
          </div>
          <div className="dashboard-header-actions">
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate('/admin/elections')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Elections
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* History List */}
      <div className="election-history-list">
        {history.length > 0 ? (
          history.map((election) => (
            <div key={election.electionId} className="election-history-card">
              <div className="election-history-header">
                <div className="election-history-title">
                  <h3>{election.title || 'Untitled Election'}</h3>
                  <span className={`status-badge badge bg-${getStatusColor(election.status)}`}>
                    <i className={`${getStatusIcon(election.status)} me-1`}></i>
                    {election.status ? election.status.charAt(0).toUpperCase() + election.status.slice(1) : 'Unknown'}
                  </span>
                </div>
                <div className="election-history-meta">
                  <small className="text-muted">
                    Created by {election.admin?.username || 'Unknown'}
                  </small>
                </div>
              </div>

              <div className="election-history-content">
                <p className="election-history-description">{election.description || 'No description available'}</p>
                
                <div className="election-history-stats">
                  <div className="stat-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span><strong>Start:</strong> {formatDateTime(election.startDate)}</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-calendar-check"></i>
                    <span><strong>End:</strong> {formatDateTime(election.endDate)}</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-briefcase"></i>
                    <span><strong>Positions:</strong> {election.totalPositions || 0}</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-vote-yea"></i>
                    <span><strong>Total Votes:</strong> {election.totalVotes || 0}</span>
                  </div>
                </div>

                <div className="election-history-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                  <button
                    className="btn btn-success btn-sm"
                    style={{ flex: '1', maxWidth: '100px', minWidth: '100px' }}
                    onClick={() => openResultsModal(election)}
                  >
                    <i className="fas fa-chart-bar me-1"></i>
                    Results
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: '1', maxWidth: '100px', minWidth: '100px' }}
                    onClick={() => viewElectionDetails(election)}
                  >
                    <i className="fas fa-eye me-1"></i>
                    Details
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: '1', maxWidth: '100px', minWidth: '100px' }}
                    onClick={() => openDeleteModal(election)}
                  >
                    <i className="fas fa-trash me-1"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-history">
            <i className="fas fa-history fa-3x mb-3"></i>
            <h3>No Election History</h3>
            <p>No completed elections found. Elections will appear here once they are ended.</p>
          </div>
        )}
      </div>

             {/* Election Details Modal */}
       {selectedElection && (
         <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
           <div className="modal-dialog custom-wide-modal" style={{ maxWidth: '1000px', width: '90%', marginLeft: '250px', marginRight: 'auto' }}>
             <div className="modal-content" style={{ maxWidth: '1700px', width: '100%' }}>
              <div className="modal-header">
                <h5 className="modal-title">Election Details: {selectedElection.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeElectionDetails}
                ></button>
              </div>
              <div className="modal-body">
                                 <div className="mb-4">
                   <h6 className="border-bottom pb-2 mb-3">Election Information</h6>
                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <label className="form-label"><strong>Description:</strong></label>
                       <div className="form-control-plaintext">
                         {selectedElection.description || 'No description'}
                       </div>
                     </div>
                     <div className="col-md-6 mb-3">
                       <label className="form-label"><strong>Created By:</strong></label>
                       <div className="form-control-plaintext">
                         {selectedElection.admin?.username || 'Unknown'}
                       </div>
                     </div>
                   </div>
                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <label className="form-label">
                         <i className="fas fa-calendar-alt me-1"></i>
                         <strong>Start Time:</strong>
                       </label>
                       <div className="form-control-plaintext">
                         {formatDateTime(selectedElection.startDate)}
                       </div>
                     </div>
                     <div className="col-md-6 mb-3">
                       <label className="form-label">
                         <i className="fas fa-calendar-check me-1"></i>
                         <strong>End Time:</strong>
                       </label>
                       <div className="form-control-plaintext">
                         {formatDateTime(selectedElection.endDate)}
                       </div>
                     </div>
                   </div>
                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <label className="form-label">
                         <i className="fas fa-briefcase me-1"></i>
                         <strong>Positions:</strong>
                       </label>
                       <div className="form-control-plaintext">
                         {selectedElection.totalPositions || 0}
                       </div>
                     </div>
                     <div className="col-md-6 mb-3">
                       <label className="form-label">
                         <i className="fas fa-vote-yea me-1"></i>
                         <strong>Total Votes Cast:</strong>
                       </label>
                       <div className="form-control-plaintext">
                         {selectedElection.totalVotes || 0}
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Candidates Section */}
                 <div className="mb-4">
                   <h6 className="border-bottom pb-2 mb-3">
                     <i className="fas fa-users me-2"></i>
                     Candidates
                   </h6>
                   {selectedElection.candidates && selectedElection.candidates.length > 0 ? (
                     <div className="table-responsive">
                       <table className="table table-striped table-hover">
                         <thead className="table-light">
                           <tr>
                             <th>Position</th>
                             <th>Candidate Name</th>
                             <th>Student ID</th>
                             <th>Department</th>
                             <th>Course</th>
                           </tr>
                         </thead>
                         <tbody>
                           {selectedElection.candidates.map((candidate, index) => (
                             <tr key={candidate.candidateId || index}>
                               <td>
                                 <span className="badge bg-primary">
                                   {candidate.position || 'Unknown Position'}
                                 </span>
                               </td>
                               <td>
                                 <strong>{candidate.name || 'Unknown'}</strong>
                               </td>
                               <td>{candidate.studentId || 'N/A'}</td>
                               <td>{candidate.department || 'N/A'}</td>
                               <td>{candidate.course || 'N/A'}</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   ) : (
                     <div className="alert alert-info">
                       <i className="fas fa-info-circle me-2"></i>
                       No candidate information available for this election.
                     </div>
                   )}
                 </div>
                

              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeElectionDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {resultsModal.show && resultsModal.election && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-chart-bar me-2 text-success"></i>
                  Election Results: {resultsModal.election.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeResultsModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Election Summary */}
                <div className="mb-4">
                  <h6 className="border-bottom pb-2 mb-3">Election Summary</h6>
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <div className="text-center p-3 bg-light rounded">
                        <h4 className="text-primary mb-1">{resultsModal.election.totalVotes || 0}</h4>
                        <small className="text-muted">Total Votes</small>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-center p-3 bg-light rounded">
                        <h4 className="text-success mb-1">{resultsModal.election.voterTurnout || 0}%</h4>
                        <small className="text-muted">Voter Turnout</small>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-center p-3 bg-light rounded">
                        <h4 className="text-info mb-1">{resultsModal.election.totalPositions || 0}</h4>
                        <small className="text-muted">Positions</small>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-center p-3 bg-light rounded">
                        <h4 className="text-warning mb-1">{resultsModal.election.totalCandidates || 0}</h4>
                        <small className="text-muted">Candidates</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results by Position */}
                <div className="mb-4">
                  <h6 className="border-bottom pb-2 mb-3">Results by Position</h6>
                  {resultsModal.election.resultsByPosition && Object.entries(resultsModal.election.resultsByPosition).map(([positionTitle, positionData]) => (
                    <div key={positionData.positionId} className="mb-4">
                      <h6 className="text-primary mb-3">
                        <i className="fas fa-briefcase me-2"></i>
                        {positionTitle}
                        {positionData.candidates && positionData.candidates.length > 0 && (
                          <span className="badge bg-success ms-2">
                            🏆 Winner: {positionData.candidates[0].candidateName}
                          </span>
                        )}
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-striped table-hover">
                          <thead className="table-dark">
                            <tr>
                              <th>Rank</th>
                              <th>Candidate</th>
                              <th>Department</th>
                              <th>Course</th>
                              <th>Votes</th>
                              <th>Percentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {positionData.candidates && positionData.candidates.map((candidate, index) => {
                              const votePercentage = resultsModal.election.totalVotes > 0 
                                ? Math.round((candidate.voteCount / resultsModal.election.totalVotes) * 100) 
                                : 0;
                              return (
                                <tr key={candidate.candidateId} className={index === 0 ? 'table-success' : ''}>
                                  <td>
                                    <span className={`badge ${index === 0 ? 'bg-success' : 'bg-secondary'}`}>
                                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                    </span>
                                  </td>
                                  <td>
                                    <div>
                                      <strong>{candidate.candidateName}</strong>
                                      <br />
                                      <small className="text-muted">{candidate.candidateStudentId}</small>
                                    </div>
                                  </td>
                                  <td>{candidate.candidateDepartment}</td>
                                  <td>{candidate.candidateCourse}</td>
                                  <td>
                                    <span className="badge bg-primary fs-6">{candidate.voteCount}</span>
                                  </td>
                                  <td>
                                    <div className="progress" style={{ height: '20px' }}>
                                      <div 
                                        className="progress-bar bg-primary" 
                                        style={{ width: `${votePercentage}%` }}
                                      >
                                        {votePercentage}%
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Statistics */}
                <div className="mb-3">
                  <h6 className="border-bottom pb-2 mb-3">Additional Statistics</h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label"><strong>Election Duration:</strong></label>
                      <div className="form-control-plaintext">
                        {resultsModal.election.durationInMinutes ? 
                          `${Math.floor(resultsModal.election.durationInMinutes / 60)} hours ${resultsModal.election.durationInMinutes % 60} minutes` : 
                          'N/A'
                        }
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label"><strong>Voter Participation:</strong></label>
                      <div className="form-control-plaintext">
                        {resultsModal.election.votersWhoVoted || 0} out of {resultsModal.election.totalVoters || 0} voters
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeResultsModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.election && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-warning">
                  <i className="fas fa-trash me-2"></i>
                  Move Election to Trash
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDeleteModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning mb-3">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Move to Trash:</strong> The election will be moved to the trash bin where it can be restored later or permanently deleted.
                </div>
                
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Election to delete:</strong>
                  </label>
                  <div className="form-control-plaintext">
                    {deleteModal.election.title}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">
                    Type the ballot name <strong>"{deleteModal.election.title}"</strong> to confirm deletion:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={deleteModal.confirmationText}
                    onChange={(e) => setDeleteModal({
                      ...deleteModal,
                      confirmationText: e.target.value
                    })}
                    placeholder={`Type: ${deleteModal.election.title}`}
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleDeleteElection}
                  disabled={deleting || deleteModal.confirmationText !== deleteModal.election.title}
                >
                  {deleting ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-1"></i>
                      Moving to Trash...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash me-1"></i>
                      Move to Trash
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionHistory; 