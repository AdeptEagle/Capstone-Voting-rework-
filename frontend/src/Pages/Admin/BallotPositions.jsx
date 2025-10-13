import React, { useState, useEffect } from 'react';
import { useBallot } from '../../contexts/BallotContext';
import { 
  getPositionAssignmentStatus
} from '../../services/api';
import './BallotPositions.css';

const BallotPositions = () => {
  const { activeBallot } = useBallot();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeBallot) {
      fetchPositions();
    } else {
      setLoading(false);
    }
  }, [activeBallot]);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const data = await getPositionAssignmentStatus(activeBallot.id);
      setPositions(data);
      setError('');
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError('Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="ballot-positions-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading ballot positions...</p>
      </div>
    );
  }

  if (!activeBallot) {
    return (
      <div className="ballot-positions-error">
        <div className="alert alert-warning text-center">
          <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
          <h4>No Current Ballot</h4>
          <p>There is no current ballot to view positions for.</p>
          <p className="mb-0">Please create a ballot first.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ballot-positions-error">
        <div className="alert alert-danger text-center">
          <i className="fas fa-exclamation-circle fa-2x mb-3"></i>
          <h4>Error Loading Positions</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={fetchPositions}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const assignedPositions = positions.filter(pos => pos.isAssigned);
  const unassignedPositions = positions.filter(pos => !pos.isAssigned);

  return (
    <div className="ballot-positions-container">
      <div className="dashboard-header-pro">
        <div className="header-content">
          <h1>Ballot Positions View</h1>
                             <p>View positions for: <strong>{activeBallot.Ballot_Title}</strong> 
            <span className={`badge ms-2 ${activeBallot.Ballot_Status === 'ACTIVE' ? 'bg-success' : activeBallot.Ballot_Status === 'PAUSED' ? 'bg-warning' : activeBallot.Ballot_Status === 'STOPPED' ? 'bg-danger' : 'bg-secondary'}`}>
              {activeBallot.Ballot_Status}
            </span>
          </p>
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Note:</strong> Positions are now managed during ballot creation. Use the "Edit Ballot" option to modify positions.
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="row">
        {/* Assigned Positions */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-check-circle text-success me-2"></i>
                Positions in Ballot ({assignedPositions.length})
              </h5>
            </div>
            <div className="card-body">
              {assignedPositions.length === 0 ? (
                <p className="text-muted text-center py-3">No positions assigned to this ballot yet.</p>
              ) : (
                <div className="list-group list-group-flush">
                  {assignedPositions.map((position) => (
                    <div key={position.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{position.Position_Title}</h6>
                        <small className="text-muted">Vote Limit: {position.voteLimit}</small>
                      </div>
                      <span className="badge bg-success">
                        <i className="fas fa-check me-1"></i>
                        Assigned
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          <strong>View Only:</strong> This page now shows a read-only view of ballot positions. 
          To modify positions, use the "Edit Ballot" option from the Elections page.
        </div>
      </div>
    </div>
  );
};

export default BallotPositions; 