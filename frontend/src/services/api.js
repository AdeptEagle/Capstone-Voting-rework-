import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HTTP-only cookies
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle authentication errors (401/403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication error detected, redirecting to login');
      // Clear local data and redirect to appropriate login
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('token');
      
      // Don't redirect if we're already on a login page to avoid infinite loops
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        const role = localStorage.getItem('role') || 'user';
        if (role === 'admin' || role === 'SUPERADMIN') {
          window.location.href = '/admin-login';
        } else {
          window.location.href = '/user-login';
        }
      }
    }
    
    // Handle username/name change errors
    if (error.response?.data?.code === 'USERNAME_CHANGED' || 
        error.response?.data?.code === 'NAME_CHANGED') {
      // Clear localStorage and redirect to appropriate login
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      const role = localStorage.getItem('role') || 'user';
      if (role === 'admin' || role === 'SUPERADMIN') {
        window.location.href = '/admin-login';
      } else {
        window.location.href = '/user-login';
      }
      
      // Show a user-friendly message
      alert('Your account information has been updated. Please log in again.');
    }
    
    return Promise.reject(error);
  }
);

// Add a request interceptor for HTTP-only cookies
// Cookies are automatically sent with requests when withCredentials: true
api.interceptors.request.use(
  (config) => {
    // Don't add Authorization header for login/register endpoints
    // HTTP-only cookies are automatically handled by the browser
    const isAuthEndpoint = config.url && (
      config.url.includes('/auth/admin/login') ||
      config.url.includes('/auth/user/login') ||
      config.url.includes('/auth/user/register')
    );
    
    // For non-auth endpoints, cookies will be sent automatically
    // No need to manually add Authorization header
    return config;
  },
  (error) => Promise.reject(error)
);

// Add this at the top of the file, after the imports
const handleAuthError = (error) => {
  if (error.response?.data?.code === 'USERNAME_CHANGED' || 
      error.response?.data?.code === 'NAME_CHANGED') {
    // Clear localStorage and redirect to appropriate login
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    const role = localStorage.getItem('role') || 'user';
    if (role === 'admin' || role === 'SUPERADMIN') {
      window.location.href = '/admin-login';
    } else {
      window.location.href = '/user-login';
    }
    
    // Show a user-friendly message
    alert('Your account information has been updated. Please log in again.');
  }
};

