import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVoters, createVoter, updateVoter, deleteVoter, getDepartments, getCoursesByDepartment, getVoterPassword, resetVoterPassword } from '../services/api';
import io from 'socket.io-client';

const Voters = () => {
  const navigate = useNavigate();
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVoter, setEditingVoter] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showActualPassword, setShowActualPassword] = useState(false);
  const [actualPassword, setActualPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [socket, setSocket] = useState(null);
  const [formData, setFormData] = useState({
    Voter_Name: '',
    Voter_Email: '',
    Voter_StudentId: '',
    password: '',
    departmentId: '',
    courseId: ''
  });

  useEffect(() => {
    fetchVoters();
    fetchDepartments();
  }, []);

  // WebSocket connection and event listeners
  useEffect(() => {
    console.log('Setting up WebSocket connection...');
    
    // Use default namespace (no custom namespace)
    const newSocket = io('http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });
    
    console.log('🔌 Attempting connection with default namespace...');

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket server with ID:', newSocket.id);
      console.log('🔌 WebSocket connection established successfully');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      console.error('Connection details:', {
        url: 'http://localhost:3001',
        namespace: '/voting',
        error: error.message
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from WebSocket server. Reason:', reason);
    });

    // Listen for voter registration events
    newSocket.on('voter-registered', (data) => {
      console.log('🎉 New voter registered event received:', data);
      console.log('🔄 Refreshing voters list...');
      // Refresh the voters list to show the new voter
      fetchVoters();
      setSuccess('New voter registered! List updated automatically.');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    });

    // Listen for voter updates
    newSocket.on('voter-updated', (data) => {
      console.log('📝 Voter updated event received:', data);
      console.log('🔄 Refreshing voters list...');
      fetchVoters();
      setSuccess('Voter updated! List refreshed automatically.');
      setTimeout(() => setSuccess(''), 3000);
    });

    // Listen for voter deletions
    newSocket.on('voter-deleted', (data) => {
      console.log('🗑️ Voter deleted event received:', data);
      console.log('🔄 Refreshing voters list...');
      fetchVoters();
      setSuccess('Voter deleted! List refreshed automatically.');
      setTimeout(() => setSuccess(''), 3000);
    });

    // Listen for general admin actions
    newSocket.on('admin-action', (data) => {
      console.log('⚙️ Admin action event received:', data);
      if (data.action === 'voter-management') {
        console.log('🔄 Refreshing voters list due to admin action...');
        fetchVoters();
        setSuccess('Voter list updated due to admin action.');
        setTimeout(() => setSuccess(''), 3000);
      }
    });

    // Test event to verify connection
    newSocket.on('connected', (data) => {
      console.log('🎯 Server connection confirmation received:', data);
    });

    // Test event listener
    newSocket.on('test-event', (data) => {
      console.log('🧪 Test event received:', data);
      setSuccess('Test WebSocket event received! Connection is working.');
      setTimeout(() => setSuccess(''), 3000);
    });

    // Test response listener
    newSocket.on('test-response', (data) => {
      console.log('🧪 Test response received:', data);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket connection...');
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    filterAndSortVoters();
  }, [voters, searchTerm, sortConfig]);

  const filterAndSortVoters = () => {
    let filtered = voters;

    // Apply search filter
    if (searchTerm) {
      filtered = voters.filter(voter =>
        voter.Voter_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.Voter_Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.Voter_StudentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (voter.departmentName && voter.departmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (voter.courseName && voter.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested properties
        if (sortConfig.key === 'departmentName') {
          aValue = a.departmentName || '';
          bValue = b.departmentName || '';
        } else if (sortConfig.key === 'courseName') {
          aValue = a.courseName || '';
          bValue = b.courseName || '';
        }

        // Handle boolean values
        if (sortConfig.key === 'hasVoted') {
          aValue = a.hasVoted ? 1 : 0;
          bValue = b.hasVoted ? 1 : 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredVoters(filtered);
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

  const fetchDepartments = async () => {
    try {
      const depts = await getDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCourses = async (departmentId) => {
    setLoadingCourses(true);
    try {
      const departmentCourses = await getCoursesByDepartment(departmentId);
      setCourses(departmentCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const data = await getVoters();
      
      // Transform the data to flatten nested department and course objects
      const transformedData = data.map(voter => ({
        ...voter,
        name: voter.Voter_Name,
        email: voter.Voter_Email,
        studentId: voter.Voter_StudentId,
        departmentName: voter.department?.Department_Name || null,
        courseName: voter.course?.Course_Name || null,
        courseId: voter.course?.id || null
      }));
      
      setVoters(transformedData);
      setError('');
    } catch (error) {
      console.error('Error fetching voters:', error);
      setError('Failed to load voters');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (voter = null) => {
    if (voter) {
      setEditingVoter(voter);
      setFormData({
        Voter_Name: voter.Voter_Name,
        Voter_Email: voter.Voter_Email,
        Voter_StudentId: voter.Voter_StudentId,
        departmentId: voter.departmentId || voter.department?.id || '',
        courseId: voter.courseId || voter.course?.id || ''
      });
      // Load courses for the voter's department
      if (voter.departmentId || voter.department?.id) {
        fetchCourses(voter.departmentId || voter.department.id);
      }
    } else {
      setEditingVoter(null);
      setFormData({
        name: '',
        email: '',
        studentId: '',
        password: '',
        departmentId: '',
        courseId: ''
      });
      setShowPassword(false);
      setShowActualPassword(false);
      setActualPassword('');
      setCourses([]);
    }
    setShowModal(true);
    setSuccess('');
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVoter(null);
    setFormData({
      name: '',
      email: '',
      studentId: '',
      password: '',
      departmentId: '',
      courseId: ''
    });
    setShowPassword(false);
    setShowActualPassword(false);
    setActualPassword('');
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If department changes, reset course and fetch new courses
    if (name === 'departmentId') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        courseId: '' // Reset course when department changes
      }));
      
      if (value) {
        fetchCourses(value);
      } else {
        setCourses([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!formData.departmentId) {
      setError('Please select a department');
      return;
    }
    
    if (!formData.courseId) {
      setError('Please select a course');
      return;
    }
    
    // Student ID format validation for both new and edited voters
    const idPattern = /^\d{4}-\d{5}$/;
          if (!idPattern.test(formData.Voter_StudentId)) {
      setError('Student ID must be in the format YYYY-NNNNN (e.g., 2024-00001)');
      return;
    }
    
    try {
      // Prepare data to send - only include fields that the backend DTO expects
      const dataToSend = {
        Voter_Name: formData.Voter_Name,
        Voter_Email: formData.Voter_Email,
        Voter_StudentId: formData.Voter_StudentId,
        password: formData.password || formData.Voter_StudentId, // Use provided password or Student ID as default
        departmentId: formData.departmentId || undefined,
        courseId: formData.courseId || undefined
      };
      
      if (editingVoter) {
        await updateVoter(editingVoter.id, dataToSend);
        setSuccess('Voter updated successfully!');
      } else {
        const response = await createVoter(dataToSend);
        if (response.defaultPassword) {
          setSuccess(`Voter created successfully! Default password is: ${response.defaultPassword}`);
        } else {
          setSuccess('Voter created successfully!');
        }
      }
      fetchVoters();
      // Don't close modal immediately to show the success message
      setTimeout(() => {
        handleCloseModal();
      }, 3000);
    } catch (error) {
      console.error('Error saving voter:', error);
      setError('Failed to save voter');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this voter?')) {
      try {
        await deleteVoter(id);
        
        // Show success message about trash bin
        setSuccessMessage('Voter has been moved to the trash bin. You can restore it later or permanently delete it from the Trash Bin page.');
        
        fetchVoters();
        setSuccess('Voter deleted successfully!');
        
        // Clear success message after 8 seconds
        setTimeout(() => setSuccessMessage(''), 8000);
      } catch (error) {
        console.error('Error deleting voter:', error);
        setError('Failed to delete voter');
      }
    }
  };

  const handleEdit = (voter) => {
    setEditingVoter(voter);
    setFormData({
      Voter_Name: voter.Voter_Name,
      Voter_Email: voter.Voter_Email,
      Voter_StudentId: voter.Voter_StudentId,
      password: '••••••••', // Show asterisks by default
      departmentId: voter.departmentId || '',
      courseId: voter.courseId || ''
    });
    setShowPassword(false);
    setShowActualPassword(false);
    setActualPassword(''); // Reset actual password
    setShowModal(true);
  };

  const handleViewHistory = (voterId) => {
    navigate(`/admin/voter-history/${voterId}`);
  };

  // Function to fetch voter's actual password
  const fetchVoterPassword = async (voterId) => {
    try {
      const data = await getVoterPassword(voterId);
      // Set the actual password based on backend response
      setActualPassword(data.currentPassword);
    } catch (error) {
      console.error('Error fetching password:', error);
      // Fallback: use student ID as password
      setActualPassword(editingVoter.Voter_StudentId);
    }
  };

  // Function to reset password to student ID
  const resetPasswordToStudentId = async () => {
    try {
      const data = await resetVoterPassword(editingVoter.id);
      setFormData(prev => ({
        ...prev,
        password: data.newPassword
      }));
      setActualPassword(data.newPassword);
      setShowPassword(true);
      setShowActualPassword(true);
      setSuccess('Password reset to Student ID successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to reset password');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="voters-container">
      {/* Unified Professional Header */}
      <div className="dashboard-header-pro">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title-pro">Manage Voters</h1>
            <p className="dashboard-subtitle-pro">Register and manage voter accounts with academic departments and courses.</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="btn btn-custom-blue" onClick={() => handleShowModal()}>
              Add Voter
            </button>
            <button 
              className="btn btn-outline-info ms-2" 
              onClick={() => {
                console.log('🧪 Test button clicked');
                console.log('🔌 Socket state:', {
                  exists: !!socket,
                  connected: socket?.connected,
                  id: socket?.id,
                  readyState: socket?.readyState
                });
                
                if (socket && socket.connected) {
                  console.log('🧪 Sending test WebSocket request...');
                  socket.emit('test-websocket');
                  
                  // Also test direct event emission
                  setTimeout(() => {
                    console.log('🧪 Testing direct event emission...');
                    socket.emit('test-websocket');
                  }, 1000);
                } else {
                  console.error('❌ WebSocket not connected');
                  console.error('Socket details:', socket);
                  setError('WebSocket not connected');
                }
              }}
              title="Test WebSocket Connection"
            >
              <i className="fas fa-wifi me-1"></i>
              Test WebSocket
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      {/* Success Message for Trash Bin */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
          <i className="fas fa-trash-alt me-2"></i>
          {successMessage}
          <div className="mt-2">
            <a href="/trash-bin?tab=voters" className="btn btn-sm btn-outline-success me-2">
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
                  placeholder="Search voters by name, email, student ID, department, or course..."
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
                Showing {filteredVoters.length} of {voters.length} voters
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
                  <th>#</th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('name')}
                    className="sortable-header"
                  >
                    Name {getSortIcon('name')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('email')}
                    className="sortable-header"
                  >
                    Email {getSortIcon('email')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('studentId')}
                    className="sortable-header"
                  >
                    Student ID {getSortIcon('studentId')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('departmentName')}
                    className="sortable-header"
                  >
                    Department {getSortIcon('departmentName')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('courseName')}
                    className="sortable-header"
                  >
                    Course {getSortIcon('courseName')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('hasVoted')}
                    className="sortable-header"
                  >
                    Voting Status {getSortIcon('hasVoted')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVoters.length > 0 ? (
                  filteredVoters.map((voter, index) => (
                    <tr key={voter.id}>
                      <td>{index + 1}</td>
                      <td>{voter.name}</td>
                      <td>{voter.email}</td>
                      <td>{voter.studentId}</td>
                      <td>
                        {voter.departmentName ? (
                          <span className="badge bg-primary">
                            {voter.departmentName}
                          </span>
                        ) : (
                          <span className="text-muted">No department</span>
                        )}
                      </td>
                      <td>
                        {voter.courseName ? (
                          <span className="badge bg-info">
                            <strong>{voter.courseId}</strong> - {voter.courseName}
                          </span>
                        ) : (
                          <span className="text-muted">No course</span>
                        )}
                      </td>
                      <td>
                        {voter.hasVoted ? (
                          <span className="badge bg-success">Voted</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Not Voted</span>
                        )}
                      </td>
                      <td>
                        <div className="voter-actions">
                          <button 
                            className="btn btn-sm btn-outline-info me-2 action-btn-icon"
                            onClick={() => handleViewHistory(voter.id)}
                            title="View Voter History"
                          >
                            <i className="fas fa-history"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-primary me-2 action-btn-icon"
                            onClick={() => handleShowModal(voter)}
                            title="Edit Voter"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger action-btn-icon"
                            onClick={() => handleDelete(voter.id)}
                            title="Delete Voter"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">No voters found</td>
                  </tr>
                )}
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
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingVoter ? 'Edit Voter' : 'Add Voter'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {!editingVoter && (
                    <div className="alert alert-info mb-3">
                      <strong>Note:</strong> Voters created without a password will have their Student ID as the default password.
                    </div>
                  )}
                  {success && <div className="alert alert-success">{success}</div>}
                  {error && <div className="alert alert-danger">{error}</div>}
                  
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Voter_Name"
                      value={formData.Voter_Name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="Voter_Email"
                      value={formData.Voter_Email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Student ID</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Voter_StudentId"
                      value={formData.Voter_StudentId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  {!editingVoter && (
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Leave blank to use Student ID as default password"
                        />
                        <span className="input-group-text">
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowPassword(!showPassword)}></i>
                        </span>
                      </div>
                      <small className="form-text text-muted">
                        If left blank, the Student ID will be used as the default password
                      </small>
                    </div>
                  )}

                  {/* Password Management Section for Editing */}
                  {editingVoter && (
                    <div className="mb-3">
                      <label className="form-label">Password Management</label>
                      <div className="d-flex gap-2 mb-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-info"
                          onClick={() => {
                            if (!actualPassword) {
                              fetchVoterPassword(editingVoter.id);
                            }
                            setShowActualPassword(!showActualPassword);
                          }}
                        >
                          <i className={`fas ${showActualPassword ? 'fa-eye-slash' : 'fa-eye'} me-1`}></i>
                          {showActualPassword ? 'Hide' : 'Reveal'} Actual Password
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-warning"
                          onClick={resetPasswordToStudentId}
                        >
                          <i className="fas fa-key me-1"></i>
                          Reset to Student ID
                        </button>
                      </div>
                      
                      {showActualPassword && actualPassword && (
                        <div className="alert alert-info">
                          <strong>Current Password:</strong> {actualPassword}
                        </div>
                      )}
                      
                      <small className="form-text text-muted">
                        Use these tools to manage the voter's password. The actual password is hidden by default for security.
                      </small>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-university me-2"></i>
                      Department <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a department</option>
                                             {departments.map(department => (
                         <option key={department.id} value={department.id}>
                           {department.Department_Name} ({department.id})
                         </option>
                       ))}
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-graduation-cap me-2"></i>
                      Course <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleChange}
                      disabled={!formData.departmentId || loadingCourses}
                      required
                    >
                      <option value="">
                        {!formData.departmentId 
                          ? 'Select department first' 
                          : loadingCourses 
                            ? 'Loading courses...' 
                            : 'Select a course'
                        }
                      </option>
                                             {courses.map(course => (
                         <option key={course.id} value={course.id}>
                           {course.Course_Name}
                         </option>
                       ))}
                    </select>
                  </div>
                  
                  {/* hasVoted field removed - managed by backend */}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-custom-blue">
                    {editingVoter ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voters; 