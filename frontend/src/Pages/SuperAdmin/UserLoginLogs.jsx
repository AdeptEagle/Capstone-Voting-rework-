import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserLoginLogs, getUserLoginStats, getVoters } from '../../services/api';
import { checkCurrentUser, isSuperAdmin } from '../../services/auth';
import './UserLoginLogs.css';

const UserLoginLogs = () => {
  const [loginLogs, setLoginLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showDetails, setShowDetails] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
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
  }, []);

  // Client-side filtering - instant search like Positions page
  useEffect(() => {
    filterAndSortLogs();
  }, [loginLogs, searchTerm, selectedDepartment, selectedCourse]);

  // Timer for live duration updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch ALL data without pagination for client-side filtering
      const [logsResponse, statsResponse, votersResponse] = await Promise.all([
        getUserLoginLogs(1, 1000), // Get all logs (1000 should be enough)
        getUserLoginStats(),
        getVoters()
      ]);

      setLoginLogs(logsResponse.loginLogs);
      setStats(statsResponse);
      setVoters(votersResponse);
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load user login logs');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering function (like Positions page)
  const filterAndSortLogs = () => {
    let filtered = loginLogs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user?.Voter_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.Voter_StudentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.Voter_Email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply department filter
    if (selectedDepartment) {
      filtered = filtered.filter(log =>
        log.user?.department?.Department_Name === selectedDepartment
      );
    }

    // Apply course filter
    if (selectedCourse) {
      filtered = filtered.filter(log =>
        log.user?.course?.Course_Name === selectedCourse
      );
    }

    // Calculate pagination
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);
    setTotalPages(totalPages);

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLogs = filtered.slice(startIndex, endIndex);

    setFilteredLogs(paginatedLogs);
  };

  const formatDuration = (seconds, isActive, loginTime) => {
    if (!seconds && isActive && loginTime) {
      // Calculate live duration for active sessions using currentTime state
      const login = new Date(loginTime);
      const liveDuration = Math.floor((currentTime - login) / 1000);
      
      const hours = Math.floor(liveDuration / 3600);
      const minutes = Math.floor((liveDuration % 3600) / 60);
      const secs = liveDuration % 60;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s (live)`;
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s (live)`;
      } else {
        return `${secs}s (live)`;
      }
    }
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

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDepartmentFilter = (departmentId) => {
    setSelectedDepartment(departmentId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCourseFilter = (courseId) => {
    setSelectedCourse(courseId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedCourse('');
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
    <div className="user-login-logs-container">
      {/* Header */}
      <div className="dashboard-header-pro">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title-pro">User Login Logs</h1>
            <p className="dashboard-subtitle-pro">Monitor user login activity and session durations.</p>
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

      {/* Search and Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4">
              <label className="form-label">Search by User:</label>
              <div className="position-relative">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search by name, student ID, or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Filter by Department:</label>
              <select 
                className="form-select" 
                value={selectedDepartment} 
                onChange={(e) => handleDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {Array.from(new Set(voters.map(voter => voter.department?.Department_Name).filter(Boolean))).map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Filter by Course:</label>
              <select 
                className="form-select" 
                value={selectedCourse} 
                onChange={(e) => handleCourseFilter(e.target.value)}
              >
                <option value="">All Courses</option>
                {Array.from(new Set(voters.map(voter => voter.course?.Course_Name).filter(Boolean))).map(course => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-12 mt-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleClearFilters}
                  >
                    <i className="fas fa-times me-1"></i>
                    Clear All Filters
                  </button>
                </div>
                <div>
                  <span className="text-muted">
                    Showing {filteredLogs.length} of {loginLogs.length} logs
                  </span>
                </div>
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
            User Login Logs
          </h5>
        </div>
        <div className="card-body">
          {loginLogs.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <p className="text-muted">No user login logs found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-header-custom">
                  <tr>
                    <th>User</th>
                    <th>Department</th>
                    <th>Login Time</th>
                    <th>Logout Time</th>
                    <th>Duration</th>
                    <th>IP Address</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div>
                          <strong>{log.user.Voter_Name}</strong>
                          <br />
                          <small className="text-muted">{log.user.Voter_StudentId}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          {log.user.department?.Department_Name || 'N/A'}
                          <br />
                          <small className="text-muted">{log.user.course?.Course_Name || 'N/A'}</small>
                        </div>
                      </td>
                      <td>{formatDate(log.loginTime)}</td>
                      <td>{log.logoutTime ? formatDate(log.logoutTime) : <span className="text-success">Active</span>}</td>
                      <td>{formatDuration(log.duration, log.isActive, log.loginTime)}</td>
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
                <h5 className="modal-title">User Login Log Details</h5>
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
                        <h6>User Information</h6>
                        <p><strong>Name:</strong> {log.user.Voter_Name}</p>
                        <p><strong>Student ID:</strong> {log.user.Voter_StudentId}</p>
                        <p><strong>Email:</strong> {log.user.Voter_Email || 'N/A'}</p>
                        <p><strong>Department:</strong> {log.user.department?.Department_Name || 'N/A'}</p>
                        <p><strong>Course:</strong> {log.user.course?.Course_Name || 'N/A'}</p>
                      </div>
                      <div className="col-md-6">
                        <h6>Session Information</h6>
                        <p><strong>Login Time:</strong> {formatDate(log.loginTime)}</p>
                        <p><strong>Logout Time:</strong> {log.logoutTime ? formatDate(log.logoutTime) : <span className="text-success">Still Active</span>}</p>
                        <p><strong>Duration:</strong> {formatDuration(log.duration, log.isActive, log.loginTime)}</p>
                        <p><strong>Status:</strong> {getStatusBadge(log.isActive, log.logoutTime)}</p>
                      </div>
                      <div className="col-12 mt-3">
                        <h6>Network Information</h6>
                        <p><strong>IP Address:</strong> <code>{log.ipAddress || 'N/A'}</code></p>
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

export default UserLoginLogs;