// Positions API Functions
export const getPositions = async () => {
  try {
    // Add cache-busting parameter to prevent stale data
    const response = await api.get('/positions', {
      params: { _t: Date.now() }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
};



export const createPosition = async (position) => {
  try {
    // Do NOT override id, use the one provided by the form
    const response = await api.post('/positions', position);
    return response.data;
  } catch (error) {
    console.error('Error creating position:', error);
    throw error;
  }
};

export const updatePosition = async (id, position) => {
  try {
    const response = await api.put(`/positions/${id}`, position);
    return response.data;
  } catch (error) {
    console.error('Error updating position:', error);
    throw error;
  }
};

export const deletePosition = async (id) => {
  try {
    const response = await api.delete(`/positions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting position:', error);
    throw error;
  }
};

// Candidates API Functions
export const getCandidates = async () => {
  try {
    // Add cache-busting parameter to prevent stale data
    const response = await api.get('/candidates', {
      params: { _t: Date.now() }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
};

export const createCandidate = async (candidate, config = {}) => {
  try {
    // Don't add ID - let the backend generate it
    const response = await api.post('/candidates', candidate, config);
    return response.data;
  } catch (error) {
    console.error('Error creating candidate:', error);
    throw error;
  }
};

export const updateCandidate = async (id, candidate, config = {}) => {
  try {
    const response = await api.put(`/candidates/${id}`, candidate, config);
    return response.data;
  } catch (error) {
    console.error('Error updating candidate:', error);
    throw error;
  }
};

export const deleteCandidate = async (id) => {
  try {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting candidate:', error);
    throw error;
  }
};

// Voters API Functions
export const getVoters = async () => {
  try {
    const response = await api.get('/voters');
    return response.data;
  } catch (error) {
    console.error('Error fetching voters:', error);
    throw error;
  }
};

export const createVoter = async (voter) => {
  try {
    const response = await api.post('/voters', voter);
    return response.data;
  } catch (error) {
    console.error('Error creating voter:', error);
    throw error;
  }
};

export const updateVoter = async (id, voter) => {
  try {
    const response = await api.put(`/voters/${id}`, voter);
    return response.data;
  } catch (error) {
    console.error('Error updating voter:', error);
    throw error;
  }
};

export const deleteVoter = async (id) => {
  try {
    const response = await api.delete(`/voters/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting voter:', error);
    throw error;
  }
};

export const getAvailableVoters = async () => {
  try {
    const response = await api.get('/voters/available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available voters:', error);
    throw error;
  }
};

// Votes API Functions
export const getVotes = async () => {
  try {
    const response = await api.get('/votes');
    return response.data;
  } catch (error) {
    console.error('Error fetching votes:', error);
    throw error;
  }
};

export const createVote = async (vote) => {
  try {
    const response = await api.post('/votes', vote);
    return response.data;
  } catch (error) {
    console.error('Error creating vote:', error);
    throw error;
  }
};

// Results API Functions
export const getResults = async () => {
  try {
    const response = await api.get('/votes/results');
    return response.data;
  } catch (error) {
    console.error('Error fetching results:', error);
    throw error;
  }
};

export const getActiveElectionResults = async () => {
  try {
    const response = await api.get('/votes/active-results');
    return response.data;
  } catch (error) {
    console.error('Error fetching active election results:', error);
    throw error;
  }
};

export const getRealTimeStats = async () => {
  try {
    const response = await api.get('/votes/real-time-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching real-time stats:', error);
    throw error;
  }
};

export const getVoteTimeline = async () => {
  try {
    const response = await api.get('/votes/vote-timeline');
    return response.data;
  } catch (error) {
    console.error('Error fetching vote timeline:', error);
    throw error;
  }
};

// Debug: Get raw vote data for troubleshooting
export const getDebugResults = async () => {
  try {
    const response = await api.get('/votes/debug/results');
    return response.data;
  } catch (error) {
    console.error('Error fetching debug results:', error);
    throw error;
  }
};

// Elections API Functions
export const getElections = async () => {
  try {
    const response = await api.get('/elections');
    return response.data;
  } catch (error) {
    console.error('Error fetching elections:', error);
    throw error;
  }
};

export const getElectionHistory = async () => {
  try {
    const response = await api.get('/elections/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching election history:', error);
    throw error;
  }
};

export const getElection = async (id) => {
  try {
    const response = await api.get(`/elections/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching election:', error);
    throw error;
  }
};

export const getElectionPositions = async (id) => {
  try {
    const response = await api.get(`/election-assignments/election/${id}/positions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching election positions:', error);
    throw error;
  }
};

export const getElectionBallot = async (electionId) => {
  try {
    const response = await api.get(`/election-assignments/election/${electionId}/ballot`);
    return response.data;
  } catch (error) {
    console.error('Error fetching election ballot:', error);
    throw error;
  }
};

export const createElection = async (election) => {
  try {
    const response = await api.post('/elections', election);
    return response.data;
  } catch (error) {
    console.error('Error creating election:', error);
    throw error;
  }
};

export const addPositionToElection = async (electionId, positionData) => {
  try {
    const response = await api.post(`/elections/${electionId}/positions`, positionData);
    return response.data;
  } catch (error) {
    console.error('Error adding position to election:', error);
    throw error;
  }
};

export const addCandidateToElection = async (electionId, candidateData) => {
  try {
    const response = await api.post(`/elections/${electionId}/candidates`, candidateData);
    return response.data;
  } catch (error) {
    console.error('Error adding candidate to election:', error);
    throw error;
  }
};

export const updateElection = async (id, election) => {
  try {
    const response = await api.put(`/elections/${id}`, election);
    return response.data;
  } catch (error) {
    console.error('Error updating election:', error);
    throw error;
  }
};

export const startElection = async (id) => {
  try {
    const response = await api.put(`/elections/${id}/start-ballot`);
    return response.data;
  } catch (error) {
    console.error('Error starting election:', error);
    throw error;
  }
};

export const pauseElection = async (id) => {
  try {
    const response = await api.put(`/elections/${id}/pause-ballot`);
    return response.data;
  } catch (error) {
    console.error('Error pausing election:', error);
    throw error;
  }
};

export const stopElection = async (id) => {
  try {
    const response = await api.put(`/elections/${id}/stop-ballot`);
    return response.data;
  } catch (error) {
    console.error('Error stopping election:', error);
    throw error;
  }
};

export const resumeElection = async (id) => {
  try {
    const response = await api.put(`/elections/${id}/resume-ballot`);
    return response.data;
  } catch (error) {
    console.error('Error resuming election:', error);
    throw error;
  }
};

export const endElection = async (id) => {
  try {
    const response = await api.put(`/elections/${id}/end-ballot`);
    return response.data;
  } catch (error) {
    console.error('Error ending election:', error);
    throw error;
  }
};

export const deleteElection = async (id) => {
  try {
    const response = await api.delete(`/elections/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting election:', error);
    throw error;
  }
};

export const getActiveElection = async () => {
  try {
    const response = await api.get('/elections/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active election:', error);
    throw error;
  }
};

// Admin Authentication
export const adminLogin = async (username, password) => {
  try {
    const response = await api.post('/auth/admin/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('Error during admin login:', error);
    throw error;
  }
};

export const userRegister = async (userData) => {
  try {
    const response = await api.post('/auth/user/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error during user registration:', error);
    throw error;
  }
};

export const userLogin = async (studentId, password) => {
  try {
    const response = await api.post('/auth/user/login', { studentId, password });
    return response.data;
  } catch (error) {
    console.error('Error during user login:', error);
    throw error;
  }
};

// Admin Management API Functions
export const getAdmins = async () => {
  try {
    const response = await api.get('/admins');
    return response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

export const createAdmin = async (admin) => {
  try {
    const response = await api.post('/admins', admin);
    return response.data;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

export const updateAdmin = async (id, admin) => {
  try {
    const response = await api.put(`/admins/${id}`, admin);
    return response.data;
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

export const deleteAdmin = async (id) => {
  try {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};

// Election Assignment API Functions
export const getAssignedElectionPositions = async (electionId) => {
  try {
    const response = await api.get(`/election-assignments/elections/${electionId}/positions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned election positions:', error);
    throw error;
  }
};

export const getElectionCandidates = async (electionId) => {
  try {
    const response = await api.get(`/election-assignments/election/${electionId}/candidates`);
    return response.data;
  } catch (error) {
    console.error('Error fetching election candidates:', error);
    throw error;
  }
};

export const getUnassignedPositions = async (electionId) => {
  try {
    const response = await api.get(`/election-assignments/elections/${electionId}/unassigned-positions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unassigned positions:', error);
    throw error;
  }
};

export const getUnassignedCandidates = async (electionId) => {
  try {
    const response = await api.get(`/election-assignments/elections/${electionId}/unassigned-candidates`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unassigned candidates:', error);
    throw error;
  }
};

export const getPositionAssignmentStatus = async (electionId) => {
  try {
    const response = await api.get(`/election-assignments/elections/${electionId}/position-status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching position assignment status:', error);
    throw error;
  }
};

export const getCandidateAssignmentStatus = async (electionId) => {
  try {
    const response = await api.get(`/election-assignments/elections/${electionId}/candidate-status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching candidate assignment status:', error);
    throw error;
  }
};

export const assignPositionToElection = async (electionId, positionId) => {
  try {
    const response = await api.post('/election-assignments/elections/assign-position', {
      electionId,
      positionId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning position to election:', error);
    throw error;
  }
};

export const assignCandidateToElection = async (electionId, candidateId) => {
  try {
    const response = await api.post('/election-assignments/elections/assign-candidate', {
      electionId,
      candidateId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning candidate to election:', error);
    throw error;
  }
};

export const removePositionFromElection = async (electionId, positionId) => {
  try {
    const response = await api.delete(`/election-assignments/elections/${electionId}/positions/${positionId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing position from election:', error);
    throw error;
  }
};

export const removeCandidateFromElection = async (electionId, candidateId) => {
  try {
    const response = await api.delete(`/election-assignments/elections/${electionId}/candidates/${candidateId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing candidate from election:', error);
    throw error;
  }
};

// Test function to check if election_candidates table exists
export const testElectionCandidatesTable = async () => {
  try {
    const response = await api.get('/election-assignments/test-table');
    return response.data;
  } catch (error) {
    console.error('Error testing table:', error);
    throw error;
  }
};

// Departments API Functions
export const getDepartments = async () => {
  try {
    // Add cache-busting parameter to prevent stale data
    const response = await api.get('/departments', {
      params: { _t: Date.now() }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Public departments API (for registration)
export const getPublicDepartments = async () => {
  try {
    const response = await api.get('/departments/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching public departments:', error);
    throw error;
  }
};

export const getDepartmentById = async (id) => {
  try {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching department:', error);
    throw error;
  }
};

export const createDepartment = async (department) => {
  try {
    const response = await api.post('/departments', department);
    return response.data;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

export const updateDepartment = async (id, department) => {
  try {
    const response = await api.put(`/departments/${id}`, department);
    return response.data;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

export const deleteDepartment = async (id) => {
  try {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};

export const getDepartmentCourses = async (id) => {
  try {
    const response = await api.get(`/departments/${id}/courses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching department courses:', error);
    throw error;
  }
};

export const getDepartmentVoters = async (id) => {
  try {
    const response = await api.get(`/departments/${id}/voters`);
    return response.data;
  } catch (error) {
    console.error('Error fetching department voters:', error);
    throw error;
  }
};

export const getDepartmentCandidates = async (id) => {
  try {
    const response = await api.get(`/departments/${id}/candidates`);
    return response.data;
  } catch (error) {
    console.error('Error fetching department candidates:', error);
    throw error;
  }
};

// Courses API Functions
export const getCourses = async () => {
  try {
    // Add cache-busting parameter to prevent stale data
    const response = await api.get('/courses', {
      params: { _t: Date.now() }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Public courses API (for registration)
export const getPublicCourses = async () => {
  try {
    const response = await api.get('/courses/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching public courses:', error);
    throw error;
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

export const createCourse = async (course) => {
  try {
    const response = await api.post('/courses', course);
    return response.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const updateCourse = async (id, course) => {
  try {
    console.log('updateCourse API call - id:', id);
    console.log('updateCourse API call - course data:', course);
    const response = await api.put(`/courses/${id}`, course);
    console.log('updateCourse API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating course:', error);
    console.error('Error response data:', error.response?.data);
    throw error;
  }
};

export const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

export const getCoursesByDepartment = async (departmentId) => {
  try {
    const response = await api.get(`/courses/department/${departmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching courses by department:', error);
    throw error;
  }
};

// Public courses by department API (for registration)
export const getPublicCoursesByDepartment = async (departmentId) => {
  try {
    const response = await api.get(`/courses/public/department/${departmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public courses by department:', error);
    throw error;
  }
};

export const getCourseVoters = async (id) => {
  try {
    const response = await api.get(`/courses/${id}/voters`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course voters:', error);
    throw error;
  }
};

export const getCourseCandidates = async (id) => {
  try {
    const response = await api.get(`/courses/${id}/candidates`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course candidates:', error);
    throw error;
  }
};

export default api; 