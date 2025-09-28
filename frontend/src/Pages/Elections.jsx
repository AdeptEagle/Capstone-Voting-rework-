import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getElections, getPositions, getCandidates, createElection, updateElection, deleteElection, startElection, pauseElection, stopElection, resumeElection, endElection, getElectionPositions, createPosition, createCandidate, getDepartments, addPositionToElection, addCandidateToElection, hasActiveElections, getActiveElectionInfo, getElectionCandidates, getUnassignedCandidates, assignCandidateToElection, removeCandidateFromElection } from '../services/api';
import './Elections.css';
import Button from 'react-bootstrap/Button'; // Added missing import for Button

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingElection, setDeletingElection] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [editingElection, setEditingElection] = useState(null);
  const [updatingElection, setUpdatingElection] = useState(null);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'ended'
  const [activeElectionInfo, setActiveElectionInfo] = useState({ hasActive: false, activeCount: 0, activeElections: [] });
  const navigate = useNavigate();

  // Enhanced form state for creating elections with positions and candidates
  const [formData, setFormData] = useState({
    Election_Title: '',
    Election_Description: '',
    startDate: '',
    endDate: '',
    positionIds: [],
    // New fields for dynamic position/candidate creation
    newPositions: [],
    newCandidates: [],
    // Existing candidates selection
    selectedCandidateIds: []
  });

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [tempPositions, setTempPositions] = useState([]);
  const [tempCandidates, setTempCandidates] = useState([]);
  const [existingCandidates, setExistingCandidates] = useState([]);
  const [electionCandidates, setElectionCandidates] = useState([]);
  const [unassignedCandidates, setUnassignedCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchElectionsData();
  }, []);

  const fetchElectionsData = async () => {
    try {
      setLoading(true);
      const [elections, positions, departmentsData, activeInfo] = await Promise.all([
        getElections(),
        getPositions(),
        getDepartments(),
        getActiveElectionInfo()
      ]);

      console.log('Fetched elections:', elections); // Debug log
      setElections(elections || []);
      setPositions(positions || []);
      setDepartments(departmentsData || []);
      setActiveElectionInfo(activeInfo || { hasActive: false, activeCount: 0, activeElections: [] });
    } catch (error) {
      console.error('Error fetching elections data:', error);
      setError('Failed to load elections data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate dates before processing
      if (!formData.startDate || !formData.endDate) {
        setError('Please select both start and end dates');
        setLoading(false);
        return;
      }

      // Validate that dates are valid
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        setError('Please enter valid start and end dates');
        setLoading(false);
        return;
      }

      // Validate that end date is after start date
      if (endDate <= startDate) {
        setError('End date must be after start date');
        setLoading(false);
        return;
      }

      // Validate positions are selected
      const validationPositionIds = [
        ...formData.positionIds,
        ...tempPositions.filter(p => p.isNew).map(p => p.id)
      ];
      
      if (validationPositionIds.length === 0) {
        setError('At least one position must be selected or created');
        setLoading(false);
        return;
      }

      // Validate candidates are selected
      const validationCandidateIds = [
        ...formData.selectedCandidateIds,
        ...tempCandidates.filter(c => c.isNew).map(c => c.id)
      ];

      if (validationCandidateIds.length === 0) {
        setError('At least one candidate must be selected or created');
        setLoading(false);
        return;
      }

      // First, create any new positions
      const createdPositions = [];
      for (const position of tempPositions) {
        if (position.isNew) {
          try {
            // Validate required fields
            if (!position.id || !position.Position_Title) {
              throw new Error(`Position ${position.id || 'Unknown'} is missing required fields (ID and Title)`);
            }
            
            const newPosition = await createPosition({
              id: position.id,
              Position_Title: position.Position_Title,
              Position_Description: position.Position_Description || '',
              voteLimit: position.voteLimit,
              displayOrder: position.displayOrder
            });
            createdPositions.push(newPosition);
          } catch (error) {
            console.error('Error creating position:', error);
            // Use the specific error message from the backend if available
            const errorMessage = error.response?.data?.error || error.message || `Failed to create position: ${position.Position_Title}`;
            throw new Error(errorMessage);
          }
        }
      }

      // Then, create any new candidates
      for (const candidate of tempCandidates) {
        if (candidate.isNew) {
          try {
            const candidateData = new FormData();
            candidateData.append('id', candidate.id);
            candidateData.append('Candidate_Name', candidate.Candidate_Name);
            candidateData.append('Candidate_Email', candidate.Candidate_Email || '');
            candidateData.append('Candidate_StudentId', candidate.Candidate_StudentId || '');
            candidateData.append('positionId', candidate.positionId);
            candidateData.append('departmentId', candidate.departmentId || '');
            candidateData.append('courseId', candidate.courseId || ''); // Add required courseId
            candidateData.append('manifesto', candidate.manifesto || '');
            
            if (candidate.photoFile) {
              candidateData.append('photo', candidate.photoFile);
            }

            await createCandidate(candidateData);
          } catch (error) {
            console.error('Error creating candidate:', error);
            throw new Error(`Failed to create candidate: ${candidate.Candidate_Name}`);
          }
        }
      }

      // Create the election with only the basic fields (matching the DTO)
      const electionData = {
        Election_Title: formData.Election_Title,
        Election_Description: formData.Election_Description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      console.log('Creating election with data:', electionData);
      const createdElection = await createElection(electionData);
      
      // Now add positions to the election
      const allPositionIds = [
        ...formData.positionIds,
        ...createdPositions.map(p => p.id)
      ];

      // Add existing and new positions to the election
      for (const positionId of allPositionIds) {
        try {
          await addPositionToElection(createdElection.election.id, { positionId });
        } catch (error) {
          console.error(`Error adding position ${positionId} to election:`, error);
          // Continue with other positions even if one fails
        }
      }

      // Add candidates to the election
      for (const candidateId of formData.selectedCandidateIds) {
        try {
          await addCandidateToElection(createdElection.election.id, { candidateId });
        } catch (error) {
          console.error(`Error adding candidate ${candidateId} to election:`, error);
          // Continue with other candidates even if one fails
        }
      }
      
      setSuccess('Election created successfully with all positions and candidates!');
      setShowCreateModal(false);
      resetForm();
      await fetchElectionsData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating election:', error);
      setError(error.response?.data?.error || error.message || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  const handleEditElection = async (e) => {
    e.preventDefault();
    try {
      setUpdatingElection(editingElection.id);
      setError('');
      setSuccess('');

      // Validate dates before processing
      if (!formData.startDate || !formData.endDate) {
        setError('Please select both start and end dates');
        setUpdatingElection(null);
        return;
      }

      // Validate that dates are valid
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        setError('Please enter valid start and end dates');
        setUpdatingElection(null);
        return;
      }

      // Validate that end date is after start date
      if (endDate <= startDate) {
        setError('End date must be after start date');
        setUpdatingElection(null);
        return;
      }

      const electionData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: editingElection.status // Preserve the current status
      };

      console.log('Updating election with data:', electionData); // Debug log
      await updateElection(editingElection.id, electionData);
      
      setSuccess('Election updated successfully!');
      setShowEditModal(false);
      setEditingElection(null);
      resetForm();
      await fetchElectionsData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating election:', error);
      setError(error.response?.data?.error || 'Failed to update election');
    } finally {
      setUpdatingElection(null);
    }
  };

  const handleStartElection = async (electionId) => {
    try {
      setUpdatingElection(electionId);
      setError('');
      setSuccess('');

      const result = await startElection(electionId);
      
      setSuccess(result.message || 'Election started successfully!');
      await fetchElectionsData();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error starting election:', error);
      setError(error.response?.data?.error || 'Failed to start election');
    } finally {
      setUpdatingElection(null);
    }
  };

  const handlePauseElection = async (electionId) => {
    try {
      setUpdatingElection(electionId);
      setError('');
      setSuccess('');

      await pauseElection(electionId);
      
      setSuccess('Election paused successfully!');
      await fetchElectionsData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error pausing election:', error);
      setError(error.response?.data?.error || 'Failed to pause election');
    } finally {
      setUpdatingElection(null);
    }
  };

  const handleStopElection = async (electionId) => {
    try {
      setUpdatingElection(electionId);
      setError('');
      setSuccess('');

      await stopElection(electionId);
      
      setSuccess('Election stopped successfully!');
      await fetchElectionsData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error stopping election:', error);
      setError(error.response?.data?.error || 'Failed to stop election');
    } finally {
      setUpdatingElection(null);
    }
  };

  const handleResumeElection = async (electionId) => {
    try {
      setUpdatingElection(electionId);
      setError('');
      setSuccess('');

      await resumeElection(electionId);
      
      setSuccess('Election resumed successfully!');
      await fetchElectionsData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error resuming election:', error);
      setError(error.response?.data?.error || 'Failed to resume election');
    } finally {
      setUpdatingElection(null);
    }
  };

  const handleEndElection = async (electionId) => {
    try {
      setUpdatingElection(electionId);
      setError('');
      setSuccess('');

      await endElection(electionId);
      
      setSuccess('Election ended successfully and saved to history!');
      await fetchElectionsData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error ending election:', error);
      setError(error.response?.data?.error || 'Failed to end election');
    } finally {
      setUpdatingElection(null);
    }
  };

  const handleDeleteElection = async (electionId) => {
    const election = elections.find(e => e.id === electionId);
    setDeletingElection(election);
    setDeleteConfirmation('');
    setShowDeleteModal(true);
  };

  const confirmDeleteElection = async () => {
    if (!deletingElection) return;
    
           const electionTitle = deletingElection.Election_Title || 'Untitled Election';
    
    if (deleteConfirmation !== electionTitle) {
      setError('Confirmation text does not match the ballot name. Please type the exact ballot name to confirm deletion.');
      return;
    }

    try {
      setUpdatingElection(deletingElection.id);
      setError('');
      setSuccess('');

      await deleteElection(deletingElection.id);
      
      setSuccess(
        <div>
          Ballot "{electionTitle}" moved to trash successfully! 
          <Button 
            variant="link" 
            className="p-0 ms-2" 
            onClick={() => window.location.href = '/trash-bin?tab=elections'}
          >
            Go to Trash Bin
          </Button>
        </div>
      );
      await fetchElectionsData();
      
      setShowDeleteModal(false);
      setDeletingElection(null);
      setDeleteConfirmation('');
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error deleting election:', error);
      setError(error.response?.data?.error || 'Failed to delete election');
    } finally {
      setUpdatingElection(null);
    }
  };

  const cancelDeleteElection = () => {
    setShowDeleteModal(false);
    setDeletingElection(null);
    setDeleteConfirmation('');
    setError('');
  };

  const handleStatusChange = async (electionId, newStatus) => {
    try {
      setUpdatingElection(electionId);
      setError('');
      setSuccess('');

      const election = elections.find(e => e.id === electionId);
      if (!election) {
        setError('Election not found');
        return;
      }

      await updateElection(electionId, {
        title: election.Election_Title,
        description: election.Election_Description,
        startDate: election.startDate,
        endDate: election.endDate,
        status: newStatus
      });

      const statusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      setSuccess(`Election "${election.title || 'Untitled Election'}" has been ${statusText.toLowerCase()}`);
      
      await fetchElectionsData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating election status:', error);
      setError(error.response?.data?.error || 'Failed to update election status');
    } finally {
      setUpdatingElection(null);
    }
  };

  const handleFixStatus = async (electionId) => {
    try {
      setUpdatingElection(electionId);
      setError('');
      setSuccess('');

      const election = elections.find(e => e.id === electionId);
      if (!election) {
        setError('Election not found');
        return;
      }

      await updateElection(electionId, {
        title: election.Election_Title,
        description: election.Election_Description,
        startDate: election.startDate,
        endDate: election.endDate,
        status: 'draft'
      });

      setSuccess('Election status fixed! Set to Draft.');
      await fetchElectionsData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error fixing election status:', error);
      setError(error.response?.data?.error || 'Failed to fix election status');
    } finally {
      setUpdatingElection(null);
    }
  };

  const openEditModal = async (election) => {
    try {
      setEditingElection(election);
      setError(''); // Clear any previous errors
      setLoadingPositions(true);
      setLoadingCandidates(true);
      
      // Set initial form data while loading positions
      setFormData({
        title: election.Election_Title || '',
        description: election.Election_Description || '',
        startDate: election.startDate ? election.startDate.slice(0, 16) : '', // Format for datetime-local input
        endDate: election.endDate ? election.endDate.slice(0, 16) : '',
        positionIds: [] // Start with empty array
      });
      setShowEditModal(true);
      
      // Fetch the positions and candidates for this specific election
      const [electionPositions, electionCandidatesData, unassignedCandidatesData] = await Promise.all([
        getElectionPositions(election.id),
        getElectionCandidates(election.id),
        getUnassignedCandidates(election.id)
      ]);
      
      const positionIds = electionPositions.map(pos => pos.id);
      
      // Update form data with fetched positions
      setFormData(prev => ({
        ...prev,
        positionIds: positionIds
      }));
      
      // Set candidates data
      setElectionCandidates(electionCandidatesData || []);
      setUnassignedCandidates(unassignedCandidatesData || []);
    } catch (error) {
      console.error('Error fetching election data:', error);
      setError('Failed to load election data. Please try again.');
      // Don't close the modal, let user see the error
    } finally {
      setLoadingPositions(false);
      setLoadingCandidates(false);
    }
  };

  const openCreateModal = async () => {
    setEditingElection(null);
    resetForm();
    setShowCreateModal(true);
    // Fetch existing candidates for selection
    await fetchExistingCandidates();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      positionIds: [],
      // New fields for dynamic position/candidate creation
      newPositions: [],
      newCandidates: [],
      // Existing candidates selection
      selectedCandidateIds: []
    });
    setCurrentStep(1);
    setTempPositions([]);
    setTempCandidates([]);
    setExistingCandidates([]);
  };

  // Helper functions for multi-step form
  const addNewPosition = () => {
    const newPosition = {
      id: '',
      Position_Title: '',
      Position_Description: '',
      voteLimit: 1,
      displayOrder: tempPositions.length + 1,
      isNew: true,
      candidates: []
    };
    setTempPositions([...tempPositions, newPosition]);
  };

  const updateTempPosition = useCallback((index, field, value) => {
    setTempPositions(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  }, []);

  const removeTempPosition = (index) => {
    setTempPositions(tempPositions.filter((_, i) => i !== index));
    // Also remove associated candidates
    const positionId = tempPositions[index]?.id;
    if (positionId) {
      setTempCandidates(tempCandidates.filter(c => c.positionId !== positionId));
    }
  };

  // Candidate management functions for edit modal
  const handleAssignCandidate = async (candidateId) => {
    try {
      await assignCandidateToElection(editingElection.id, candidateId);
      
      // Refresh candidate data
      const [electionCandidatesData, unassignedCandidatesData] = await Promise.all([
        getElectionCandidates(editingElection.id),
        getUnassignedCandidates(editingElection.id)
      ]);
      
      setElectionCandidates(electionCandidatesData || []);
      setUnassignedCandidates(unassignedCandidatesData || []);
      
      setSuccess('Candidate assigned successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error assigning candidate:', error);
      setError('Failed to assign candidate. Please try again.');
    }
  };

  const handleRemoveCandidate = async (candidateId) => {
    try {
      await removeCandidateFromElection(editingElection.id, candidateId);
      
      // Refresh candidate data
      const [electionCandidatesData, unassignedCandidatesData] = await Promise.all([
        getElectionCandidates(editingElection.id),
        getUnassignedCandidates(editingElection.id)
      ]);
      
      setElectionCandidates(electionCandidatesData || []);
      setUnassignedCandidates(unassignedCandidatesData || []);
      
      setSuccess('Candidate removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error removing candidate:', error);
      setError('Failed to remove candidate. Please try again.');
    }
  };

  const addCandidateToPosition = (positionId) => {
    const newCandidate = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9),
      Candidate_Name: '',
      Candidate_Email: '',
      Candidate_StudentId: '',
      positionId: positionId,
      departmentId: '',
      courseId: '', // Add required courseId field
      manifesto: '',
      photoFile: null,
      isNew: true
    };
    setTempCandidates([...tempCandidates, newCandidate]);
  };

  const updateTempCandidate = useCallback((index, field, value) => {
    setTempCandidates(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  }, []);

  const removeTempCandidate = (index) => {
    setTempCandidates(tempCandidates.filter((_, i) => i !== index));
  };

  const handlePhotoChange = (candidateIndex, file) => {
    const updated = [...tempCandidates];
    updated[candidateIndex] = { ...updated[candidateIndex], photoFile: file };
    setTempCandidates(updated);
  };

  // Candidate selection functions
  const fetchExistingCandidates = async () => {
    try {
      setLoadingCandidates(true);
      const candidates = await getCandidates();
      setExistingCandidates(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError('Failed to load existing candidates');
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleCandidateSelection = (candidateId, isSelected) => {
    setFormData(prev => {
      const updated = { ...prev };
      if (isSelected) {
        if (!updated.selectedCandidateIds.includes(candidateId)) {
          updated.selectedCandidateIds = [...updated.selectedCandidateIds, candidateId];
        }
      } else {
        updated.selectedCandidateIds = updated.selectedCandidateIds.filter(id => id !== candidateId);
      }
      return updated;
    });
  };

  const addAllCandidates = () => {
    const filteredCandidates = getFilteredCandidates();
    const allCandidateIds = filteredCandidates.map(c => c.id);
    setFormData(prev => ({
      ...prev,
      selectedCandidateIds: allCandidateIds
    }));
  };

  const removeAllCandidates = () => {
    setFormData(prev => ({
      ...prev,
      selectedCandidateIds: []
    }));
  };

  const getCandidatesForPosition = (positionId) => {
    return existingCandidates.filter(c => c.positionId === positionId);
  };

  // Get candidates for selected positions only
  const getFilteredCandidates = () => {
    const selectedPositionIds = [
      ...formData.positionIds,
      ...tempPositions.map(p => p.id)
    ];
    
    if (selectedPositionIds.length === 0) {
      return [];
    }
    
    return existingCandidates.filter(candidate => 
      selectedPositionIds.includes(candidate.positionId)
    );
  };

  const nextStep = () => {
          if (currentStep === 1 && (!formData.Election_Title || !formData.startDate || !formData.endDate)) {
      setError('Please fill in all required fields');
      return;
    }
    if (currentStep === 2) {
      // Check if we have at least one position (existing or new)
      if (tempPositions.length === 0 && formData.positionIds.length === 0) {
        setError('Please add at least one position');
        return;
      }
      
      // Validate new positions
      for (const position of tempPositions) {
        if (!position.id || !position.Position_Title) {
          setError(`Position ${tempPositions.indexOf(position) + 1} is missing required fields (ID and Title)`);
          return;
        }
        
        // Check for duplicate IDs within new positions (case-insensitive)
        const duplicateId = tempPositions.filter(p => p.id.toLowerCase() === position.id.toLowerCase()).length > 1;
        if (duplicateId) {
          setError(`Duplicate Position ID: "${position.id}". Each position must have a unique ID.`);
          return;
        }
        
                // Check for duplicate names within new positions (case-insensitive)
        const duplicateName = tempPositions.filter(p => p.Position_Title.toLowerCase() === position.Position_Title.toLowerCase()).length > 1;
        if (duplicateName) {
          setError(`Duplicate Position Title: "${position.Position_Title}". Each position must have a unique title.`);
          return;
        }
        
        // Check if ID conflicts with existing positions (case-insensitive)
        const existingPosition = positions.find(p => p.id.toLowerCase() === position.id.toLowerCase());
        if (existingPosition) {
          setError(`Position ID "${position.id}" already exists. Please use a different ID.`);
          return;
        }
        
                // Check if name conflicts with existing positions (case-insensitive)
        const existingPositionName = positions.find(p => p.Position_Title.toLowerCase() === position.Position_Title.toLowerCase());
        if (existingPositionName) {
          setError(`Position title "${position.Position_Title}" already exists. Please use a different title.`);
          return;
        }
      }
    }
    
    if (currentStep === 3) {
      // Check if we have at least some candidates (existing or new)
      const totalCandidates = formData.selectedCandidateIds.length + tempCandidates.length;
      if (totalCandidates === 0) {
        setError('Please select at least one candidate or add new candidates');
        return;
      }
      
      // Validate new candidates have required fields
      for (const candidate of tempCandidates) {
        if (!candidate.Candidate_Name || !candidate.departmentId || !candidate.courseId) {
          setError(`Candidate ${candidate.Candidate_Name || 'Unknown'} is missing required fields (Name, Department, and Course)`);
          return;
        }
      }
    }
    
    setCurrentStep(currentStep + 1);
    setError('');
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const getStatusColor = (status) => {
    // If status is null/undefined, treat as 'draft'
    const electionStatus = status || 'draft';
    switch (electionStatus) {
      case 'draft': return 'warning';
      case 'active': return 'success';
      case 'paused': return 'info';
      case 'stopped': return 'danger';
      case 'ended': return 'secondary';
      default: return 'warning'; // Default to warning for draft
    }
  };

  const getStatusIcon = (status) => {
    // If status is null/undefined, treat as 'draft'
    const electionStatus = status || 'draft';
    switch (electionStatus) {
      case 'draft': return 'fas fa-edit';
      case 'active': return 'fas fa-play-circle';
      case 'paused': return 'fas fa-pause-circle';
      case 'stopped': return 'fas fa-stop-circle';
      case 'ended': return 'fas fa-check-circle';
      default: return 'fas fa-edit'; // Default to edit for draft
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not set';
    try {
      return new Date(dateTime).toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Helper functions to categorize elections
  const getActiveElections = () => {
    return elections.filter(election => {
      const status = election.status || 'draft';
      return status !== 'ended';
    });
  };

  const getEndedElections = () => {
    return elections.filter(election => {
      const status = election.status || 'draft';
      return status === 'ended';
    });
  };

  const renderElectionActions = (election) => {
    const { status } = election;
    const actions = [];

    // Check if this election can be started (grayed out if another election is active)
    const canStartElection = !activeElectionInfo.hasActive || 
      activeElectionInfo.activeElections.some(active => active.id === election.id);

    // Add fix status button for invalid statuses
    if (!['draft', 'active', 'paused', 'stopped', 'ended'].includes(status)) {
      actions.push(
        <button
          key="fix"
          className="btn btn-warning btn-sm me-2"
          onClick={() => handleFixStatus(election.id)}
          disabled={updatingElection === election.id}
        >
          {updatingElection === election.id ? (
            <span className="loading-text">Loading...</span>
          ) : (
            <i className="fas fa-wrench me-1"></i>
          )}
          Fix Status (Set to Draft)
        </button>
      );
    }
    
    switch (status) {
      case 'draft':
        actions.push(
          <button
            key="start"
            className={`btn btn-sm me-2 ${canStartElection ? 'btn-success' : 'btn-secondary'}`}
            onClick={() => handleStartElection(election.id)}
            disabled={updatingElection === election.id || !canStartElection}
            title={!canStartElection ? 'Another ballot is currently active. End or pause the active ballot first.' : 'Start this ballot'}
          >
            {updatingElection === election.id ? (
              <span className="loading-text">Loading...</span>
            ) : (
              <i className="fas fa-play me-1"></i>
            )}
            Start Ballot
          </button>
        );
        break;
        
      case 'active':
        actions.push(
          <button
            key="pause"
            className="btn btn-warning btn-sm me-2"
            onClick={() => handlePauseElection(election.id)}
            disabled={updatingElection === election.id}
          >
            {updatingElection === election.id ? (
              <span className="loading-text">Loading...</span>
            ) : (
              <i className="fas fa-pause me-1"></i>
            )}
            Pause Ballot
          </button>,
          <button
            key="stop"
            className="btn btn-danger btn-sm me-2"
            onClick={() => handleStopElection(election.id)}
            disabled={updatingElection === election.id}
          >
            {updatingElection === election.id ? (
              <span className="loading-text">Loading...</span>
            ) : (
              <i className="fas fa-stop me-1"></i>
            )}
            Stop Ballot
          </button>
        );
        break;
        
      case 'paused':
        actions.push(
          <button
            key="resume"
            className="btn btn-success btn-sm me-2"
            onClick={() => handleResumeElection(election.id)}
            disabled={updatingElection === election.id}
          >
            {updatingElection === election.id ? (
              <span className="loading-text">Loading...</span>
            ) : (
              <i className="fas fa-play me-1"></i>
            )}
            Resume Ballot
          </button>,
          <button
            key="stop"
            className="btn btn-danger btn-sm me-2"
            onClick={() => handleStopElection(election.id)}
            disabled={updatingElection === election.id}
          >
            {updatingElection === election.id ? (
              <span className="loading-text">Loading...</span>
            ) : (
              <i className="fas fa-stop me-1"></i>
            )}
            Stop Ballot
          </button>
        );
        break;
        
      case 'stopped':
        actions.push(
          <button
            key="resume"
            className="btn btn-success btn-sm me-2"
            onClick={() => handleResumeElection(election.id)}
            disabled={updatingElection === election.id}
          >
            {updatingElection === election.id ? (
              <span className="loading-text">Loading...</span>
            ) : (
              <i className="fas fa-play me-1"></i>
            )}
            Resume Ballot
          </button>,
          <button
            key="end"
            className="btn btn-secondary btn-sm me-2"
            onClick={() => handleEndElection(election.id)}
            disabled={updatingElection === election.id}
          >
            {updatingElection === election.id ? (
              <span className="loading-text">Loading...</span>
            ) : (
              <i className="fas fa-check me-1"></i>
            )}
            End Ballot (Save to History)
          </button>
        );
        break;
        
      case 'ended':
        actions.push(
          <span key="ended" className="text-muted">
            <i className="fas fa-check-circle me-1"></i>
            Election completed and saved to history
          </span>
        );
        break;
        
      default:
        actions.push(
          <span key="unknown" className="text-muted">
            <i className="fas fa-question-circle me-1"></i>
            Unknown status
          </span>
        );
        break;
    }
    
    return actions;
  };

  if (loading) {
    return (
      <div className="elections-loading">
        <div className="loading-text">Loading...</div>
        <p className="mt-2">Loading elections...</p>
      </div>
    );
  }

  return (
    <div className="elections-container">
      {/* Unified Professional Header */}
      <div className="dashboard-header-pro">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title-pro">Election Management</h1>
            <p className="dashboard-subtitle-pro">Create complete ballots with positions and candidates in one streamlined process</p>
          </div>
          <div className="dashboard-header-actions">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin/election-history')}
            >
              <i className="fas fa-history me-2"></i>
              View History
            </button>
            <button
              className="btn btn-outline-info ms-2"
              onClick={() => {
                console.log('🧪 [Elections] Test WebSocket button clicked');
                if (elections.length > 0) {
                  const election = elections[0];
                  console.log('🧪 [Elections] Testing with election:', election.id);
                  // You can add a test WebSocket emit here if needed
                } else {
                  console.log('🧪 [Elections] No elections available for testing');
                }
              }}
              title="Test WebSocket Election Updates"
            >
              <i className="fas fa-wifi me-2"></i>
              Test WebSocket
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Admin Guide for Single Election Policy */}
      {(() => {
        const activeElections = getActiveElections();
        const currentlyActive = activeElections.filter(e => e.status === 'active');
        
        if (currentlyActive.length > 0) {
          return (
                         <div className="alert alert-info mb-3">
               <div className="d-flex align-items-start">
                 <i className="fas fa-info-circle me-2 mt-1"></i>
                 <div>
                   <div className="mb-1">
                     <strong>Active Election Policy:</strong> Only one election can be active at a time.
                   </div>
                   {currentlyActive.length > 0 && (
                     <div className="mb-1">
                       <strong>Currently Active:</strong> {currentlyActive.map(e => e.title).join(', ')}
                     </div>
                   )}
                   <small className="text-muted">
                     Starting a new election will automatically pause any currently active elections.
                   </small>
                 </div>
               </div>
             </div>
          );
        }
        return null;
      })()}

      {/* Tabbed Elections Interface */}
      <div className="elections-tabs-container">
        <ul className="nav nav-tabs elections-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
              type="button"
              role="tab"
            >
              <i className="fas fa-play-circle me-2"></i>
              Active Ballots
              <span className="badge bg-primary ms-2">{getActiveElections().length}</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'ended' ? 'active' : ''}`}
              onClick={() => setActiveTab('ended')}
              type="button"
              role="tab"
            >
              <i className="fas fa-check-circle me-2"></i>
              Ended/Saved Ballots
              <span className="badge bg-secondary ms-2">{getEndedElections().length}</span>
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Active Ballots Tab */}
          <div className={`tab-pane fade ${activeTab === 'active' ? 'show active' : ''}`} role="tabpanel">
            <div className="elections-list">
              {getActiveElections().length > 0 ? (
                getActiveElections().map((election) => (
                  <div key={election.id} className={`election-card ${election.status === 'active' ? 'active-election' : ''}`}>
                    <div className="election-header">
                      <div className="election-title">
                        <h3>{election.Election_Title || 'Untitled Election'}</h3>
                        <span className={`status-badge badge bg-${getStatusColor(election.status)}`}>
                          <i className={`${getStatusIcon(election.status)} me-1`}></i>
                          {(election.status || 'pending').charAt(0).toUpperCase() + (election.status || 'pending').slice(1)}
                          {/* Debug: Show raw status */}
                          <small className="ms-1">({election.status || 'null'})</small>
                        </span>
                        {election.status === 'active' && (
                          <span className="badge bg-success ms-2">
                            <i className="fas fa-star me-1"></i>
                            Currently Active
                          </span>
                        )}
                      </div>
                      <div className="election-meta">
                        <small className="text-muted">
                          Created by {election.admin?.Admin_Username || 'Unknown'}
                        </small>
                      </div>
                    </div>

                    <div className="election-content">
                      <p className="election-description">{election.Election_Description || 'No description available'}</p>
                      
                      <div className="election-details">
                        <div className="detail-row">
                          <span className="detail-label">Start Time:</span>
                          <span className="detail-value">{election.startDate ? formatDateTime(election.startDate) : 'Not set'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">End Time:</span>
                          <span className="detail-value">{election.endDate ? formatDateTime(election.endDate) : 'Not set'}</span>
                        </div>
                        {election.positionCount > 0 && (
                          <div className="detail-row">
                            <span className="detail-label">Positions:</span>
                            <span className="detail-value">{election.positionCount} position{election.positionCount !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>

                      <div className="election-actions">
                        <div className="status-actions">
                          {renderElectionActions(election)}
                          {renderElectionActions(election).length === 0 && (
                            <span className="text-muted">
                              <i className="fas fa-info-circle me-1"></i>
                              No actions available for status: {election.status || 'pending'}
                            </span>
                          )}
                        </div>
                        
                        <div className="management-actions">
                          {election.status !== 'ended' && (
                            <>
                              <button
                                className="btn btn-outline-primary btn-sm me-2"
                                onClick={() => openEditModal(election)}
                                disabled={updatingElection === election.id}
                              >
                                <i className="fas fa-edit me-1"></i>
                                Edit
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteElection(election.id)}
                                disabled={updatingElection === election.id}
                              >
                                {updatingElection === election.id ? (
                                  <span className="loading-text">Loading...</span>
                                ) : (
                                  <i className="fas fa-trash me-1"></i>
                                )}
                                Delete
                              </button>
                            </>
                          )}
                          {election.status === 'ended' && (
                            <div className="d-flex align-items-center">
                              <span className="text-success me-3">
                                <i className="fas fa-check-circle me-1"></i>
                                Completed
                              </span>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate('/admin/election-history')}
                              >
                                <i className="fas fa-history me-1"></i>
                                View History
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-elections">
                  <i className="fas fa-vote-yea"></i>
                  <h3>No Active Elections Found</h3>
                  <p>Create your first election to get started</p>
                  <button
                    className="btn btn-primary"
                    onClick={openCreateModal}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Create Ballot with Positions & Candidates
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Ended Ballots Tab */}
          <div className={`tab-pane fade ${activeTab === 'ended' ? 'show active' : ''}`} role="tabpanel">
            <div className="elections-list">
              {getEndedElections().length > 0 ? (
                getEndedElections().map((election) => (
                  <div key={election.id} className="election-card ended-election">
                    <div className="election-header">
                      <div className="election-title">
                        <h3>{election.Election_Title || 'Untitled Election'}</h3>
                        <span className={`status-badge badge bg-${getStatusColor(election.status)}`}>
                          <i className={`${getStatusIcon(election.status)} me-1`}></i>
                          {(election.status || 'ended').charAt(0).toUpperCase() + (election.status || 'ended').slice(1)}
                        </span>
                      </div>
                      <div className="election-meta">
                        <small className="text-muted">
                          Created by {election.admin?.Admin_Username || 'Unknown'}
                        </small>
                      </div>
                    </div>

                    <div className="election-content">
                      <p className="election-description">{election.Election_Description || 'No description available'}</p>
                      
                      <div className="election-dates">
                        <div className="date-item">
                          <i className="fas fa-calendar-plus me-2"></i>
                          <strong>Start:</strong> {formatDateTime(election.startDate)}
                        </div>
                        <div className="date-item">
                          <i className="fas fa-calendar-check me-2"></i>
                          <strong>End:</strong> {formatDateTime(election.endDate)}
                        </div>
                      </div>

                      <div className="election-stats">
                        <div className="stat-item">
                          <i className="fas fa-users me-2"></i>
                          <strong>Positions:</strong> {election.positions?.length || 0}
                        </div>
                        <div className="stat-item">
                          <i className="fas fa-user-tie me-2"></i>
                          <strong>Candidates:</strong> {election.candidates?.length || 0}
                        </div>
                      </div>
                    </div>

                    <div className="election-actions">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate('/admin/election-history')}
                      >
                        <i className="fas fa-history me-1"></i>
                        View Results
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-elections">
                  <i className="fas fa-archive"></i>
                  <h3>No Ended Elections Found</h3>
                  <p>Completed elections will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Create Election Modal with Multi-Step Form */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Create New Election - Step {currentStep} of 3
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              
              {error && (
                <div className="alert alert-danger m-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

                <div className="modal-body">
                {/* Step 1: Basic Election Info */}
                {currentStep === 1 && (
                  <div>
                  <div className="mb-3">
                      <label className="form-label">Election Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.Election_Title}
                      onChange={(e) => setFormData({...formData, Election_Title: e.target.value})}
                        placeholder="e.g., Student Council Election 2024"
                      required
                    />
                  </div>
                  <div className="mb-3">
                      <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.Election_Description}
                      onChange={(e) => setFormData({...formData, Election_Description: e.target.value})}
                        placeholder="Describe the purpose and scope of this election..."
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                          <label className="form-label">Start Time *</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                          <label className="form-label">End Time *</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  </div>
                )}

                {/* Step 2: Positions Setup */}
                {currentStep === 2 && (
                  <div>
                    <div className="mb-4">
                      <h6 className="mb-3">
                        <i className="fas fa-list me-2"></i>
                        Select Existing Positions
                      </h6>
                    <div className="position-checkboxes">
                      {positions.length > 0 ? (
                        positions.map(position => (
                          <div key={position.id} className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`create-position-${position.id}`}
                              checked={formData.positionIds.includes(position.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    positionIds: [...formData.positionIds, position.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    positionIds: formData.positionIds.filter(id => id !== position.id)
                                  });
                                }
                              }}
                            />
                                                          <label className="form-check-label" htmlFor={`create-position-${position.id}`}>
                                {position.Position_Title} (Vote Limit: {position.voteLimit})
                            </label>
                          </div>
                        ))
                      ) : (
                          <p className="text-muted">No existing positions available.</p>
                      )}
                    </div>
                    </div>


                  </div>
                )}

                {/* Step 3: Candidates Setup */}
                {currentStep === 3 && (
                  <div>
                    {/* Existing Candidates Selection */}
                    <div className="mb-4">
                      <div className="candidate-selection-header">
                        <div className="header-content">
                          <div className="header-title">
                            <i className="fas fa-users"></i>
                            <span className="title-text">Select Existing Candidates</span>
                  </div>
                          <div className="header-actions">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success action-btn"
                              onClick={addAllCandidates}
                              disabled={loadingCandidates || getFilteredCandidates().length === 0}
                            >
                              <i className="fas fa-check-double"></i>
                              <span>Add All</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger action-btn"
                              onClick={removeAllCandidates}
                              disabled={formData.selectedCandidateIds.length === 0}
                            >
                              <i className="fas fa-times"></i>
                              <span>Remove All</span>
                            </button>
                </div>
                        </div>
                        {getFilteredCandidates().length > 0 && (
                          <div className="header-subtitle">
                            <span className="candidate-count">
                              <i className="fas fa-info-circle me-1"></i>
                              {getFilteredCandidates().length} candidates available for selected positions
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {loadingCandidates ? (
                        <div className="text-center py-3">
                          <div className="loading-text">Loading...</div>
                          <span className="text-muted">Loading existing candidates...</span>
                        </div>
                      ) : getFilteredCandidates().length > 0 ? (
                        <div>
                          {/* Group candidates by position */}
                          {(() => {
                            const candidatesByPosition = {};
                            getFilteredCandidates().forEach(candidate => {
                              if (!candidatesByPosition[candidate.positionId]) {
                                candidatesByPosition[candidate.positionId] = {
                                  positionName: candidate.position?.Position_Title || 'Unknown Position',
                                  candidates: []
                                };
                              }
                              candidatesByPosition[candidate.positionId].candidates.push(candidate);
                            });

                            return Object.entries(candidatesByPosition).map(([positionId, positionData]) => (
                              <div key={positionId} className="mb-4">
                                <div className="position-header mb-3">
                                  <h6 className="text-primary mb-2">
                                    <i className="fas fa-user-tie me-2"></i>
                                    {positionData.positionName}
                                  </h6>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">
                                      {positionData.candidates.length} candidate{positionData.candidates.length !== 1 ? 's' : ''} available
                                    </span>
                                    <div className="position-actions">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-success me-2"
                                        onClick={() => {
                                          positionData.candidates.forEach(candidate => {
                                            if (!formData.selectedCandidateIds.includes(candidate.id)) {
                                              handleCandidateSelection(candidate.id, true);
                                            }
                                          });
                                        }}
                                      >
                                        <i className="fas fa-check-double me-1"></i>
                                        Add All
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => {
                                          positionData.candidates.forEach(candidate => {
                                            if (formData.selectedCandidateIds.includes(candidate.id)) {
                                              handleCandidateSelection(candidate.id, false);
                                            }
                                          });
                                        }}
                                      >
                                        <i className="fas fa-times me-1"></i>
                                        Remove All
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="candidate-selection-grid">
                                  {positionData.candidates.map(candidate => (
                                    <div key={candidate.id} className={`candidate-selection-card ${formData.selectedCandidateIds.includes(candidate.id) ? 'selected' : ''}`}>
                                      <div className="form-check">
                                        <input
                                          type="checkbox"
                                          className="form-check-input"
                                          id={`candidate-${candidate.id}`}
                                          checked={formData.selectedCandidateIds.includes(candidate.id)}
                                          onChange={(e) => handleCandidateSelection(candidate.id, e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor={`candidate-${candidate.id}`}>
                                          <div className="candidate-card-header">
                                            <div className="candidate-photo-container">
                                              {candidate.photoUrl && candidate.photoUrl.trim() !== '' ? (
                                                <img 
                                                  src={candidate.photoUrl} 
                                                  alt={candidate.Candidate_Name}
                                                  className="candidate-photo"
                                                  onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                  }}
                                                  onLoad={(e) => {
                                                    // Ensure image fits properly
                                                    e.target.style.maxWidth = '100%';
                                                    e.target.style.maxHeight = '100%';
                                                    e.target.style.objectFit = 'cover';
                                                    e.target.style.objectPosition = 'center';
                                                  }}
                                                />
                                              ) : null}
                                              <div className="candidate-photo-placeholder" style={{ display: candidate.photoUrl && candidate.photoUrl.trim() !== '' ? 'none' : 'flex' }}>
                                                <i className="fas fa-user"></i>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="candidate-card-body">
                                            <div className="candidate-info">
                                              <div className="candidate-name">
                                                {candidate.Candidate_Name}
                                              </div>
                                              <div className="candidate-position">
                                                {candidate.position?.title || 'Unknown Position'}
                                              </div>
                                            </div>
                                          </div>
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          <i className="fas fa-info-circle me-2"></i>
                          {existingCandidates.length === 0 ? 
                            'No existing candidates available. You can add new candidates below.' :
                            'No candidates available for the selected positions. Please select different positions or add new candidates below.'
                          }
                        </div>
                      )}
                    </div>

                    {/* New Candidates for New Positions */}
                    {tempPositions.length > 0 && (
                      <div className="mb-4">
                        <h6 className="mb-3">
                          <i className="fas fa-plus me-2"></i>
                          Add New Candidates for New Positions
                        </h6>
                        
                        {tempPositions.map((position, posIndex) => (
                          <div key={`temp-position-${posIndex}`} className="card mb-4">
                            <div className="card-header">
                              <h6 className="mb-0">
                                <i className="fas fa-user-tie me-2"></i>
                                {position.Position_Title || `Position ${posIndex + 1}`}
                              </h6>
                            </div>
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-muted">Candidates for this position</span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => addCandidateToPosition(position.id)}
                                >
                                  <i className="fas fa-plus me-1"></i>
                                  Add Candidate
                                </button>
                              </div>
                              
                              {tempCandidates
                                .filter(candidate => candidate.positionId === position.id)
                                .map((candidate, candidateIndex) => {
                                  const globalCandidateIndex = tempCandidates.findIndex(c => c.id === candidate.id);
                                  return (
                                    <div key={`temp-candidate-${globalCandidateIndex}`} className="card mb-3">
                                      <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                          <h6 className="card-title mb-0">Candidate {candidateIndex + 1}</h6>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removeTempCandidate(globalCandidateIndex)}
                                          >
                                            <i className="fas fa-trash"></i>
                                          </button>
                                        </div>
                                        <div className="row">
                                          <div className="col-md-6">
                                            <div className="mb-3">
                                              <label className="form-label">Candidate Name *</label>
                                              <input
                                                type="text"
                                                className="form-control"
                                                value={candidate.Candidate_Name}
                                                onChange={(e) => updateTempCandidate(globalCandidateIndex, 'Candidate_Name', e.target.value)}
                                                placeholder="Enter candidate name"
                                                required
                                              />
                                            </div>
                                          </div>
                                          <div className="col-md-6">
                                            <div className="mb-3">
                                              <label className="form-label">Department/Group</label>
                                              <select
                                                className="form-select"
                                                value={candidate.departmentId}
                                                onChange={(e) => updateTempCandidate(globalCandidateIndex, 'departmentId', e.target.value)}
                                              >
                                                <option value="">Select a department</option>
                                                {departments.map(department => (
                                                  <option key={department.id} value={department.id}>
                                                    {department.Department_Name}
                                                  </option>
                                                ))}
                                              </select>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="row">
                                          <div className="col-md-6">
                                            <div className="mb-3">
                                              <label className="form-label">Photo (Optional)</label>
                                              <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={(e) => handlePhotoChange(globalCandidateIndex, e.target.files[0])}
                                              />
                                            </div>
                                          </div>
                                          <div className="col-md-6">
                                            <div className="mb-3">
                                              <label className="form-label">Course</label>
                                              <select
                                                className="form-select"
                                                value={candidate.courseId}
                                                onChange={(e) => updateTempCandidate(globalCandidateIndex, 'courseId', e.target.value)}
                                              >
                                                <option value="">Select a course</option>
                                                {departments.map(department => 
                                                  department.courses?.map(course => (
                                                    <option key={course.id} value={course.id}>
                                                      {course.Course_Name}
                                                    </option>
                                                  ))
                                                ).flat().filter(Boolean)}
                                              </select>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="mb-3">
                                          <label className="form-label">Description/Platform</label>
                                          <textarea
                                            className="form-control"
                                            rows="3"
                                            value={candidate.description}
                                            onChange={(e) => updateTempCandidate(globalCandidateIndex, 'description', e.target.value)}
                                            placeholder="Describe the candidate's platform, qualifications, or vision..."
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              
                              {tempCandidates.filter(c => c.positionId === position.id).length === 0 && (
                                <div className="text-center py-3">
                                  <p className="text-muted mb-2">No candidates added yet</p>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => addCandidateToPosition(position.id)}
                                  >
                                    <i className="fas fa-plus me-1"></i>
                                    Add First Candidate
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

                <div className="modal-footer">
                <div className="d-flex justify-content-between w-100">
                  <div>
                    {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                        onClick={prevStep}
                      >
                        <i className="fas fa-arrow-left me-1"></i>
                        Previous
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                    
                    {currentStep < 3 ? (
                  <button
                        type="button"
                    className="btn btn-primary"
                        onClick={nextStep}
                      >
                        Next
                        <i className="fas fa-arrow-right ms-1"></i>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn btn-success"
                        onClick={handleCreateElection}
                        disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-text">Loading...</span>
                    ) : (
                          <i className="fas fa-check me-1"></i>
                    )}
                    Create Election
                  </button>
                    )}
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Election Modal */}
      {showEditModal && editingElection && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Election</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingElection(null);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleEditElection}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Election Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.Election_Title}
                      onChange={(e) => setFormData({...formData, Election_Title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.Election_Description}
                      onChange={(e) => setFormData({...formData, Election_Description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Start Time</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">End Time</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Positions to Include</label>
                    {loadingPositions ? (
                      <div className="text-center py-3">
                        <div className="loading-text">Loading...</div>
                        <span className="text-muted">Loading election positions...</span>
                      </div>
                    ) : (
                      <div className="position-checkboxes">
                        {positions.length > 0 ? (
                          positions.map(position => (
                            <div key={position.id} className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`edit-position-${position.id}`}
                                checked={formData.positionIds.includes(position.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      positionIds: [...formData.positionIds, position.id]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      positionIds: formData.positionIds.filter(id => id !== position.id)
                                    });
                                  }
                                }}
                              />
                              <label className="form-check-label" htmlFor={`edit-position-${position.id}`}>
                                {position.Position_Title}
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted">No positions available. Please create positions first.</p>
                        )}
                      </div>
                    )}
                    {!loadingPositions && formData.positionIds.length === 0 && (
                      <small className="text-danger">Please select at least one position</small>
                    )}
                  </div>

                  {/* Candidate Management Section */}
                  <div className="mb-3">
                    <label className="form-label">Candidates Management</label>
                    {loadingCandidates ? (
                      <div className="text-center py-3">
                        <div className="loading-text">Loading...</div>
                        <span className="text-muted">Loading candidates...</span>
                      </div>
                    ) : (
                      <div className="candidate-management">
                        {/* Assigned Candidates */}
                        <div className="mb-3">
                          <h6 className="text-success">
                            <i className="fas fa-check-circle me-2"></i>
                            Assigned Candidates ({electionCandidates.length})
                          </h6>
                          {electionCandidates.length > 0 ? (
                            <div className="assigned-candidates-list">
                              {electionCandidates.map(candidate => (
                                <div key={candidate.id} className="candidate-item d-flex justify-content-between align-items-center p-2 border rounded mb-2">
                                  <div>
                                    <strong>{candidate.Candidate_Name}</strong>
                                    <br />
                                    <small className="text-muted">
                                      {candidate.positionName} • {candidate.Candidate_StudentId}
                                    </small>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleRemoveCandidate(candidate.id)}
                                    title="Remove from election"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted">No candidates assigned to this election.</p>
                          )}
                        </div>

                        {/* Unassigned Candidates */}
                        <div className="mb-3">
                          <h6 className="text-warning">
                            <i className="fas fa-users me-2"></i>
                            Available Candidates ({unassignedCandidates.length})
                          </h6>
                          {unassignedCandidates.length > 0 ? (
                            <div className="unassigned-candidates-list">
                              {unassignedCandidates.map(candidate => (
                                <div key={candidate.id} className="candidate-item d-flex justify-content-between align-items-center p-2 border rounded mb-2">
                                  <div>
                                    <strong>{candidate.Candidate_Name}</strong>
                                    <br />
                                    <small className="text-muted">
                                      {candidate.positionName} • {candidate.Candidate_StudentId}
                                    </small>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleAssignCandidate(candidate.id)}
                                    title="Add to election"
                                  >
                                    <i className="fas fa-plus"></i>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted">No available candidates to assign.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingElection(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updatingElection === editingElection.id || formData.positionIds.length === 0 || loadingPositions}
                  >
                    {updatingElection === editingElection.id ? (
                      <span className="loading-text">Loading...</span>
                    ) : (
                      <i className="fas fa-save me-1"></i>
                    )}
                    Update Election
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingElection && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <i className="fas fa-trash me-2"></i>
                  Move Ballot to Trash
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelDeleteElection}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <h6 className="alert-heading">
                    <i className="fas fa-info-circle me-2"></i>
                    Move to Trash Bin
                  </h6>
                  <p className="mb-0">
                    You are about to move the ballot <strong>"{deletingElection.Election_Title}"</strong> to the trash bin.
                  </p>
                </div>
                
                <p>The ballot will be moved to the trash bin where:</p>
                <ul className="text-muted">
                  <li>All election data will be preserved</li>
                  <li>All votes cast by voters will be kept</li>
                  <li>All candidate assignments will be maintained</li>
                  <li>All position assignments will be retained</li>
                  <li>You can restore it later or permanently delete it</li>
                </ul>
                
                <div className="mb-3">
                  <label className="form-label">
                    Type <strong>"{deletingElection.Election_Title}"</strong> to confirm deletion:
                  </label>
                  <input
                    type="text"
                    className={`form-control ${deleteConfirmation && deleteConfirmation !== deletingElection.Election_Title ? 'is-invalid' : ''}`}
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder={`Type "${deletingElection.Election_Title}" to confirm`}
                    autoFocus
                  />
                                     {deleteConfirmation && deleteConfirmation !== deletingElection.Election_Title && (
                    <div className="invalid-feedback">
                      Confirmation text does not match the ballot name.
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelDeleteElection}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={confirmDeleteElection}
                                     disabled={deleteConfirmation !== deletingElection.Election_Title || updatingElection === deletingElection.id}
                >
                  {updatingElection === deletingElection.id ? (
                    <span className="loading-text">Loading...</span>
                  ) : (
                    <i className="fas fa-trash me-1"></i>
                  )}
                  Move to Trash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showDeleteModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
}

export default Elections;
