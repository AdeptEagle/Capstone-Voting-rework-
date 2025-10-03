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
    
    // Handle "not found" errors (404) - don't treat as auth error
    if (error.response?.status === 404) {
      console.log('Not found error, not redirecting');
      return Promise.reject(error);
    }
    
    // Handle authentication errors (401/403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication error detected');
      
      // Check if this is a validation error rather than an auth error
      const isValidationError = error.response?.data?.message && 
                               (error.response.data.message.includes('validation') ||
                                error.response.data.message.includes('required') ||
                                error.response.data.message.includes('must be') ||
                                error.response.data.statusCode === 400);
      
      if (isValidationError) {
        console.log('Validation error, not redirecting');
        return Promise.reject(error);
      }
      
      // NEVER redirect if we're on a login page - let the component handle the error
      const currentPath = window.location.pathname;
      const isOnLoginPage = currentPath.includes('/login') || 
                           currentPath.includes('/register') || 
                           currentPath.includes('/user-login') || 
                           currentPath.includes('/admin-login');
      
      if (isOnLoginPage) {
        console.log('On login page - NOT redirecting, letting component handle error');
        // Just return the error, don't redirect
        return Promise.reject(error);
      } else {
        console.log('Not on login page, redirecting to login');
        // Clear local data and redirect to appropriate login
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('token');
        
        // Check current path to determine appropriate redirect
        if (currentPath.includes('/admin') || currentPath.includes('/superadmin')) {
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
      
      // Check current path to determine appropriate redirect
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin') || currentPath.includes('/superadmin')) {
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
    
    // Check current path to determine appropriate redirect
    const currentPath = window.location.pathname;
    if (currentPath.includes('/admin') || currentPath.includes('/superadmin')) {
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
    // Check if candidate is FormData (for file uploads)
    const isFormData = candidate instanceof FormData;
    
    // Configure headers for FormData
    const requestConfig = {
      ...config,
      headers: {
        ...config.headers,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' })
      }
    };
    
    // Only log image upload debug info
    if (isFormData) {
      console.log('📸 Creating candidate with image upload...');
    }
    
    const response = await api.post('/candidates', candidate, requestConfig);
    return response.data;
  } catch (error) {
    console.error('Error creating candidate:', error);
    if (candidate instanceof FormData) {
      console.error('📸 Image upload failed:', error.response?.data);
    }
    throw error;
  }
};

export const updateCandidate = async (id, candidate, config = {}) => {
  try {
    // Check if candidate is FormData (for file uploads)
    const isFormData = candidate instanceof FormData;
    
    // Configure headers for FormData
    const requestConfig = {
      ...config,
      headers: {
        ...config.headers,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' })
      }
    };
    
    // Only log image upload debug info
    if (isFormData) {
      console.log('📸 Updating candidate with image upload...');
    }
    
    const response = await api.put(`/candidates/${id}`, candidate, requestConfig);
    return response.data;
  } catch (error) {
    console.error('Error updating candidate:', error);
    if (candidate instanceof FormData) {
      console.error('📸 Image upload failed:', error.response?.data);
    }
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

export const getVoterPassword = async (id) => {
  try {
    const response = await api.get(`/voters/${id}/password`);
    return response.data;
  } catch (error) {
    console.error('Error fetching voter password:', error);
    throw error;
  }
};

export const resetVoterPassword = async (id) => {
  try {
    const response = await api.put(`/voters/${id}/reset-password`);
    return response.data;
  } catch (error) {
    console.error('Error resetting voter password:', error);
    throw error;
  }
};

// Voter History API Functions
export const getVoterHistory = async (id) => {
  try {
    const response = await api.get(`/voters/${id}/history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching voter history:', error);
    throw error;
  }
};

export const getVoterBallotHistory = async (id) => {
  try {
    const response = await api.get(`/voters/${id}/ballot-history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching voter ballot history:', error);
    throw error;
  }
};

export const getVoterVotingDetails = async (id) => {
  try {
    const response = await api.get(`/voters/${id}/voting-details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching voter voting details:', error);
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

// Election Trash Management
export const getDeletedElections = async () => {
  try {
    const response = await api.get('/elections/trash/deleted');
    return response.data;
  } catch (error) {
    console.error('Error fetching deleted elections:', error);
    throw error;
  }
};

export const restoreElection = async (id) => {
  try {
    const response = await api.post(`/elections/trash/restore/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error restoring election:', error);
    throw error;
  }
};

export const permanentlyDeleteElection = async (id) => {
  try {
    const response = await api.delete(`/elections/trash/permanent/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error permanently deleting election:', error);
    throw error;
  }
};

export const getActiveElection = async () => {
  try {
    const response = await api.get('/elections/active/single');
    return response.data;
  } catch (error) {
    console.error('Error fetching active election:', error);
    throw error;
  }
};

export const hasActiveElections = async () => {
  try {
    const response = await api.get('/elections/active/check');
    return response.data;
  } catch (error) {
    console.error('Error checking active elections:', error);
    throw error;
  }
};

export const getActiveElectionInfo = async () => {
  try {
    const response = await api.get('/elections/active/info');
    return response.data;
  } catch (error) {
    console.error('Error fetching active election info:', error);
    throw error;
  }
};

// Admin Authentication
export const adminLogin = async (username, password) => {
  try {
    const response = await api.post('/auth/admin/login', { Admin_Username: username, password });
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
    const response = await api.post('/auth/user/login', { Voter_StudentId: studentId, password });
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

// Admin Login Logs API Functions
export const getAdminLoginLogs = async (page = 1, limit = 50, adminId = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (adminId) {
      params.append('adminId', adminId);
    }
    
    const response = await api.get(`/admins/login-logs?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin login logs:', error);
    throw error;
  }
};

export const getAdminLoginStats = async () => {
  try {
    const response = await api.get('/admins/login-logs/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin login stats:', error);
    throw error;
  }
};

export const getAdminLoginLogById = async (id) => {
  try {
    const response = await api.get(`/admins/login-logs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin login log:', error);
    throw error;
  }
};

export const adminLogout = async () => {
  try {
    const response = await api.post('/auth/admin/logout');
    return response.data;
  } catch (error) {
    console.error('Error during admin logout:', error);
    throw error;
  }
};

// User Login Logs API Functions
export const getUserLoginLogs = async (page = 1, limit = 50, searchTerm = '', department = '', course = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    if (department) {
      params.append('department', department);
    }
    
    if (course) {
      params.append('course', course);
    }
    
    const response = await api.get(`/admins/user-login-logs?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user login logs:', error);
    throw error;
  }
};

export const getUserLoginStats = async () => {
  try {
    const response = await api.get('/admins/user-login-logs/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching user login stats:', error);
    throw error;
  }
};

export const getUserLoginLogById = async (id) => {
  try {
    const response = await api.get(`/admins/user-login-logs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user login log:', error);
    throw error;
  }
};

export const userLogout = async () => {
  try {
    const response = await api.post('/auth/user/logout');
    return response.data;
  } catch (error) {
    console.error('Error during user logout:', error);
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

// Ballot API Functions
export const getBallots = async (filters = {}) => {
  try {
    const response = await api.get('/ballots', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching ballots:', error);
    throw error;
  }
};

export const getAvailableBallots = async () => {
  try {
    const response = await api.get(`/ballots/available`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available ballots:', error);
    throw error;
  }
};

export const getBallotById = async (id) => {
  try {
    const response = await api.get(`/ballots/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ballot:', error);
    throw error;
  }
};

export const getUserBallotHistory = async () => {
  try {
    const response = await api.get(`/ballots/user-history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user ballot history:', error);
    throw error;
  }
};

export const createBallot = async (ballotData) => {
  try {
    const response = await api.post('/ballots', ballotData);
    return response.data;
  } catch (error) {
    console.error('Error creating ballot:', error);
    throw error;
  }
};

export const createBallotFromTemplate = async (templateId, ballotData) => {
  try {
    const response = await api.post(`/ballot-templates/${templateId}/create-ballot`, ballotData);
    return response.data;
  } catch (error) {
    console.error('Error creating ballot from template:', error);
    throw error;
  }
};

export const updateBallot = async (id, ballotData) => {
  try {
    const response = await api.patch(`/ballots/${id}`, ballotData);
    return response.data;
  } catch (error) {
    console.error('Error updating ballot:', error);
    throw error;
  }
};

export const deleteBallot = async (id) => {
  try {
    const response = await api.delete(`/ballots/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting ballot:', error);
    throw error;
  }
};

export const activateBallot = async (id) => {
  try {
    const response = await api.post(`/ballots/${id}/activate`);
    return response.data;
  } catch (error) {
    console.error('Error activating ballot:', error);
    throw error;
  }
};

export const pauseBallot = async (id) => {
  try {
    const response = await api.post(`/ballots/${id}/pause`);
    return response.data;
  } catch (error) {
    console.error('Error pausing ballot:', error);
    throw error;
  }
};

export const endBallot = async (id) => {
  try {
    const response = await api.post(`/ballots/${id}/end`);
    return response.data;
  } catch (error) {
    console.error('Error ending ballot:', error);
    throw error;
  }
};

// Ballot Results API Functions
export const getBallotsWithResults = async () => {
  try {
    const response = await api.get('/ballots/results');
    return response.data;
  } catch (error) {
    console.error('Error fetching ballots with results:', error);
    throw error;
  }
};

export const getBallotResults = async (ballotId) => {
  try {
    console.log('Fetching ballot results for ballot:', ballotId);
    const response = await api.get(`/ballots/${ballotId}/results`);
    console.log('Ballot results fetched successfully:', response.data);
    console.log('Results property:', response.data.results);
    console.log('Results length:', response.data.results?.length);
    if (response.data.results && response.data.results.length > 0) {
      console.log('First result:', response.data.results[0]);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching ballot results:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message);
    throw error;
  }
};

export const getLiveBallotResults = async (ballotId) => {
  try {
    const response = await api.get(`/ballots/${ballotId}/results/live`);
    return response.data;
  } catch (error) {
    console.error('Error fetching live ballot results:', error);
    throw error;
  }
};

export const refreshBallotResults = async (ballotId) => {
  try {
    const response = await api.post(`/ballots/${ballotId}/results/refresh`);
    return response.data;
  } catch (error) {
    console.error('Error refreshing ballot results:', error);
    throw error;
  }
};

// Ballot Voting API Functions
export const createBallotVote = async (voteData) => {
  try {
    const response = await api.post('/ballots/cast-vote', voteData);
    return response.data;
  } catch (error) {
    console.error('Error creating ballot vote:', error);
    throw error;
  }
};

export default api; 