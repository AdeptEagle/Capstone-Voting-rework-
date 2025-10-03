import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminLoginLogs, getAdminLoginStats, getAdmins } from '../../services/api';
import { checkCurrentUser, isSuperAdmin } from '../../services/auth';
import './AdminLoginLogs.css';

const AdminLoginLogs = () => {
  const [loginLogs, setLoginLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [showDetails, setShowDetails] = useState(null);
  const navigate = useNavigate();

  const itemsPerPage = 20;

  useEffect(() => {
    // Check if user is superadmin
    const currentUser = checkCurrentUser();
    if (!currentUser.isAuthenticated) {
      setAuthError('Please log in to access this page');
      setLoading(false);
      return;
    }
    
    if (!isSuperAdmin()) {
      setAuthError('Access denied. Superadmin privileges required.');
      setLoading(false);
      return;
    }
    
    fetchData();
  }, [currentPage, selectedAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsResponse, statsResponse, adminsResponse] = await Promise.all([
        getAdminLoginLogs(currentPage, itemsPerPage, selectedAdmin || null),
        getAdminLoginStats(),
        getAdmins()
      ]);

      setLoginLogs(logsResponse.loginLogs);
      setTotalPages(logsResponse.pagination.totalPages);
      setStats(statsResponse);
      setAdmins(adminsResponse);
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load admin login logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (isActive, logoutTime) => {
    if (isActive) {
      return <span className="badge bg-success">Active</span>;
    } else if (logoutTime) {
      return <span className="badge bg-secondary">Completed</span>;
    } else {
      return <span className="badge bg-warning">Unknown</span>;
    }
  };

  const handleAdminFilter = (adminId) => {
    setSelectedAdmin(adminId);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (logId) => {
    setShowDetails(showDetails === logId ? null : logId);
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

  if (authError) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <div className="alert alert-danger">
            <h4>Access Denied</h4>
            <p>{authError}</p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-logs-container">
      {/* Header */}
      <div className="dashboard-header-pro">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title-pro">Admin Login Logs</h1>
            <p className="dashboard-subtitle-pro">Monitor admin login activity and session durations.</p>
          </div>
          <div className="dashboard-header-actions">
            <button 
              className="btn btn-outline-secondary" 
              onClick={fetchData}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-1"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="stat-card">
            <div className="stat-icon blue">
              <i className="fas fa-sign-in-alt"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalLogins || 0}</h3>
              <p>Total Logins</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stat-card">
            <div className="stat-icon green">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.activeSessions || 0}</h3>
              <p>Active Sessions</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stat-card">
            <div className="stat-icon yellow">
              <i className="fas fa-calendar-day"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.todayLogins || 0}</h3>
              <p>Today's Logins</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stat-card">
            <div className="stat-icon purple">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.avgSessionDuration || 0}m</h3>
              <p>Avg Session</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label className="form-label">Filter by Admin:</label>
              <select 
                className="form-select" 
                value={selectedAdmin} 
                onChange={(e) => handleAdminFilter(e.target.value)}
              >
                <option value="">All Admins</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.Admin_Username} ({admin.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-end align-items-end h-100">
                <span className="text-muted">
                  Showing {loginLogs.length} of {stats.totalLogins || 0} logs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Logs Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>
            Login Logs
          </h5>
        </div>
        <div className="card-body">
          {loginLogs.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <p className="text-muted">No login logs found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-header-custom">
                  <tr>
                    <th>Admin</th>
                    <th>Login Time</th>
                    <th>Logout Time</th>
                    <th>Duration</th>
                    <th>IP Address</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loginLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div>
                          <strong>{log.admin.Admin_Username}</strong>
                          <br />
                          <small className="text-muted">{log.admin.role}</small>
                        </div>
                      </td>
                      <td>{formatDate(log.loginTime)}</td>
                      <td>{log.logoutTime ? formatDate(log.logoutTime) : 'N/A'}</td>
                      <td>{formatDuration(log.duration)}</td>
                      <td>
                        <code>{log.ipAddress || 'N/A'}</code>
                      </td>
                      <td>{getStatusBadge(log.isActive, log.logoutTime)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => handleViewDetails(log.id)}
                        >
                          <i className="fas fa-eye"></i>
                          {showDetails === log.id ? 'Hide' : 'View'} Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    );
                  })}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Login Log Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetails(null)}
                ></button>
              </div>
              <div className="modal-body">
                {(() => {
                  const log = loginLogs.find(l => l.id === showDetails);
                  if (!log) return null;
                  
                  return (
                    <div className="row">
                      <div className="col-md-6">
                        <h6>Admin Information</h6>
                        <p><strong>Username:</strong> {log.admin.Admin_Username}</p>
                        <p><strong>Email:</strong> {log.admin.Admin_Email || 'N/A'}</p>
                        <p><strong>Role:</strong> <span className="badge bg-primary">{log.admin.role}</span></p>
                      </div>
                      <div className="col-md-6">
                        <h6>Session Information</h6>
                        <p><strong>Login Time:</strong> {formatDate(log.loginTime)}</p>
                        <p><strong>Logout Time:</strong> {log.logoutTime ? formatDate(log.logoutTime) : 'Still Active'}</p>
                        <p><strong>Duration:</strong> {formatDuration(log.duration)}</p>
                        <p><strong>Status:</strong> {getStatusBadge(log.isActive, log.logoutTime)}</p>
                      </div>
                      <div className="col-12 mt-3">
                        <h6>Technical Details</h6>
                        <p><strong>IP Address:</strong> <code>{log.ipAddress || 'N/A'}</code></p>
                        <p><strong>Session ID:</strong> <code>{log.sessionId || 'N/A'}</code></p>
                        <p><strong>User Agent:</strong></p>
                        <pre className="bg-light p-2 rounded">{log.userAgent || 'N/A'}</pre>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetails(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoginLogs;
