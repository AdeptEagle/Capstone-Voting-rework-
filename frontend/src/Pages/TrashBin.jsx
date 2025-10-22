import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Alert, Spinner, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaTrash, FaUndo, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import api from '../services/api';
import './TrashBin.css';

const TrashBin = () => {
  const [activeTab, setActiveTab] = useState('candidates');
  const [trashSummary, setTrashSummary] = useState(null);
  const [deletedItems, setDeletedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const tabs = [
    { key: 'candidates', label: 'Candidates', icon: '👤' },
    { key: 'positions', label: 'Positions', icon: '🏛️' },
    { key: 'departments', label: 'Departments', icon: '🏢' },
    { key: 'courses', label: 'Courses', icon: '📚' },
    { key: 'voters', label: 'Voters', icon: '🗳️' },
    { key: 'ballots', label: 'Ballots', icon: '🗳️' }
  ];

  useEffect(() => {
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam && tabs.some(tab => tab.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  useEffect(() => {
    fetchTrashSummary();
    fetchDeletedItems(activeTab);
  }, [activeTab]);

  const fetchTrashSummary = async () => {
    try {
      const response = await api.get('/trash/summary');
      setTrashSummary(response.data);
    } catch (error) {
      console.error('Error fetching trash summary:', error);
      setError('Failed to load trash summary');
    }
  };

  const fetchDeletedItems = async (itemType) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/trash/${itemType}`);
      setDeletedItems(response.data);
    } catch (error) {
      console.error(`Error fetching deleted ${itemType}:`, error);
      setError(`Failed to load deleted ${itemType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (itemId) => {
    setActionLoading(true);
    setError(null);
    
    try {
      await api.post(`/trash/restore/${activeTab.slice(0, -1)}/${itemId}`);
      
      setSuccessMessage('Item restored successfully!');
      setShowRestoreModal(false);
      
      // Refresh data
      await Promise.all([
        fetchTrashSummary(),
        fetchDeletedItems(activeTab)
      ]);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error restoring item:', error);
      setError('Failed to restore item');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async (itemId) => {
    setActionLoading(true);
    setError(null);
    
    try {
      await api.delete(`/trash/permanent/${activeTab.slice(0, -1)}/${itemId}`);
      
      setSuccessMessage('Item permanently deleted!');
      setShowDeleteModal(false);
      
      // Refresh data
      await Promise.all([
        fetchTrashSummary(),
        fetchDeletedItems(activeTab)
      ]);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        setError(error.response.data.message || 'Cannot permanently delete this item due to existing dependencies');
      } else if (error.response?.status === 404) {
        setError('Item not found');
      } else if (error.response?.status === 403) {
        setError('Item is not deleted and cannot be permanently removed');
      } else {
        setError('Failed to permanently delete item');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const openRestoreModal = (item) => {
    setSelectedItem(item);
    setShowRestoreModal(true);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (deletedItems.length === 0) {
      return (
        <div className="text-center py-4">
          <FaInfoCircle className="text-muted mb-3" size={48} />
          <p className="text-muted">No deleted {activeTab} found</p>
        </div>
      );
    }

    // Show tip for departments section
    if (activeTab === 'departments') {
      const columns = {
        departments: [
          { key: 'Department_Name', label: 'Name' },
          { key: 'Department_Description', label: 'Description' },
          { key: 'admin', label: 'Created By' },
          { key: 'deletedAt', label: 'Deleted Date' }
        ]
      };
      const currentColumns = columns[activeTab];
      
      return (
        <div>
          <Alert variant="info" className="mb-3">
            <FaInfoCircle className="me-2" />
            <strong>Important:</strong> Before permanently deleting a department, make sure to delete all associated courses first. 
            Departments cannot be deleted if they still have courses assigned to them.
          </Alert>
          {renderTableContent(currentColumns)}
        </div>
      );
    }

    // Show tip for courses section
    if (activeTab === 'courses') {
      const columns = {
        courses: [
          { key: 'Course_Name', label: 'Name' },
          { key: 'Course_Code', label: 'Code' },
          { key: 'Course_Description', label: 'Description' },
          { key: 'department', label: 'Department' },
          { key: 'deletedAt', label: 'Deleted Date' }
        ]
      };
      const currentColumns = columns[activeTab];
      
      return (
        <div>
          <Alert variant="info" className="mb-3">
            <FaInfoCircle className="me-2" />
            <strong>Important:</strong> Before permanently deleting a course, make sure to delete all associated candidates and voters first. 
            Courses cannot be deleted if they still have candidates or voters assigned to them.
          </Alert>
          {renderTableContent(currentColumns)}
        </div>
      );
    }

    // Show tip for candidates section
    if (activeTab === 'candidates') {
      const columns = {
        candidates: [
          { key: 'Candidate_Name', label: 'Name' },
          { key: 'Candidate_StudentId', label: 'Student ID' },
          { key: 'Candidate_Email', label: 'Email' },
          { key: 'position', label: 'Position' },
          { key: 'department', label: 'Department' },
          { key: 'course', label: 'Course' },
          { key: 'deletedAt', label: 'Deleted Date' }
        ]
      };
      const currentColumns = columns[activeTab];
      
      return (
        <div>
          <Alert variant="info" className="mb-3">
            <FaInfoCircle className="me-2" />
            <strong>Important:</strong> Before permanently deleting a candidate, make sure they are not currently running in any active ballots. 
            Candidates with active ballot participation or votes cannot be deleted.
          </Alert>
          {renderTableContent(currentColumns)}
        </div>
      );
    }

    // Show tip for ballots section
    if (activeTab === 'ballots') {
      const columns = {
        ballots: [
          { key: 'Ballot_Title', label: 'Title' },
          { key: 'Ballot_Description', label: 'Description' },
          { key: 'Ballot_Status', label: 'Status' },
          { key: 'Ballot_StartDate', label: 'Start Date' },
          { key: 'Ballot_EndDate', label: 'End Date' },
          { key: 'admin', label: 'Created By' },
          { key: 'deletedAt', label: 'Deleted Date' }
        ]
      };
      const currentColumns = columns[activeTab];
      
      return (
        <div>
          <Alert variant="warning" className="mb-3">
            <FaInfoCircle className="me-2" />
            <strong>Important:</strong> Ballots with voting history cannot be permanently deleted for audit purposes. 
            Only ballots that have never received votes can be permanently removed from the system.
          </Alert>
          {renderTableContent(currentColumns)}
        </div>
      );
    }

    const columns = {
      candidates: [
        { key: 'Candidate_Name', label: 'Name' },
        { key: 'Candidate_StudentId', label: 'Student ID' },
        { key: 'Candidate_Email', label: 'Email' },
        { key: 'position', label: 'Position' },
        { key: 'department', label: 'Department' },
        { key: 'course', label: 'Course' },
        { key: 'deletedAt', label: 'Deleted Date' }
      ],
      positions: [
        { key: 'Position_Title', label: 'Title' },
        { key: 'Position_Description', label: 'Description' },
        { key: 'voteLimit', label: 'Vote Limit' },
        { key: 'deletedAt', label: 'Deleted Date' }
      ],
      departments: [
        { key: 'Department_Name', label: 'Name' },
        { key: 'Department_Description', label: 'Description' },
        { key: 'admin', label: 'Created By' },
        { key: 'deletedAt', label: 'Deleted Date' }
      ],
      courses: [
        { key: 'Course_Name', label: 'Name' },
        { key: 'Course_Code', label: 'Code' },
        { key: 'Course_Description', label: 'Description' },
        { key: 'department', label: 'Department' },
        { key: 'deletedAt', label: 'Deleted Date' }
      ],
      voters: [
        { key: 'Voter_Name', label: 'Name' },
        { key: 'Voter_StudentId', label: 'Student ID' },
        { key: 'Voter_Email', label: 'Email' },
        { key: 'department', label: 'Department' },
        { key: 'course', label: 'Course' },
        { key: 'deletedAt', label: 'Deleted Date' }
      ],
      ballots: [
        { key: 'Ballot_Title', label: 'Title' },
        { key: 'Ballot_Description', label: 'Description' },
        { key: 'Ballot_Status', label: 'Status' },
        { key: 'Ballot_StartDate', label: 'Start Date' },
        { key: 'Ballot_EndDate', label: 'End Date' },
        { key: 'admin', label: 'Created By' },
        { key: 'deletedAt', label: 'Deleted Date' }
      ],
      elections: [
        { key: 'Election_Title', label: 'Title' },
        { key: 'Election_Description', label: 'Description' },
        { key: 'status', label: 'Status' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
        { key: 'admin', label: 'Created By' },
        { key: 'deletedAt', label: 'Deleted Date' }
      ]
    };

    const currentColumns = columns[activeTab];

    return renderTableContent(currentColumns);
  };

  const renderTableContent = (currentColumns) => {
    return (
      <Table responsive striped hover>
        <thead>
          <tr>
            {currentColumns.map(column => (
              <th key={column.key}>{column.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {deletedItems.map(item => (
            <tr key={item.id}>
              {currentColumns.map(column => {
                let value = item[column.key];
                
                // Handle nested objects
                if (column.key === 'position' && item.position) {
                                       value = item.position.Position_Title;
                } else if (column.key === 'department' && item.department) {
                                       value = item.department.Department_Name;
                } else if (column.key === 'course' && item.course) {
                                       value = item.course.Course_Name;
                } else if (column.key === 'admin' && item.admin) {
                                       value = item.admin.Admin_Username;
                } else if (column.key === 'deletedAt') {
                  value = new Date(item.deletedAt).toLocaleDateString();
                } else if (column.key === 'startDate' || column.key === 'endDate') {
                  value = new Date(item[column.key]).toLocaleDateString();
                } else if (column.key === 'Ballot_StartDate' || column.key === 'Ballot_EndDate') {
                  value = new Date(item[column.key]).toLocaleDateString();
                }
                
                return <td key={column.key}>{value || 'N/A'}</td>;
              })}
              <td>
                <div className="d-flex gap-2">
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="restore-tooltip">Restore Item</Tooltip>}
                  >
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => openRestoreModal(item)}
                      disabled={actionLoading}
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <FaUndo />
                    </Button>
                  </OverlayTrigger>
                  
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="delete-tooltip">Permanently Delete</Tooltip>}
                  >
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => openDeleteModal(item)}
                      disabled={actionLoading}
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <FaTrash />
                    </Button>
                  </OverlayTrigger>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <div className="trash-bin-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
                         {/* Unified Professional Header */}
             <div className="dashboard-header-pro">
               <div className="dashboard-header-row">
                 <div>
                                       <h1 className="dashboard-title-pro">
                      Trash Bin
                    </h1>
                   <p className="dashboard-subtitle-pro">Manage and restore deleted items or permanently remove them from the system.</p>
                 </div>
                 <div className="dashboard-header-actions">
                   <Badge bg="secondary" className="fs-6">
                     Total: {trashSummary?.total || 0} items
                   </Badge>
                 </div>
               </div>
             </div>

            {/* Summary Cards */}
            <div className="row mb-4">
              {tabs.map(tab => (
                <div key={tab.key} className="col-md-3 col-sm-6 mb-3">
                  <Card className="summary-card h-100">
                    <Card.Body className="text-center">
                      <div className="summary-icon mb-2">{tab.icon}</div>
                      <h5 className="card-title">{tab.label}</h5>
                      <h3 className="text-primary mb-0">
                        {trashSummary?.[tab.key] || 0}
                      </h3>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                <FaExclamationTriangle className="me-2" />
                {error}
              </Alert>
            )}

            {/* Success Alert */}
            {successMessage && (
              <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}

            {/* Tabs */}
            <Card>
              <Card.Header>
                <ul className="nav nav-tabs card-header-tabs">
                  {tabs.map(tab => (
                    <li key={tab.key} className="nav-item">
                      <button
                        className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </Card.Header>
              <Card.Body>
                {renderTable()}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      <Modal show={showRestoreModal} onHide={() => setShowRestoreModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Restore</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to restore this {activeTab.slice(0, -1)}?
          <br />
          <strong>
            {activeTab === 'candidates' ? selectedItem?.Candidate_Name :
             activeTab === 'positions' ? selectedItem?.Position_Title :
             activeTab === 'departments' ? selectedItem?.Department_Name :
             activeTab === 'courses' ? selectedItem?.Course_Name :
             activeTab === 'voters' ? selectedItem?.Voter_Name :
             activeTab === 'ballots' ? selectedItem?.Ballot_Title :
             activeTab === 'elections' ? selectedItem?.Election_Title : 'Unknown Item'}
          </strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRestoreModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => handleRestore(selectedItem?.id)}
            disabled={actionLoading}
          >
            {actionLoading ? <Spinner size="sm" /> : 'Restore'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Permanent Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <FaExclamationTriangle className="me-2" />
            Confirm Permanent Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            <strong>Warning:</strong> This action cannot be undone!
          </div>
          Are you sure you want to permanently delete this {activeTab.slice(0, -1)}?
          <br />
          <strong>
            {activeTab === 'candidates' ? selectedItem?.Candidate_Name :
             activeTab === 'positions' ? selectedItem?.Position_Title :
             activeTab === 'departments' ? selectedItem?.Department_Name :
             activeTab === 'courses' ? selectedItem?.Course_Name :
             activeTab === 'voters' ? selectedItem?.Voter_Name :
             activeTab === 'ballots' ? selectedItem?.Ballot_Title :
             activeTab === 'elections' ? selectedItem?.Election_Title : 'Unknown Item'}
          </strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handlePermanentDelete(selectedItem?.id)}
            disabled={actionLoading}
          >
                         {actionLoading ? <Spinner size="sm" /> : 'Permanently Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TrashBin;
