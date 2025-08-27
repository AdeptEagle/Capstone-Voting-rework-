import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getDepartments, getCoursesByDepartment } from '../../services/api';
import { storeRole, storeUserData, getStoredRole } from '../../services/auth';
import io from 'socket.io-client';
import './UserRegister.css';

const UserRegister = () => {
  const [formData, setFormData] = useState({
    Voter_Name: '',
    Voter_Email: '',
    Voter_StudentId: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
    courseId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // Fetch departments on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const depts = await getDepartments();
        setDepartments(depts);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load registration data. Please try again.');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchData();
  }, []);

  // WebSocket connection setup
  useEffect(() => {
    console.log('🔌 [UserRegister] Setting up WebSocket connection...');
    const newSocket = io('http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    newSocket.on('connect', () => {
      console.log('🔌 [UserRegister] WebSocket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 [UserRegister] WebSocket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ [UserRegister] WebSocket connection error:', error);
    });

    // Test event listeners
    newSocket.on('test-event', (data) => {
      console.log('🧪 [UserRegister] Test event received:', data);
    });

    newSocket.on('test-response', (data) => {
      console.log('🧪 [UserRegister] Test response received:', data);
    });

    // Election status update listeners
    newSocket.on('election-status-updated', (data) => {
      console.log('🗳️ [UserRegister] Election status updated:', data);
      // Show notification to user about status change
      const statusMessages = {
        'active': '🗳️ Voting is now OPEN! You can cast your vote.',
        'paused': '⏸️ Voting has been PAUSED temporarily.',
        'stopped': '⏹️ Voting has been STOPPED.',
        'ended': '✅ Voting has ENDED. Results are now available.',
        'draft': '📝 Election is in DRAFT mode.'
      };
      
      const message = statusMessages[data.status] || `Election status changed to: ${data.status}`;
      console.log('📢 Status Update:', message);
    });

    // Listen for new elections being created
    newSocket.on('election-created', (data) => {
      console.log('🆕 [UserRegister] New election created:', data);
    });

    // Listen for election updates
    newSocket.on('election-updated', (data) => {
      console.log('🔄 [UserRegister] Election updated:', data);
    });

    setSocket(newSocket);

    return () => {
      console.log('🧹 [UserRegister] Cleaning up WebSocket connection...');
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

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

  const fetchCourses = async (departmentId) => {
    setLoadingCourses(true);
    try {
      const departmentCourses = await getCoursesByDepartment(departmentId);
      setCourses(departmentCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses for selected department.');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Student ID format: YYYY-NNNNN
    const idPattern = /^\d{4}-\d{5}$/;
          if (!idPattern.test(formData.Voter_StudentId)) {
      setError('Student ID must be in the format YYYY-NNNNN (e.g., 2022-00222)');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!formData.departmentId) {
      setError('Please select your department');
      setLoading(false);
      return;
    }

    if (!formData.courseId) {
      setError('Please select your course');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/user/register', {
        Voter_Name: formData.Voter_Name,
        Voter_Email: formData.Voter_Email,
        Voter_StudentId: formData.Voter_StudentId,
        password: formData.password,
        departmentId: formData.departmentId,
        courseId: formData.courseId
      });

      console.log('Registration response:', response.data);
      setSuccess('Registration successful! Redirecting to dashboard...');
      
      // Store user data and role (token is in HTTP-only cookie)
      const { voter } = response.data;
      console.log('Registration successful, storing role as "user"');
      storeRole('user');
      storeUserData(voter, 'user');
      
      // Debug: Check if role was stored correctly
      const storedRole = getStoredRole();
      console.log('Stored role after registration:', storedRole);
      
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        navigate('/user/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      
      // Check if the error is actually a success (user created but response had issues)
      if (err.response?.status === 400 && err.response?.data?.error?.includes('successfully')) {
        setSuccess('Registration successful! Redirecting to dashboard...');
        storeRole('user');
        setTimeout(() => {
          navigate('/user/dashboard');
        }, 2000);
      } else {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-register-split-container">
      {/* Left Panel: System Introduction & Benefits */}
      <div className="user-register-left-panel">
        <div className="user-register-branding">
          <div className="user-register-logo">
            <i className="fas fa-user-plus"></i>
          </div>
          <h1 className="user-register-title">Join the System</h1>
          <p className="user-register-subtitle">Your Voice Matters • Secure • Transparent</p>
        </div>
        
        <div className="user-register-intro">
          <h3>Why Student ID?</h3>
          <p>We use your Student ID to ensure:</p>
          <ul>
            <li><strong>One Vote Per Student:</strong> Prevents duplicate registrations</li>
            <li><strong>Academic Verification:</strong> Confirms your enrollment status</li>
            <li><strong>Secure Access:</strong> Your ID serves as your unique username</li>
            <li><strong>Easy Login:</strong> No need to remember additional usernames</li>
          </ul>
        </div>

        <div className="user-register-benefits">
          <div className="user-register-benefit-item">
            <i className="fas fa-check-circle"></i>
            <div>
              <h4>Instant Access</h4>
              <p>Start voting immediately after registration</p>
            </div>
          </div>
          <div className="user-register-benefit-item">
            <i className="fas fa-shield-alt"></i>
            <div>
              <h4>Secure Voting</h4>
              <p>Your vote is encrypted and protected</p>
            </div>
          </div>
          <div className="user-register-benefit-item">
            <i className="fas fa-chart-bar"></i>
            <div>
              <h4>Real-time Results</h4>
              <p>See live updates as votes are cast</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Registration Form */}
      <div className="user-register-right-panel">
        <form className="user-register-form card-shadow" onSubmit={handleSubmit}>
          <h2>Create Your Account</h2>
          
          {/* WebSocket Test Button */}
          <div className="d-flex justify-content-end mb-3">
            <button
              type="button"
              className="btn btn-outline-info btn-sm"
              onClick={() => {
                console.log('🧪 [UserRegister] Test button clicked');
                console.log('🔌 Socket state:', {
                  exists: !!socket,
                  connected: socket?.connected,
                  id: socket?.id,
                  readyState: socket?.readyState
                });
                if (socket && socket.connected) {
                  console.log('🧪 [UserRegister] Sending test WebSocket request...');
                  socket.emit('test-websocket');
                  setSuccess('Test WebSocket request sent! Check console for response.');
                  setTimeout(() => setSuccess(''), 3000);
                } else {
                  console.error('❌ [UserRegister] WebSocket not connected');
                  setError('WebSocket not connected');
                  setTimeout(() => setError(''), 3000);
                }
              }}
              title="Test WebSocket Connection"
            >
              <i className="fas fa-wifi me-1"></i>
              Test WebSocket
            </button>
          </div>
          
          {error && <div className="user-register-error">{error}</div>}
          {success && <div className="user-register-success">{success}</div>}

          <div className="user-register-field">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.Voter_Name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              autoComplete="name"
            />
          </div>

          <div className="user-register-field">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.Voter_Email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              autoComplete="email"
            />
          </div>

          <div className="user-register-field">
            <label htmlFor="studentId">Student ID *</label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.Voter_StudentId}
              onChange={handleChange}
              placeholder="YYYY-NNNNN (e.g., 2022-00222)"
              required
              autoComplete="username"
            />
          </div>

          <div className="user-register-field">
            <label htmlFor="departmentId">
              <i className="fas fa-university me-2"></i>
              Department *
            </label>
            <div className="select-wrapper">
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                disabled={loadingDepartments}
                required
                className="beautiful-select"
              >
                <option value="">Select your department</option>
                {departments.map(department => (
                  <option key={department.id} value={department.id}>
                    {department.Department_Name} ({department.id})
                  </option>
                ))}
              </select>
              <i className="fas fa-chevron-down select-arrow"></i>
              {loadingDepartments && <div className="loading-spinner"></div>}
            </div>
            <small className="field-help">Choose your academic department</small>
          </div>

          <div className="user-register-field">
            <label htmlFor="courseId">
              <i className="fas fa-graduation-cap me-2"></i>
              Course *
            </label>
            <div className="select-wrapper">
            <select
                id="courseId"
                name="courseId"
                value={formData.courseId}
              onChange={handleChange}
                disabled={!formData.departmentId || loadingCourses}
              required
                className="beautiful-select"
            >
                <option value="">
                  {!formData.departmentId 
                    ? 'Select department first' 
                    : loadingCourses 
                      ? 'Loading courses...' 
                      : 'Select your course'
                  }
                </option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.Course_Code} - {course.Course_Name}
                </option>
              ))}
            </select>
              <i className="fas fa-chevron-down select-arrow"></i>
              {loadingCourses && <div className="loading-spinner"></div>}
            </div>
            <small className="field-help">Choose your specific course/program</small>
          </div>

          <div className="user-register-field">
            <label htmlFor="password">Password *</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
              autoComplete="new-password"
            />
            <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
            </span>
          </div>

          <div className="user-register-field">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
            <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
            </span>
          </div>

          <button type="submit" className="user-register-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="back-to-login-link">
            <button type="button" onClick={() => navigate('/')}>
              Already have an account? Sign in here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegister; 