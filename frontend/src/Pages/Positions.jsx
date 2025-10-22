import React, { useState, useEffect } from 'react';
import { getPositions, createPosition, updatePosition, deletePosition } from '../services/api';
import './Positions.css';

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [formData, setFormData] = useState({ id: '', Position_Title: '', voteLimit: 1, Position_Description: '', displayOrder: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    filterAndSortPositions();
  }, [positions, searchTerm, sortConfig]);

  const filterAndSortPositions = () => {
    let filtered = positions;

    // Apply search filter
    if (searchTerm) {
      filtered = positions.filter(position =>
        position.Position_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredPositions(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <i className="fas fa-sort text-muted"></i>;
    }
    return sortConfig.direction === 'asc' 
      ? <i className="fas fa-sort-up text-primary"></i>
      : <i className="fas fa-sort-down text-primary"></i>;
  };

  const fetchPositions = async () => {
    try {
      const data = await getPositions();
      console.log('Fetched positions:', data); // Debug log
      
      // Trim any whitespace from position IDs to prevent API issues
      const trimmedData = data.map(position => ({
        ...position,
        id: position.id?.toString().trim()
      }));
      
      console.log('Trimmed positions:', trimmedData); // Debug log
      setPositions(trimmedData);
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.Position_Title.trim()) {
      alert('Please enter a valid position title');
      return;
    }
    
    try {
      if (editingPosition) {
        await updatePosition(editingPosition.id, {
          Position_Title: formData.Position_Title,
          Position_Description: formData.Position_Description,
          voteLimit: Number(formData.voteLimit),
          displayOrder: Number(formData.displayOrder)
        });
      } else {
        const positionData = {
          id: formData.id, // Include the custom ID
          Position_Title: formData.Position_Title,
          Position_Description: formData.Position_Description,
          voteLimit: Number(formData.voteLimit),
          displayOrder: Number(formData.displayOrder)
        };
        console.log('Creating position with data:', positionData); // Debug log
        await createPosition(positionData);
      }
      setShowModal(false);
      setEditingPosition(null);
      setFormData({ id: '', Position_Title: '', voteLimit: 1, Position_Description: '', displayOrder: 0 });
      fetchPositions();
    } catch (error) {
      console.error('Error saving position:', error);
    }
  };

  const handleEdit = (position) => {
    setEditingPosition(position);
    setFormData({ 
      id: position.id, 
      Position_Title: position.Position_Title, 
      voteLimit: position.voteLimit,
      Position_Description: position.Position_Description || '',
      displayOrder: position.displayOrder || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      // Trim any whitespace from the ID
      const trimmedId = id?.toString().trim();
      console.log('Deleting position with ID:', trimmedId); // Debug log
      console.log('Original ID:', id);
      console.log('Original ID length:', id?.toString().length);
      console.log('Trimmed ID:', trimmedId);
      console.log('Trimmed ID length:', trimmedId?.length);
      
      // Validate that we have a valid ID
      if (!trimmedId) {
        throw new Error('Invalid position ID');
      }
      
      const result = await deletePosition(trimmedId);
      console.log('Position deleted successfully, refreshing list...'); // Debug log
      
      // Show success message about trash bin
      setSuccessMessage(`Position "${positionToDelete?.Position_Title}" has been moved to the trash bin. You can restore it later or permanently delete it from the Trash Bin page.`);
      
      // Refresh the positions list to get updated data
      await fetchPositions();
      // Close modal and reset state
      setShowDeleteModal(false);
      setPositionToDelete(null);
      
      // Clear success message after 8 seconds
      setTimeout(() => setSuccessMessage(''), 8000);
    } catch (error) {
      console.error('Error deleting position:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        // Position was already deleted or doesn't exist
        // Refresh the list to get current data
        await fetchPositions();
        setShowDeleteModal(false);
        setPositionToDelete(null);
      }
    }
  };

  const openDeleteModal = (position) => {
    // Ensure the position ID is trimmed
    const trimmedPosition = {
      ...position,
      id: position.id?.toString().trim()
    };
    console.log('Opening delete modal for position:', trimmedPosition);
    setPositionToDelete(trimmedPosition);
    setShowDeleteModal(true);
  };

  const openModal = () => {
    setEditingPosition(null);
    setFormData({ id: '', Position_Title: '', voteLimit: 1, Position_Description: '', displayOrder: 0 });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="positions-container">
      {/* Unified Professional Header */}
      <div className="dashboard-header-pro">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title-pro">Manage Positions</h1>
            <p className="dashboard-subtitle-pro">Create and manage election positions.</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="btn btn-custom-blue" onClick={openModal}>
              Add Position
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
          <i className="fas fa-trash-alt me-2"></i>
          {successMessage}
          <div className="mt-2">
            <a href="/trash-bin?tab=positions" className="btn btn-sm btn-outline-success me-2">
              <i className="fas fa-trash me-1"></i>
              Go to Trash Bin
            </a>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setSuccessMessage('')}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search positions by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-6 text-end">
              <small className="text-muted">
                Showing {filteredPositions.length} of {positions.length} positions
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-header-custom">
                <tr>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('id')}
                    className="sortable-header"
                  >
                    ID {getSortIcon('id')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('Position_Title')}
                    className="sortable-header"
                  >
                    Title {getSortIcon('Position_Title')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('voteLimit')}
                    className="sortable-header"
                  >
                    Vote Limit {getSortIcon('voteLimit')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('displayOrder')}
                    className="sortable-header"
                  >
                    Display Order {getSortIcon('displayOrder')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPositions.map((position) => (
                  <tr key={position.id}>
                    <td>{position.id}</td>
                    <td>{position.Position_Title}</td>
                    <td>{position.voteLimit}</td>
                    <td>{position.displayOrder || 0}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary action-btn-icon"
                          onClick={() => handleEdit(position)}
                          title="Edit Position"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger action-btn-icon"
                          onClick={() => openDeleteModal(position)}
                          title="Delete Position"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ 
                background: '#f8f9fa !important', 
                backgroundImage: 'none !important',
                color: '#333 !important'
              }}>
                <h5 className="modal-title">
                  {editingPosition ? 'Edit Position' : 'Add New Position'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {!editingPosition && (
                    <div className="mb-3">
                      <label className="form-label">ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.id}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        required
                        placeholder="e.g. PRES, VP, SEC"
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.Position_Title}
                      onChange={(e) => {
                        // Remove numbers and special characters, keep only letters and spaces
                        const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        setFormData({ ...formData, Position_Title: lettersOnly });
                      }}
                      placeholder="Enter position title"
                      required
                    />
                    <small className="form-text text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Only letters and spaces are allowed. Numbers and special characters will be automatically removed.
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={formData.Position_Description}
                      onChange={(e) => setFormData({ ...formData, Position_Description: e.target.value })}
                      rows={3}
                      placeholder="Optional description for this position"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Vote Limit</label>
                    <input
                      type="number"
                      className="form-control"
                      min={1}
                      value={formData.voteLimit}
                      onChange={(e) => setFormData({ ...formData, voteLimit: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Display Order (Priority)</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                      placeholder="Lower numbers appear first (1 = highest priority)"
                    />
                    <small className="form-text text-muted">
                      Lower numbers appear first. 1 = highest priority, 0 = default.
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-custom-blue">
                    {editingPosition ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && positionToDelete && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Confirm Deletion
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPositionToDelete(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger">
                  <strong>Warning:</strong> This action cannot be undone!
                </div>
                <p>Are you sure you want to delete this position?</p>
                <div className="position-delete-info">
                  <strong>ID:</strong> {positionToDelete.id}<br />
                  <strong>Title:</strong> {positionToDelete.title}<br />
                  <strong>Vote Limit:</strong> {positionToDelete.voteLimit}<br />
                  <strong>Display Order:</strong> {positionToDelete.displayOrder || 0}
                </div>
                <p className="text-muted mt-2">
                  <small>
                    <i className="fas fa-info-circle me-1"></i>
                    The position will be moved to the <strong>Trash Bin</strong> and can be restored later or permanently deleted.
                  </small>
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPositionToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(positionToDelete.id)}
                >
                  <i className="fas fa-trash me-1"></i>
                  Delete Position
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Positions; 