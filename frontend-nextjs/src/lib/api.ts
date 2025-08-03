import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { 
    name: string; 
    email: string; 
    password: string; 
    studentId: string;
    departmentId?: string;
    courseId?: string;
  }) => api.post('/auth/register', userData),
  
  adminLogin: (credentials: { username: string; password: string }) =>
    api.post('/auth/admin/login', credentials),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  
  verifyToken: () => api.get('/auth/verify'),
}

// Elections API
export const electionsAPI = {
  getAll: () => api.get('/elections'),
  getById: (id: string) => api.get(`/elections/${id}`),
  getActive: () => api.get('/elections/active'),
  create: (electionData: any) => api.post('/elections', electionData),
  update: (id: string, electionData: any) => api.put(`/elections/${id}`, electionData),
  delete: (id: string) => api.delete(`/elections/${id}`),
  activate: (id: string) => api.patch(`/elections/${id}/activate`),
  deactivate: (id: string) => api.patch(`/elections/${id}/deactivate`),
}

// Candidates API
export const candidatesAPI = {
  getAll: () => api.get('/candidates'),
  getById: (id: string) => api.get(`/candidates/${id}`),
  create: (candidateData: any) => api.post('/candidates', candidateData),
  update: (id: string, candidateData: any) => api.put(`/candidates/${id}`, candidateData),
  delete: (id: string) => api.delete(`/candidates/${id}`),
  uploadPhoto: (id: string, formData: FormData) =>
    api.post(`/candidates/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// Votes API
export const votesAPI = {
  castVote: (voteData: {
    candidateId: string;
    electionId: string;
    positionId: string;
  }) => api.post('/votes', voteData),
  
  getVoteHistory: () => api.get('/votes/history'),
  getResults: (electionId: string) => api.get(`/votes/results/${electionId}`),
}

// Departments API
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  getById: (id: string) => api.get(`/departments/${id}`),
  create: (departmentData: any) => api.post('/departments', departmentData),
  update: (id: string, departmentData: any) => api.put(`/departments/${id}`, departmentData),
  delete: (id: string) => api.delete(`/departments/${id}`),
}

// Courses API
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id: string) => api.get(`/courses/${id}`),
  getByDepartment: (departmentId: string) => api.get(`/courses/department/${departmentId}`),
  create: (courseData: any) => api.post('/courses', courseData),
  update: (id: string, courseData: any) => api.put(`/courses/${id}`, courseData),
  delete: (id: string) => api.delete(`/courses/${id}`),
}

// Positions API
export const positionsAPI = {
  getAll: () => api.get('/positions'),
  getById: (id: string) => api.get(`/positions/${id}`),
  create: (positionData: any) => api.post('/positions', positionData),
  update: (id: string, positionData: any) => api.put(`/positions/${id}`, positionData),
  delete: (id: string) => api.delete(`/positions/${id}`),
}

// Voters API
export const votersAPI = {
  getAll: () => api.get('/voters'),
  getById: (id: string) => api.get(`/voters/${id}`),
  create: (voterData: any) => api.post('/voters', voterData),
  update: (id: string, voterData: any) => api.put(`/voters/${id}`, voterData),
  delete: (id: string) => api.delete(`/voters/${id}`),
  bulkImport: (formData: FormData) =>
    api.post('/voters/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStats: () => api.get('/admin/stats'),
  getElectionResults: (electionId: string) => api.get(`/admin/elections/${electionId}/results`),
  getVoteTraceability: (electionId: string) => api.get(`/admin/elections/${electionId}/traceability`),
}

export default api 