import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { getCandidates, createCandidate, updateCandidate, deleteCandidate, getPositions, getDepartments, getCoursesByDepartment, getPartyLists, createPartyList, updatePartyList, deletePartyList, getPartyListStatistics } from '../services/api';
import { checkCurrentUser } from '../services/auth';
import { useElection } from '../contexts/ElectionContext';
import ElectionStatusMessage from '../components/ElectionStatusMessage';
import './Candidates.css';
import { getCandidatePhotoUrl, CandidatePhotoPlaceholder } from '../utils/image.jsx';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [partyLists, setPartyLists] = useState([]);
  const [partyListStats, setPartyListStats] = useState({ totalPartyLists: 0, partyLists: [] });
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    Candidate_Name: '',
    Candidate_Email: '',
    Candidate_StudentId: '',
    positionId: '',
    departmentId: '',
    courseId: '',
    photo: null,
    manifesto: '',
    party_list_name: '',
    partyListId: ''
  });
  const [viewCandidate, setViewCandidate] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('Candidate_Name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPartyListModal, setShowPartyListModal] = useState(false);
  const [showPartyListCreateModal, setShowPartyListCreateModal] = useState(false);
  const [editingPartyList, setEditingPartyList] = useState(null);
  const [partyListFormData, setPartyListFormData] = useState({
    name: '',
    description: '',
    color: '#007bff',
    logo: ''
  });
  const [partyListLogoFile, setPartyListLogoFile] = useState(null);
  const [partyListLogoPreview, setPartyListLogoPreview] = useState('');

  const role = checkCurrentUser().role;
  const { canViewCandidates, hasActiveElection, triggerImmediateRefresh } = useElection();

  useEffect(() => {
    // Trigger immediate election status refresh
    triggerImmediateRefresh();
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candidatesData, positionsData, departmentsData, partyListsData, partyListStatsData] = await Promise.allSettled([
        getCandidates(),
        getPositions(),
        getDepartments(),
        getPartyLists(),
        getPartyListStatistics()
      ]);
      
      // Handle candidates data
      if (candidatesData.status === 'fulfilled') {
        setCandidates(candidatesData.value);
      } else {
        console.error('Error fetching candidates:', candidatesData.reason);
        setCandidates([]);
      }
      
      // Handle positions data
      if (positionsData.status === 'fulfilled') {
        setPositions(positionsData.value);
      } else {
        console.error('Error fetching positions:', positionsData.reason);
        setPositions([]);
      }
      
      // Handle departments data
      if (departmentsData.status === 'fulfilled') {
        setDepartments(departmentsData.value);
      } else {
        console.error('Error fetching departments:', departmentsData.reason);
        setDepartments([]);
      }
      
      // Handle party lists data
      if (partyListsData.status === 'fulfilled') {
        setPartyLists(partyListsData.value.data || partyListsData.value);
      } else {
        console.error('Error fetching party lists:', partyListsData.reason);
        setPartyLists([]);
      }
      
      // Handle party list statistics
      if (partyListStatsData.status === 'fulfilled') {
        setPartyListStats(partyListStatsData.value.data || partyListStatsData.value);
      } else {
        console.error('Error fetching party list statistics:', partyListStatsData.reason);
        setPartyListStats({ totalPartyLists: 0, partyLists: [] });
      }
      
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (departmentId) => {
    if (!departmentId) {
      setCourses([]);
      return;
    }
    
    try {
      setLoadingCourses(true);
      const coursesData = await getCoursesByDepartment(departmentId);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleShowModal = (candidate = null) => {
    // Close view modal if it's open
    setViewCandidate(null);
    
    if (candidate) {
      setEditingCandidate(candidate);
      setFormData({
        Candidate_Name: candidate.Candidate_Name,
        Candidate_Email: candidate.Candidate_Email || '',
        Candidate_StudentId: candidate.Candidate_StudentId || '',
        positionId: candidate.positionId,
        departmentId: candidate.departmentId || '',
        courseId: candidate.courseId || '',
        photo: candidate.photo || null,
        manifesto: candidate.manifesto || ''
      });
      setPhotoPreview(candidate.photo || '');
      setPhotoFile(null);
      
      // Fetch courses if department is selected
      if (candidate.departmentId) {
        fetchCourses(candidate.departmentId);
      }
    } else {
      setEditingCandidate(null);
      setFormData({
        Candidate_Name: '',
        Candidate_Email: '',
        Candidate_StudentId: '',
        positionId: '',
        departmentId: '',
        courseId: '',
        photo: null,
        manifesto: ''
      });
      setPhotoPreview('');
      setPhotoFile(null);
      setCourses([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCandidate(null);
    setFormData({
      Candidate_Name: '',
      Candidate_Email: '',
      Candidate_StudentId: '',
      positionId: '',
      departmentId: '',
      courseId: '',
      photo: null,
      manifesto: ''
    });
    setPhotoPreview('');
    setPhotoFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'departmentId') {
      // Reset courseId when department changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        courseId: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields - Department and Course are now required for all users
    if (!formData.departmentId) {
      setError('Please select a department');
      return;
    }
    
    if (!formData.courseId) {
      setError('Please select a course');
      return;
    }
    
    try {
      let dataToSend;
      if (photoFile) {
        // New photo file selected - use FormData
        dataToSend = new FormData();
        dataToSend.append('Candidate_Name', formData.Candidate_Name);
        dataToSend.append('Candidate_Email', formData.Candidate_Email);
        dataToSend.append('Candidate_StudentId', formData.Candidate_StudentId);
        dataToSend.append('positionId', formData.positionId);
        dataToSend.append('departmentId', formData.departmentId);
        dataToSend.append('courseId', formData.courseId);
        dataToSend.append('manifesto', formData.manifesto);
        dataToSend.append('photo', photoFile);
      } else {
        // No new photo file - use JSON data
        dataToSend = { ...formData };
        
        // If editing and no new photo selected, preserve the existing photo URL
        if (editingCandidate && editingCandidate.photo) {
          dataToSend.photo = editingCandidate.photo;
        } else {
          // Remove photo field if no existing photo and no new photo
          delete dataToSend.photo;
        }
      }
      
      console.log('Submitting candidate data:', dataToSend);
      console.log('Photo file:', photoFile);
      if (photoFile) {
        console.log('Photo file details:', {
          name: photoFile.name,
          size: photoFile.size,
          type: photoFile.type
        });
      }
      
      // Debug: Check what's being sent
      if (dataToSend instanceof FormData) {
        console.log('FormData contents:');
        for (let [key, value] of dataToSend.entries()) {
          console.log(`${key}:`, value);
        }
      } else {
        console.log('JSON data:', dataToSend);
      }
      
      // Debug: Check if photo field exists in formData
      console.log('formData.photo:', formData.photo);
      console.log('photoFile:', photoFile);
      
      if (editingCandidate) {
        console.log('Updating candidate:', editingCandidate.id);
        const result = await updateCandidate(editingCandidate.id, dataToSend, photoFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
        console.log('Update result:', result);
        console.log('📸 Photo URL in response:', result.candidate?.photo);
        console.log('📸 Full candidate object:', result.candidate);
      } else {
        console.log('Creating new candidate');
        const result = await createCandidate(dataToSend, photoFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
        console.log('Create result:', result);
      }
      
      console.log('Candidate saved successfully, refreshing data...');
      handleCloseModal();
      await fetchData();
    } catch (error) {
      console.error('Error saving candidate:', error);
      setError('Failed to save candidate');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCandidate(id);
      // Clear any existing errors
      setError('');
      
      // Show success message about trash bin
      setSuccessMessage(`Candidate "${candidateToDelete?.Candidate_Name}" has been moved to the trash bin. You can restore it later or permanently delete it from the Trash Bin page.`);
      
      // Refresh the data to get updated list
      await fetchData();
      // Close modal and reset state
      setShowDeleteModal(false);
      setCandidateToDelete(null);
      
      // Clear success message after 8 seconds
      setTimeout(() => setSuccessMessage(''), 8000);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        // Candidate was already deleted or doesn't exist
        // Refresh the list to get current data
        await fetchData();
        setShowDeleteModal(false);
        setCandidateToDelete(null);
        setError('Candidate was already deleted or not found');
      } else {
        setError('Failed to delete candidate');
      }
    }
  };

  const openDeleteModal = (candidate) => {
    setCandidateToDelete(candidate);
    setShowDeleteModal(true);
  };

  // Party List Management Functions
  const handleShowPartyListModal = (partyList = null) => {
    // Clear any existing errors
    setError('');
    
    if (partyList) {
      setEditingPartyList(partyList);
      setPartyListFormData({
        name: partyList.name,
        description: partyList.description || '',
        color: partyList.color || '#007bff',
        logo: partyList.logo || ''
      });
    } else {
      setEditingPartyList(null);
      setPartyListFormData({
        name: '',
        description: '',
        color: '#007bff',
        logo: ''
      });
    }
    setShowPartyListCreateModal(true);
  };

  const handleClosePartyListModal = () => {
    setShowPartyListCreateModal(false);
    setEditingPartyList(null);
    setPartyListFormData({
      name: '',
      description: '',
      color: '#007bff',
      logo: ''
    });
    setPartyListLogoFile(null);
    setPartyListLogoPreview('');
  };

  const handlePartyListChange = (e) => {
    const { name, value } = e.target;
    setPartyListFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePartyListLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPartyListLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPartyListLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditPartyListFromHeader = (partyList) => {
    setEditingPartyList(partyList);
    setPartyListFormData({
      name: partyList.name,
      description: partyList.description || '',
      color: partyList.color || '#007bff',
      logo: partyList.logo || ''
    });
    setPartyListLogoFile(null);
    setPartyListLogoPreview('');
    setError('');
    setShowPartyListCreateModal(true);
  };

  const handlePartyListSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!partyListFormData.name.trim()) {
      setError('Party list name is required');
      return;
    }
    
    // Check if name already exists (for new party lists)
    if (!editingPartyList && partyLists && Array.isArray(partyLists) && partyLists.some(pl => pl.name.toLowerCase() === partyListFormData.name.toLowerCase())) {
      setError(`A party list with the name "${partyListFormData.name}" already exists`);
      return;
    }
    
    try {
      if (editingPartyList) {
        await updatePartyList(editingPartyList.id, partyListFormData, partyListLogoFile);
        setSuccessMessage(`Party list "${partyListFormData.name}" updated successfully!`);
      } else {
        await createPartyList(partyListFormData, partyListLogoFile);
        setSuccessMessage(`Party list "${partyListFormData.name}" created successfully!`);
      }
      
      handleClosePartyListModal();
      await fetchData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error saving party list:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        setError(`A party list with the name "${partyListFormData.name}" already exists. Please choose a different name.`);
      } else if (error.response?.status === 400) {
        setError('Please check your input and try again.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to save party list. Please try again.');
      }
    }
  };

  const handleDeletePartyList = async (partyList) => {
    if (window.confirm(`Are you sure you want to delete the party list "${partyList.name}"? This action cannot be undone.`)) {
      try {
        await deletePartyList(partyList.id);
        setSuccessMessage(`Party list "${partyList.name}" deleted successfully!`);
        await fetchData();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } catch (error) {
        console.error('Error deleting party list:', error);
        setError('Failed to delete party list');
      }
    }
  };

  // Helper to get correct candidate photo URL
  const getCandidatePhotoUrl = (photoUrl) => {
    if (!photoUrl || photoUrl === 'undefined' || photoUrl === 'null') return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    if (photoUrl.startsWith('/uploads/')) {
      return `http://localhost:3001${photoUrl}`;
    }
    return `http://localhost:3001/uploads/${photoUrl}`;
  };

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(candidate => {
      const term = searchTerm.toLowerCase();
      return (
        candidate.Candidate_Name?.toLowerCase().includes(term) ||
                  candidate.position?.Position_Title?.toLowerCase().includes(term) ||
          candidate.department?.Department_Name?.toLowerCase().includes(term) ||
                  candidate.course?.Course_Name?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortField === 'positionName') {
        // Sort by position title
        const aValue = a.position?.title || '';
        const bValue = b.position?.title || '';
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      } else if (sortField === 'departmentName') {
        // Sort by department name
        const aValue = a.department?.name || '';
        const bValue = b.department?.name || '';
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      } else if (sortField === 'courseName') {
        // Sort by course ID
        const aValue = a.course?.id || '';
        const bValue = b.course?.id || '';
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      } else {
        let aValue = a[sortField] || '';
        let bValue = b[sortField] || '';
        aValue = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
        bValue = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
    });

  // Group candidates by party list and sort by position within each group
  const groupCandidatesByPartyList = (candidates) => {
    const grouped = {};
    
    candidates.forEach(candidate => {
      const partyListName = candidate.partyList?.name || 'Independent';
      if (!grouped[partyListName]) {
        grouped[partyListName] = {
          partyList: candidate.partyList,
          candidates: []
        };
      }
      grouped[partyListName].candidates.push(candidate);
    });
    
    // Sort candidates within each party list by position
    Object.keys(grouped).forEach(partyListName => {
      grouped[partyListName].candidates.sort((a, b) => {
        const positionA = a.position?.Position_Title || '';
        const positionB = b.position?.Position_Title || '';
        return positionA.localeCompare(positionB);
      });
    });
    
    return grouped;
  };

  const groupedCandidates = groupCandidatesByPartyList(filteredCandidates);

  // Helper to render sort icon
  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return (
      <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
    );
  };

  // User view: modern candidate cards grouped by position
  if (role === 'USER') {
    // Check if user can view candidates (has active election)
    if (!canViewCandidates) {
      return <ElectionStatusMessage type="candidates" />;
    }

    // Group candidates by position
    const candidatesByPosition = candidates.reduce((groups, candidate) => {
      const position = candidate.positionName || 'Unknown Position';
      if (!groups[position]) {
        groups[position] = [];
      }
      groups[position].push(candidate);
      return groups;
    }, {});

    return (
      <div className="candidates-user-view">
        {/* Professional Header */}
        <div className="dashboard-header-pro">
          <div className="dashboard-header-row">
            <div>
              <h1 className="dashboard-title-pro">Meet the Candidates</h1>
              <p className="dashboard-subtitle-pro">Explore each candidate's platform, vision, and qualifications for their respective positions.</p>
            </div>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        
        {candidates.length > 0 ? (
          Object.entries(candidatesByPosition).map(([position, positionCandidates]) => (
            <div key={position} className="position-section">
              <div className="position-header">
                <h2 className="position-title">{position}</h2>
                <span className="candidate-count">{positionCandidates.length} candidate{positionCandidates.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="candidate-card-grid">
                {positionCandidates.map((candidate, index) => (
                  <div className="candidate-card-modern" key={candidate.id}>
                    <div className="candidate-card-header">
                      <div className="candidate-rank-badge">
                        <span className="rank-number">{index + 1}</span>
                      </div>
                      <div className="candidate-photo-container">
                        {candidate.photo && candidate.photo !== 'undefined' ? (
                          <img src={getCandidatePhotoUrl(candidate.photo)} alt={candidate.Candidate_Name} className="candidate-photo" />
                        ) : (
                          <div className="candidate-photo-placeholder">
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="candidate-card-body">
                      <div className="candidate-info">
                        <h3 className="candidate-name">
                          {candidate.Candidate_Name}
                          <span className="verified"><i className="fas fa-check-circle"></i></span>
                        </h3>
                        <p className="candidate-position">{candidate.position?.Position_Title}</p>
                        {(candidate.department?.Department_Name || candidate.course?.Course_Name) && (
                          <p className="candidate-department">
                            <i className="fas fa-university me-1"></i>
                            {candidate.department?.Department_Name}
                            {candidate.course?.Course_Name && (
                              <span className="candidate-course">
                                <i className="fas fa-graduation-cap me-1"></i>
                                {candidate.course?.Course_Name}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="candidate-brief">
                        <p>
                          <strong>Party List:</strong> {candidate.party_list_name || 'Independent'}
                        </p>
                        {candidate.manifesto && (
                          <p className="manifesto-preview">
                            {candidate.manifesto.substring(0, 80) + (candidate.manifesto.length > 80 ? '...' : '')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="candidate-card-footer">
                      <button 
                        className="expand-btn"
                        onClick={() => setViewCandidate(candidate)}
                      >
                        View Platform
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-candidates">
            <div className="no-candidates-content">
              <i className="fas fa-users"></i>
              <h3>No Candidates Yet</h3>
              <p>Candidates will appear here once they are added to the system.</p>
            </div>
          </div>
        )}
        
        {/* Enhanced View Candidate Modal */}
        {viewCandidate && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '1000px', width: '90%' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <div className="modal-candidate-info">
                    <div className="modal-candidate-photo-container">
                      {viewCandidate?.photo && viewCandidate.photo !== 'undefined' ? (
                        <img src={getCandidatePhotoUrl(viewCandidate.photo)} alt={viewCandidate.Candidate_Name} className="modal-candidate-photo" />
                      ) : (
                        <div className="modal-candidate-photo-placeholder">
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                    </div>
                    <div className="modal-candidate-details">
                      <h4 className="modal-candidate-name">{viewCandidate?.Candidate_Name}</h4>
                      <p className="modal-position">{viewCandidate?.position?.Position_Title}</p>
                      <div className="candidate-status">
                        <span className="badge bg-success">
                          <i className="fas fa-check-circle me-1"></i>
                          Verified Candidate
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setViewCandidate(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Full-width content layout */}
                  <div className="candidate-content-full">
                    {/* Platform & Vision Section */}
                    <div className="candidate-platform mb-4">
                      <div className="platform-header">
                        <i className="fas fa-bullhorn"></i>
                        <h5>Platform & Vision</h5>
                      </div>
                      <div className="platform-content">
                        {viewCandidate?.manifesto ? (
                          <div className="platform-text">
                            {viewCandidate.manifesto.split('\n').map((paragraph, index) => (
                              <p key={index}>{paragraph}</p>
                            ))}
                          </div>
                        ) : (
                          <div className="no-platform">
                            <i className="fas fa-info-circle"></i>
                            <p>No platform information available yet.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Candidate Details Section - Now below the main content */}
                    <div className="candidate-details-section">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="candidate-details-card mb-4">
                            <div className="card">
                              <div className="card-header">
                                <h6><i className="fas fa-user-circle me-2"></i>Candidate Details</h6>
                              </div>
                              <div className="card-body">
                                <div className="detail-item">
                                  <i className="fas fa-id-card"></i>
                                  <span><strong>Position:</strong> {viewCandidate?.position?.title || 'Not specified'}</span>
                                </div>
                                <div className="detail-item">
                                  <i className="fas fa-user"></i>
                                  <span><strong>Name:</strong> {viewCandidate?.name}</span>
                                </div>
                                {(viewCandidate?.department?.name || viewCandidate?.course?.id) && (
                                  <div className="detail-item">
                                    <i className="fas fa-university"></i>
                                    <span><strong>Department:</strong> {viewCandidate?.department?.name || 'Not specified'}</span>
                                  </div>
                                )}
                                {viewCandidate?.course?.id && (
                                  <div className="detail-item">
                                    <i className="fas fa-graduation-cap"></i>
                                    <span><strong>Course:</strong> {viewCandidate?.course?.id}</span>
                                  </div>
                                )}
                                <div className="detail-item">
                                  <i className="fas fa-calendar-alt"></i>
                                  <span><strong>Registration Date:</strong> {new Date().toLocaleDateString()}</span>
                                </div>
                                <div className="detail-item">
                                  <i className="fas fa-check-circle"></i>
                                  <span><strong>Status:</strong> <span className="text-success">Active</span></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="campaign-stats-card mb-4">
                            <div className="card">
                              <div className="card-header">
                                <h6><i className="fas fa-chart-bar me-2"></i>Campaign Statistics</h6>
                              </div>
                              <div className="card-body">
                                <div className="stat-item">
                                  <div className="stat-number">0</div>
                                  <div className="stat-label">Total Votes</div>
                                </div>
                                <div className="stat-item">
                                  <div className="stat-number">0%</div>
                                  <div className="stat-label">Vote Share</div>
                                </div>
                                <div className="stat-item">
                                  <div className="stat-number">0</div>
                                  <div className="stat-label">Endorsements</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="d-flex justify-content-between w-100">
                    {/* Admin Actions - Only for Admins */}
                    {(role === 'ADMIN' || role === 'SUPERADMIN') && (
                      <div className="modal-actions">
                        <button 
                          className="btn btn-outline-primary me-2"
                          onClick={() => {
                            setViewCandidate(null);
                            handleShowModal(viewCandidate);
                          }}
                        >
                          <i className="fas fa-edit me-2"></i>Edit
                        </button>
                        <button className="btn btn-outline-info me-2">
                          <i className="fas fa-share me-2"></i>Share
                        </button>
                      </div>
                    )}
                    <button className="btn btn-secondary" onClick={() => setViewCandidate(null)}>
                      <i className="fas fa-times me-2"></i>Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin/Superadmin view (full CRUD)
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
    <div className="candidates-management-container">
      {/* Unified Professional Header */}
      <div className="dashboard-header-pro">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title-pro">Manage Candidates</h1>
            <p className="dashboard-subtitle-pro">Add, edit, and view all election candidates.</p>
            
            {/* Party List Stats Cards - Uniform Design */}
            <div className="stats-grid mt-3">
              <div className="stat-card">
                <div className="stat-content">
                  <h3>{partyLists?.length || 0}</h3>
                  <p>Party Lists</p>
                </div>
                <div className="stat-icon blue">
                  <i className="fas fa-list-ul"></i>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-content">
                  <h3>{candidates?.length || 0}</h3>
                  <p>Total Candidates</p>
                </div>
                <div className="stat-icon green">
                  <i className="fas fa-users"></i>
                </div>
              </div>
            </div>
            
          </div>
          <div className="dashboard-header-actions">
            <button className="btn btn-outline-success me-2" onClick={() => handleShowPartyListModal()}>
              <i className="fas fa-plus me-1"></i>
              Add Party List
            </button>
            <button className="btn btn-custom-blue" onClick={() => handleShowModal()}>
              <i className="fas fa-user-plus me-1"></i>
              Add Candidate
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {successMessage}
          <div className="mt-2">
            {successMessage.includes('moved to the trash bin') && (
              <a href="/trash-bin?tab=candidates" className="btn btn-sm btn-outline-success me-2">
                <i className="fas fa-trash me-1"></i>
                Go to Trash Bin
              </a>
            )}
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

      <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: 300 }}
          placeholder="Search by name, department, course, or position..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      {/* Separate tables for each party list */}
      {Object.keys(groupedCandidates).length > 0 ? (
        Object.entries(groupedCandidates).map(([partyListName, group], groupIndex) => (
          <div key={partyListName} className="mb-4">
            {/* Party List Header */}
            <div className="party-list-table-header">
              <div className="party-list-info">
                <div className="party-list-logo-container">
                  {group.partyList?.logo ? (
                    <img 
                      src={group.partyList.logo} 
                      alt={`${partyListName} logo`}
                      className="party-list-logo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="party-list-logo-fallback"
                    style={{ 
                      display: group.partyList?.logo ? 'none' : 'flex',
                      backgroundColor: group.partyList?.color || '#6c757d'
                    }}
                  >
                    {partyListName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                  </div>
                </div>
                <h5 className="party-list-title">
                  {partyListName}
                  <span className="party-list-count">
                    ({group.candidates.length} candidate{group.candidates.length !== 1 ? 's' : ''})
                  </span>
                </h5>
              </div>
              <div className="party-list-actions">
                <button
                  className="btn btn-sm btn-outline-primary party-list-edit-btn"
                  onClick={() => handleEditPartyListFromHeader(group.partyList)}
                  title="Edit Party List"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </div>
            </div>
            
            {/* Separate table for this party list */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-header-custom">
                  <tr>
                    <th>#</th>
                    <th>Photo</th>
                    <th
                      className={sortField === 'name' ? 'sortable active-sort' : 'sortable'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSortField('name') || setSortOrder(sortField === 'name' && sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      Name {renderSortIcon('name')}
                    </th>
                    <th
                      className={sortField === 'positionName' ? 'sortable active-sort' : 'sortable'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSortField('positionName') || setSortOrder(sortField === 'positionName' && sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      Position {renderSortIcon('positionName')}
                    </th>
                    <th
                      className={sortField === 'departmentName' ? 'sortable active-sort' : 'sortable'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSortField('departmentName') || setSortOrder(sortField === 'departmentName' && sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      Department {renderSortIcon('departmentName')}
                    </th>
                    <th
                      className={sortField === 'courseName' ? 'sortable active-sort' : 'sortable'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSortField('courseName') || setSortOrder(sortField === 'courseName' && sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      Course {renderSortIcon('courseName')}
                    </th>
                    <th style={{ textAlign: 'center' }}>
                      <i className="fas fa-cogs me-1"></i>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.candidates.map((candidate, candidateIndex) => (
                    <tr key={candidate.id} className="candidate-row">
                      <td>{candidateIndex + 1}</td>
                      <td>
                        {candidate.photo && candidate.photo !== 'undefined' ? (
                          <img 
                            src={getCandidatePhotoUrl(candidate.photo)} 
                            alt={candidate.Candidate_Name}
                            className="candidate-table-photo"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : (
                          <div className="candidate-table-photo-placeholder">
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                      </td>
                      <td>{candidate.Candidate_Name}</td>
                      <td>{candidate.position?.Position_Title || '-'}</td>
                      <td>{candidate.department?.Department_Name || '-'}</td>
                      <td>{candidate.course?.Course_Name || '-'}</td>
                      <td>
                        <div className="candidate-actions">
                          <button 
                            className="btn btn-sm btn-outline-primary me-2 action-btn-icon"
                            onClick={() => handleShowModal(candidate)}
                            title="Edit Candidate"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger me-2 action-btn-icon"
                            onClick={() => openDeleteModal(candidate)}
                            title="Delete Candidate"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-info action-btn-icon"
                            onClick={() => setViewCandidate(candidate)}
                            title="View Candidate Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4">
          <p className="text-muted">No candidates found</p>
        </div>
      )}

      {/* Enhanced View Candidate Modal */}
      {viewCandidate && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '1000px', width: '90%' }}>
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-candidate-info">
                                      <div className="modal-candidate-photo-container">
                      {viewCandidate?.photo && viewCandidate.photo !== 'undefined' ? (
                        <img src={getCandidatePhotoUrl(viewCandidate.photo)} alt={viewCandidate.Candidate_Name} className="modal-candidate-photo" />
                      ) : (
                        <div className="modal-candidate-photo-placeholder">
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                    </div>
                  <div className="modal-candidate-details">
                    <h4 className="modal-candidate-name">{viewCandidate?.name}</h4>
                    <p className="modal-position">{viewCandidate?.position?.title || 'Position not specified'}</p>
                    <div className="candidate-status">
                      <span className="badge bg-success">
                        <i className="fas fa-check-circle me-1"></i>
                        Verified Candidate
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewCandidate(null)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Full-width content layout */}
                <div className="candidate-content-full">
                  {/* Platform & Vision Section */}
                  <div className="candidate-platform mb-4">
                    <div className="platform-header">
                      <i className="fas fa-bullhorn"></i>
                      <h5>Platform & Vision</h5>
                    </div>
                    <div className="platform-content">
                      {viewCandidate?.manifesto ? (
                        <div className="platform-text">
                          {viewCandidate.manifesto.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </div>
                      ) : (
                        <div className="no-platform">
                          <i className="fas fa-info-circle"></i>
                          <p>No platform information available yet.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Candidate Details Section - Now below the main content */}
                  <div className="candidate-details-section">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="candidate-details-card mb-4">
                          <div className="card">
                            <div className="card-header">
                              <h6><i className="fas fa-user-circle me-2"></i>Candidate Details</h6>
                            </div>
                            <div className="card-body">
                              <div className="detail-item">
                                <i className="fas fa-id-card"></i>
                                <span><strong>Position:</strong> {viewCandidate?.position?.title || 'Not specified'}</span>
                              </div>
                              <div className="detail-item">
                                <i className="fas fa-user"></i>
                                <span><strong>Name:</strong> {viewCandidate?.name}</span>
                              </div>
                              {(viewCandidate?.department?.name || viewCandidate?.course?.id) && (
                                <div className="detail-item">
                                  <i className="fas fa-university"></i>
                                  <span><strong>Department:</strong> {viewCandidate?.department?.name || 'Not specified'}</span>
                                </div>
                              )}
                              {viewCandidate?.course?.id && (
                                <div className="detail-item">
                                  <i className="fas fa-graduation-cap"></i>
                                  <span><strong>Course:</strong> {viewCandidate?.course?.id}</span>
                                </div>
                              )}
                              <div className="detail-item">
                                <i className="fas fa-calendar-alt"></i>
                                <span><strong>Registration Date:</strong> {new Date().toLocaleDateString()}</span>
                              </div>
                              <div className="detail-item">
                                <i className="fas fa-check-circle"></i>
                                <span><strong>Status:</strong> <span className="text-success">Active</span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="campaign-stats-card mb-4">
                          <div className="card">
                            <div className="card-header">
                              <h6><i className="fas fa-chart-bar me-2"></i>Campaign Statistics</h6>
                            </div>
                            <div className="card-body">
                              <div className="stat-item">
                                <div className="stat-number">0</div>
                                <div className="stat-label">Total Votes</div>
                              </div>
                              <div className="stat-item">
                                <div className="stat-number">0%</div>
                                <div className="stat-label">Vote Share</div>
                              </div>
                              <div className="stat-item">
                                <div className="stat-number">0</div>
                                <div className="stat-label">Endorsements</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex justify-content-between w-100">
                  <div className="modal-actions">
                    <button className="btn btn-outline-primary me-2" onClick={() => handleShowModal(viewCandidate)}>
                      <i className="fas fa-edit me-2"></i>Edit
                    </button>
                    <button className="btn btn-outline-info me-2">
                      <i className="fas fa-share me-2"></i>Share
                    </button>
                  </div>
                  <button className="btn btn-secondary" onClick={() => setViewCandidate(null)}>
                    <i className="fas fa-times me-2"></i>Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCandidate ? 'Edit Candidate' : 'Add Candidate'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Candidate_Name"
                      value={formData.Candidate_Name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="Candidate_Email"
                      value={formData.Candidate_Email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Student ID</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Candidate_StudentId"
                      value={formData.Candidate_StudentId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Position</label>
                    <select
                      className="form-select"
                      name="positionId"
                      value={formData.positionId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a position</option>
                      {positions.map(position => (
                        <option key={position.id} value={position.id}>
                          {position.Position_Title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Department <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={(e) => {
                        handleChange(e);
                        fetchCourses(e.target.value);
                      }}
                      required
                    >
                      <option value="">Select a department</option>
                      {departments.map(department => (
                        <option key={department.id} value={department.id}>
                          {department.Department_Name}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      Choose the department this candidate represents (required)
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Course <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleChange}
                      disabled={!formData.departmentId || loadingCourses}
                      required
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.Course_Code} - {course.Course_Name}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      {loadingCourses ? 'Loading courses...' : 
                       formData.departmentId 
                         ? 'Choose the course this candidate represents (required)'
                         : 'Select a department first to choose a course'}
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Photo (profile picture)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                    {photoPreview && (
                      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <img
                          src={photoPreview}
                          alt="Preview"
                          style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Party List <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      name="partyListId"
                      value={formData.partyListId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a party list (required)</option>
                      {partyLists && Array.isArray(partyLists) && partyLists.map(partyList => (
                        <option key={partyList.id} value={partyList.id}>
                          {partyList.name}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      Choose the political party or group this candidate represents
                    </small>
                    <div className="mt-2">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleShowPartyListModal()}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Create New Party List
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Manifesto (optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      name="manifesto"
                      value={formData.manifesto}
                      onChange={handleChange}
                      placeholder="Brief manifesto about the candidate"
                    ></textarea>
                  </div>
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
                    {editingCandidate ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && candidateToDelete && (
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
                    setCandidateToDelete(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger">
                  <strong>Warning:</strong> This action cannot be undone!
                </div>
                <p>Are you sure you want to delete this candidate?</p>
                <div className="candidate-delete-info">
                  <strong>Name:</strong> {candidateToDelete.name}<br />
                  <strong>Position:</strong> {candidateToDelete.position?.title || 'N/A'}<br />
                  <strong>Department:</strong> {candidateToDelete.department?.name || 'N/A'}<br />
                  <strong>Course:</strong> {candidateToDelete.course?.id || 'N/A'}
                </div>
                <p className="text-muted mt-2">
                  <small>
                    <i className="fas fa-info-circle me-1"></i>
                    The candidate will be moved to the trash and can be restored later.
                  </small>
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCandidateToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(candidateToDelete.id)}
                >
                  <i className="fas fa-trash me-1"></i>
                  Delete Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Party List Creation/Edit Modal */}
      {showPartyListCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPartyList ? 'Edit Party List' : 'Create Party List'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClosePartyListModal}
                ></button>
              </div>
              <form onSubmit={handlePartyListSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Party List Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={partyListFormData.name}
                      onChange={handlePartyListChange}
                      placeholder="Enter party list name (e.g., Progressive Party, Student Alliance)"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      name="description"
                      value={partyListFormData.description}
                      onChange={handlePartyListChange}
                      placeholder="Brief description of the party list's platform and goals"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Color</label>
                    <div className="input-group">
                      <input
                        type="color"
                        className="form-control form-control-color"
                        name="color"
                        value={partyListFormData.color}
                        onChange={handlePartyListChange}
                        title="Choose party list color"
                      />
                      <input
                        type="text"
                        className="form-control"
                        name="color"
                        value={partyListFormData.color}
                        onChange={handlePartyListChange}
                        placeholder="#007bff"
                      />
                    </div>
                    <small className="text-muted">
                      Choose a color to represent this party list
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Logo</label>
                    <div className="row">
                      <div className="col-md-6">
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handlePartyListLogoChange}
                        />
                        <small className="text-muted">
                          Upload a logo image (optional)
                        </small>
                      </div>
                      <div className="col-md-6">
                        <input
                          type="url"
                          className="form-control"
                          name="logo"
                          value={partyListFormData.logo}
                          onChange={handlePartyListChange}
                          placeholder="Or enter logo URL"
                        />
                        <small className="text-muted">
                          Or provide a logo URL
                        </small>
                      </div>
                    </div>
                    {partyListLogoPreview && (
                      <div className="mt-2">
                        <img 
                          src={partyListLogoPreview} 
                          alt="Logo preview" 
                          style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                          className="border rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClosePartyListModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    {editingPartyList ? 'Update Party List' : 'Create Party List'}
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

export default Candidates; 