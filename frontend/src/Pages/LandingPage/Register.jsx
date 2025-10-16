import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getDepartments, getCoursesByDepartment } from '../../services/api';
import { storeRole, storeUserData } from '../../services/auth';
import io from 'socket.io-client';
import BCLogo from '../../assets/BCLogo.png';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    Voter_Name: '',
    Voter_Email: '',
    Voter_StudentId: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
    courseId: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
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
    console.log('🔌 [LandingPage Register] Setting up WebSocket connection...');
    const newSocket = io(import.meta.env.VITE_WS_URL || 'https://backend-production-1960.up.railway.app', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    newSocket.on('connect', () => {
      console.log('🔌 [LandingPage Register] WebSocket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 [LandingPage Register] WebSocket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ [LandingPage Register] WebSocket connection error:', error);
    });

    // Election status update listeners
    newSocket.on('election-status-updated', (data) => {
      console.log('🗳️ [LandingPage Register] Election status updated:', data);
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

    setSocket(newSocket);

    return () => {
      console.log('🧹 [LandingPage Register] Cleaning up WebSocket connection...');
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
      console.log('Registration successful, storing role as "USER"');
      storeRole('USER');
      storeUserData(voter, 'USER');
      
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
        storeRole('USER');
        setTimeout(() => {
          navigate('/user/dashboard');
        }, 2000);
      } else {
        // Display the detailed error message from the backend
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-wrapper">
          <div className="register-card">
            <div className="register-card-body">
              <div className="register-header">
                <img className="register-logo" src={BCLogo} alt="School Logo" />
                <h2 className="register-title">Create an account</h2>
                <p className="register-subtitle">
                  Join BallotBlitz to participate in school elections
                </p>
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                  <label htmlFor="Voter_Name" className="form-label">Full name</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-user"></i>
                    </span>
                    <input 
                      id="Voter_Name" 
                      name="Voter_Name" 
                      type="text" 
                      className="form-control" 
                      placeholder="Enter your full name"
                      value={formData.Voter_Name}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="Voter_Email" className="form-label">Email address</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-envelope"></i>
                    </span>
                    <input 
                      id="Voter_Email" 
                      name="Voter_Email" 
                      type="email" 
                      className="form-control" 
                      placeholder="Enter your email"
                      value={formData.Voter_Email}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="Voter_StudentId" className="form-label">Student ID</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-id-card"></i>
                    </span>
                    <input 
                      id="Voter_StudentId" 
                      name="Voter_StudentId" 
                      type="text" 
                      className="form-control" 
                      placeholder="YYYY-NNNNN (e.g., 2022-00222)"
                      value={formData.Voter_StudentId}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="departmentId" className="form-label">Department</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-university"></i>
                    </span>
                    <select 
                      id="departmentId" 
                      name="departmentId" 
                      className="form-control" 
                      value={formData.departmentId}
                      onChange={handleChange}
                      disabled={loadingDepartments}
                      required 
                    >
                      <option value="">{loadingDepartments ? 'Loading departments...' : 'Select Department'}</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.Department_Name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="courseId" className="form-label">Course</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-graduation-cap"></i>
                    </span>
                    <select 
                      id="courseId" 
                      name="courseId" 
                      className="form-control" 
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
                            : 'Select Course'
                        }
                      </option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>{course.Course_Code} - {course.Course_Name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-lock"></i>
                    </span>
                    <input 
                      id="password" 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      className="form-control" 
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required 
                    />
                    <button 
                      type="button" 
                      className="input-group-text password-toggle-btn"
                      onClick={togglePasswordVisibility}
                    >
                      <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-lock"></i>
                    </span>
                    <input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      className="form-control" 
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required 
                    />
                    <button 
                      type="button" 
                      className="input-group-text password-toggle-btn"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>


                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create account'}
                </button>
              </form>

              <hr className="form-divider" />
              
              <div className="register-footer">
                <p className="register-footer-text">
                  Already have an account? 
                  <Link to="/login" className="register-footer-link">Sign in</Link>
                </p>
              </div>
            </div>
          </div>
          
          <div className="register-links">
            <Link to="/">
              <i className="fas fa-home"></i>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;