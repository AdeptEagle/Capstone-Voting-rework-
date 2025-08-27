import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getDepartments,
  getCourses,
  getVoters,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createCourse,
  updateCourse,
  deleteCourse
} from '../services/api.js';
import { checkCurrentUser } from '../services/auth.js';
import './DepartmentManagement.css';

const DepartmentManagement = () => {
  const user = checkCurrentUser();
  
  // State management
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showDeleteDepartmentModal, setShowDeleteDepartmentModal] = useState(false);
  const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Selected items
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  
  // Form data
  const [departmentFormData, setDepartmentFormData] = useState({
    Department_Name: '',
    Department_Description: '',
    customId: ''
  });
  
  const [courseFormData, setCourseFormData] = useState({
    Course_Name: '',
    Course_Code: '',
    Course_Description: '',
    customId: '',
    departmentId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [departmentsData, coursesData, votersData] = await Promise.all([
        getDepartments(),
        getCourses(),
        getVoters()
      ]);
      
      setDepartments(departmentsData);
      setCourses(coursesData);
      setVoters(votersData);
    } catch (error) {
      setMessage('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter departments based on search term
  const filteredDepartments = departments.filter(dept =>
    dept.Department_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get courses for a specific department
  const getCoursesForDepartment = (departmentId) => {
    return courses.filter(course => course.departmentId === departmentId);
  };

  // Modal handlers
  const openModal = () => {
    setDepartmentFormData({ Department_Name: '', Department_Description: '', customId: '' });
    setShowModal(true);
  };

  const openEditModal = (department) => {
    setSelectedDepartment(department);
    setDepartmentFormData({
      Department_Name: department.Department_Name,
      Department_Description: department.Department_Description || '',
      customId: department.customId || '' // Use customId field, not department.id
    });
    setShowEditModal(true);
  };

  const openCourseModal = (department, course = null) => {
    setSelectedDepartment(department);
    if (course) {
      setEditingCourse(course);
      setCourseFormData({
        Course_Name: course.Course_Name,
        Course_Code: course.Course_Code || '',
        Course_Description: course.Course_Description || '',
        customId: course.id || '',
        departmentId: course.departmentId || department.id
      });
    } else {
      setEditingCourse(null);
      setCourseFormData({ Course_Name: '', Course_Code: '', Course_Description: '', customId: '', departmentId: department.id });
    }
    setShowCourseModal(true);
  };

  // Form handlers
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      // Only send fields that the backend DTO expects
      const dataToSend = {
        Department_Name: departmentFormData.Department_Name,
        Department_Description: departmentFormData.Department_Description || undefined,
        customId: departmentFormData.customId || undefined
      };
      await createDepartment(dataToSend);
      setMessage('Department created successfully!');
      setShowModal(false);
      fetchData();
    } catch (error) {
      setMessage('Error creating department: ' + error.message);
    }
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    try {
      // Only send fields that the backend DTO expects
      const dataToSend = {
        Department_Name: departmentFormData.Department_Name,
        Department_Description: departmentFormData.Department_Description || undefined,
        customId: departmentFormData.customId || undefined
      };
      await updateDepartment(selectedDepartment.id, dataToSend);
      setMessage('Department updated successfully!');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      setMessage('Error updating department: ' + error.message);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      // Only send fields that the backend DTO expects
      const dataToSend = {
        Course_Name: courseFormData.Course_Name,
        Course_Code: courseFormData.Course_Code,
        Course_Description: courseFormData.Course_Description || undefined,
        customId: courseFormData.customId || undefined,
        departmentId: courseFormData.departmentId
      };
      await createCourse(dataToSend);
      setMessage('Course created successfully!');
      setShowCourseModal(false);
      fetchData();
    } catch (error) {
      setMessage('Error creating course: ' + error.message);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      // Only send fields that the backend DTO expects
      const dataToSend = {
        Course_Name: courseFormData.Course_Name,
        Course_Code: courseFormData.Course_Code,
        Course_Description: courseFormData.Course_Description || undefined,
        customId: courseFormData.customId || undefined,
        departmentId: courseFormData.departmentId
      };
      await updateCourse(editingCourse.id, dataToSend);
      setMessage('Course updated successfully!');
      setShowCourseModal(false);
      fetchData();
    } catch (error) {
      setMessage('Error updating course: ' + error.message);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    try {
      await deleteDepartment(departmentId);
      
      // Show success message about trash bin
      setSuccessMessage(`Department "${itemToDelete?.Department_Name}" has been moved to the trash bin. You can restore it later or permanently delete it from the Trash Bin page.`);
      
      // Refresh the data to get updated list
      await fetchData();
      // Close modal and reset state
      setShowDeleteDepartmentModal(false);
      setItemToDelete(null);
      
      // Clear success message after 8 seconds
      setTimeout(() => setSuccessMessage(''), 8000);
    } catch (error) {
      setMessage('Error deleting department: ' + error.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourse(courseId);
      
      // Show success message about trash bin
      setSuccessMessage(`Course "${itemToDelete?.Course_Name}" has been moved to the trash bin. You can restore it later or permanently delete it from the Trash Bin page.`);
      
      // Refresh the data to get updated list
      await fetchData();
      // Close modal and reset state
      setShowDeleteCourseModal(false);
      setItemToDelete(null);
      
      // Clear success message after 8 seconds
      setTimeout(() => setSuccessMessage(''), 8000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setMessage('Error deleting course: ' + errorMessage);
    }
  };

  const openDeleteDepartmentModal = (department) => {
    setItemToDelete(department);
    setShowDeleteDepartmentModal(true);
  };

  const openDeleteCourseModal = (course) => {
    setItemToDelete(course);
    setShowDeleteCourseModal(true);
  };

  if (loading) {
    return (
      <div className="department-loading">
        <div className="department-spinner">
          <div className="spinner-ring"></div>
          <p>Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="department-management-container">
      {/* Success/Error Messages */}
      {message && (
        <div className={`department-alert ${message.includes('Error') ? 'department-alert-error' : 'department-alert-success'}`}>
          <i className={`fas ${message.includes('Error') ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
          <span>{message}</span>
          <button className="department-alert-close" onClick={() => setMessage('')}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      
      {/* Success Message for Trash Bin */}
      {successMessage && (
        <div className="department-alert department-alert-success">
          <i className="fas fa-trash-alt"></i>
          <span>{successMessage}</span>
          <div className="mt-2">
            <a href="/trash-bin?tab=departments" className="btn btn-sm btn-outline-success me-2">
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
      
      {/* Unified Professional Header */}
      <div className="dashboard-header-pro">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title-pro">
              Department Management
            </h1>
            <p className="dashboard-subtitle-pro">Organize academic departments, courses, and manage voter groups efficiently</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="department-btn department-btn-primary" onClick={openModal}>
              <i className="fas fa-plus"></i>
              Add Department
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="department-search-section">
        <div className="department-search-container">
          <div className="department-search-group">
            <i className="fas fa-search department-search-icon"></i>
            <input
              type="text"
              className="department-search-input"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="department-search-clear"
                onClick={() => setSearchTerm('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <div className="department-stats">
            <div className="department-stat-item">
              <i className="fas fa-university"></i>
              <span>{departments.length} Departments</span>
            </div>
            <div className="department-stat-item">
              <i className="fas fa-graduation-cap"></i>
              <span>{courses.length} Courses</span>
            </div>
            <div className="department-stat-item">
              <i className="fas fa-users"></i>
              <span>{voters.length} Voters</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Departments Grid */}
      <div className="department-grid">
        {filteredDepartments.length > 0 ? (
          filteredDepartments.map(department => {
            const departmentCourses = getCoursesForDepartment(department.id);
            return (
              <div key={department.id} className="department-card">
                <div className="department-card-header">
                  <div className="department-card-info">
                    <div className="department-card-icon">
                      <i className="fas fa-university"></i>
                    </div>
                    <div className="department-card-details">
                      <h3 className="department-card-name">{department.Department_Name}</h3>
                      <span className="department-card-id">{department.id}</span>
                    </div>
                  </div>
                  <div className="department-card-actions">
                    <button 
                      className="department-btn department-btn-success department-btn-sm"
                      onClick={() => openCourseModal(department)}
                      title="Add Course"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                    <button 
                      className="department-btn department-btn-primary department-btn-sm"
                      onClick={() => openEditModal(department)}
                      title="Edit Department"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="department-btn department-btn-danger department-btn-sm"
                      onClick={() => openDeleteDepartmentModal(department)}
                      title="Delete Department"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                  
                <div className="department-card-stats">
                  <div className="department-stat">
                    <i className="fas fa-graduation-cap"></i>
                    <span>{departmentCourses.length} Courses</span>
                  </div>
                  <div className="department-stat">
                    <i className="fas fa-users"></i>
                    <span>{department._count?.voters || 0} Voters</span>
                  </div>
                </div>

                <div className="department-courses-section">
                  <div className="department-courses-header">
                    <h4 className="department-courses-title">
                      <i className="fas fa-book"></i>
                      Courses
                    </h4>
                    <span className="department-courses-count">{departmentCourses.length}</span>
                  </div>
                    
                  {departmentCourses.length > 0 ? (
                    <div className="department-courses-list">
                      {departmentCourses.map(course => (
                        <div key={course.id} className="department-course-item">
                          <div className="department-course-info">
                            <div className="department-course-id">{course.id}</div>
                            <div className="department-course-name">{course.Course_Name}</div>
                          </div>
                          <div className="department-course-actions">
                            <button 
                              className="department-btn department-btn-outline department-btn-sm"
                              onClick={() => openCourseModal(department, course)}
                              title="Edit Course"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="department-btn department-btn-outline-danger department-btn-sm"
                              onClick={() => openDeleteCourseModal(course)}
                              title="Delete Course"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="department-no-courses">
                      <i className="fas fa-book-open"></i>
                      <p>No courses in this department</p>
                      <button 
                        className="department-btn department-btn-outline-success department-btn-sm"
                        onClick={() => openCourseModal(department)}
                      >
                        <i className="fas fa-plus"></i>
                        Add First Course
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="department-empty">
            <div className="department-empty-content">
              <i className="fas fa-university"></i>
              <h3>No Departments Found</h3>
              <p>
                {searchTerm 
                  ? `No departments match "${searchTerm}". Try adjusting your search terms.`
                  : 'Get started by creating your first department to organize your academic structure.'
                }
              </p>
              {!searchTerm && (
                <button className="department-btn department-btn-primary" onClick={openModal}>
                  <i className="fas fa-plus"></i>
                  Create First Department
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Department Modal */}
      {showModal && (
        <div className="department-modal-overlay">
          <div className="department-modal">
            <div className="department-modal-header">
              <h5 className="department-modal-title">
                <i className="fas fa-university"></i>
                Create Department
              </h5>
              <button
                type="button"
                className="department-modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateDepartment}>
              <div className="department-modal-body">
                <div className="department-form-group">
                  <label className="department-form-label">Department Name</label>
                  <input
                    type="text"
                    className="department-form-input"
                    value={departmentFormData.Department_Name}
                    onChange={(e) => setDepartmentFormData({...departmentFormData, Department_Name: e.target.value})}
                    placeholder="e.g., College of Computer Studies"
                    required
                  />
                </div>
                <div className="department-form-group">
                  <label className="department-form-label">Description</label>
                  <textarea
                    className="department-form-input"
                    value={departmentFormData.description}
                    onChange={(e) => setDepartmentFormData({...departmentFormData, description: e.target.value})}
                    placeholder="Optional description for the department"
                    rows={3}
                  />
                </div>
                <div className="department-form-group">
                  <label className="department-form-label">Custom ID (Optional)</label>
                  <input
                    type="text"
                    className="department-form-input"
                    value={departmentFormData.customId}
                    onChange={(e) => setDepartmentFormData({...departmentFormData, customId: e.target.value.toUpperCase()})}
                    placeholder="e.g., CCS"
                    maxLength="10"
                    pattern="[A-Za-z0-9]+"
                  />
                  <small className="department-form-help">
                    Custom identifier for the department (max 10 characters, optional)
                  </small>
                </div>
              </div>
              <div className="department-modal-footer">
                <button
                  type="button"
                  className="department-btn department-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="department-btn department-btn-primary">
                  <i className="fas fa-plus"></i>
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
     
      {/* Edit Department Modal */}
      {showEditModal && selectedDepartment && (
        <div className="department-modal-overlay">
          <div className="department-modal">
            <div className="department-modal-header">
              <h5 className="department-modal-title">
                <i className="fas fa-edit"></i>
                Edit Department
              </h5>
              <button
                type="button"
                className="department-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateDepartment}>
              <div className="department-modal-body">
                <div className="department-form-group">
                  <label className="department-form-label">Department Name</label>
                  <input
                    type="text"
                    className="department-form-input"
                    value={departmentFormData.Department_Name}
                    onChange={(e) => setDepartmentFormData({...departmentFormData, Department_Name: e.target.value})}
                    required
                  />
                </div>
                <div className="department-form-group">
                  <label className="department-form-label">Description</label>
                  <textarea
                    className="department-form-input"
                    value={departmentFormData.Department_Description}
                    onChange={(e) => setDepartmentFormData({...departmentFormData, Department_Description: e.target.value})}
                    placeholder="Optional description for the department"
                    rows={3}
                  />
                </div>
                <div className="department-form-group">
                  <label className="department-form-label">Department ID</label>
                  <input
                    type="text"
                    className="department-form-input"
                    value={departmentFormData.customId}
                    disabled
                  />
                  <small className="department-form-help">
                    Department ID cannot be changed
                  </small>
                </div>
              </div>
              <div className="department-modal-footer">
                <button
                  type="button"
                  className="department-btn department-btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="department-btn department-btn-primary">
                  <i className="fas fa-save"></i>
                  Update Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
     
      {/* Course Modal */}
      {showCourseModal && selectedDepartment && (
        <div className="department-modal-overlay">
          <div className="department-modal">
            <div className="department-modal-header">
              <h5 className="department-modal-title">
                <i className="fas fa-graduation-cap"></i>
                {editingCourse ? 'Edit Course' : 'Create Course'} - {selectedDepartment.Department_Name}
              </h5>
              <button
                type="button"
                className="department-modal-close"
                onClick={() => setShowCourseModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}>
              <div className="department-modal-body">
                <input
                  type="hidden"
                  name="departmentId"
                  value={courseFormData.departmentId}
                />
                <div className="department-form-group">
                  <label className="department-form-label">Course Code</label>
                  <input
                    type="text"
                    className="department-form-input"
                    value={courseFormData.Course_Code}
                    onChange={(e) => setCourseFormData({...courseFormData, Course_Code: e.target.value.toUpperCase()})}
                    placeholder="e.g., CS101, IT201"
                    maxLength="10"
                    pattern="[A-Za-z0-9]+"
                    required
                  />
                  <small className="department-form-help">
                    Enter a unique course code (e.g., CS101 for Computer Science 101)
                  </small>
                </div>
                <div className="department-form-group">
                  <label className="department-form-label">
                    {editingCourse ? 'Course ID (Cannot be changed)' : 'Custom ID (Optional)'}
                  </label>
                  <input
                    type="text"
                    className="department-form-input"
                    value={courseFormData.customId}
                    onChange={editingCourse ? undefined : (e) => setCourseFormData({...courseFormData, customId: e.target.value.toUpperCase()})}
                    placeholder="e.g., CS101"
                    maxLength="10"
                    pattern="[A-Za-z0-9]+"
                    disabled={editingCourse}
                  />
                  <small className="department-form-help">
                    {editingCourse 
                      ? 'Course ID cannot be changed once created'
                      : 'Custom identifier for the course (optional, will auto-generate if not provided)'
                    }
                  </small>
                </div>
                <div className="department-form-group">
                  <label className="department-form-label">Course Name</label>
                  <input
                    type="text"
                    className="department-form-input"
                    value={courseFormData.Course_Name}
                    onChange={(e) => setCourseFormData({...courseFormData, Course_Name: e.target.value})}
                    placeholder="e.g., Introduction to Computer Science"
                    required
                  />
                </div>
                <div className="department-form-group">
                  <label className="department-form-label">Description (Optional)</label>
                  <textarea
                    className="department-form-input"
                    value={courseFormData.Course_Description}
                    onChange={(e) => setCourseFormData({...courseFormData, Course_Description: e.target.value})}
                    placeholder="Optional description for this course"
                    rows={3}
                  />
                </div>
              </div>
              <div className="department-modal-footer">
                <button
                  type="button"
                  className="department-btn department-btn-secondary"
                  onClick={() => setShowCourseModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="department-btn department-btn-success">
                  <i className="fas fa-graduation-cap"></i>
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Department Confirmation Modal */}
      {showDeleteDepartmentModal && itemToDelete && (
        <div className="department-modal-overlay">
          <div className="department-modal">
            <div className="department-modal-header">
              <h5 className="department-modal-title text-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Confirm Department Deletion
              </h5>
              <button
                type="button"
                className="department-modal-close"
                onClick={() => {
                  setShowDeleteDepartmentModal(false);
                  setItemToDelete(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="department-modal-body">
              <div className="alert alert-danger">
                <strong>Warning:</strong> This action cannot be undone!
              </div>
              <p>Are you sure you want to delete this department?</p>
              <div className="department-delete-info">
                <strong>Name:</strong> {itemToDelete.name}<br />
                <strong>ID:</strong> {itemToDelete.id}<br />
                <strong>Description:</strong> {itemToDelete.description || 'No description'}
              </div>
              <p className="text-muted mt-2">
                <small>
                  <i className="fas fa-info-circle me-1"></i>
                  The department will be moved to the trash and can be restored later.
                </small>
              </p>
            </div>
            <div className="department-modal-footer">
              <button
                type="button"
                className="department-btn department-btn-secondary"
                onClick={() => {
                  setShowDeleteDepartmentModal(false);
                  setItemToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="department-btn department-btn-danger"
                onClick={() => handleDeleteDepartment(itemToDelete.id)}
              >
                <i className="fas fa-trash me-1"></i>
                Delete Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Modal */}
      {showDeleteCourseModal && itemToDelete && (
        <div className="department-modal-overlay">
          <div className="department-modal">
            <div className="department-modal-header">
              <h5 className="department-modal-title text-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Confirm Course Deletion
              </h5>
              <button
                type="button"
                className="department-modal-close"
                onClick={() => {
                  setShowDeleteCourseModal(false);
                  setItemToDelete(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="department-modal-body">
              <div className="alert alert-danger">
                <strong>Warning:</strong> This action cannot be undone!
              </div>
              <p>Are you sure you want to delete this course?</p>
              <div className="department-delete-info">
                <strong>Name:</strong> {itemToDelete.name}<br />
                <strong>Code:</strong> {itemToDelete.code}<br />
                <strong>ID:</strong> {itemToDelete.id}<br />
                <strong>Description:</strong> {itemToDelete.description || 'No description'}
              </div>
              <p className="text-muted mt-2">
                <small>
                  <i className="fas fa-info-circle me-1"></i>
                  The course will be moved to the trash and can be restored later.
                </small>
              </p>
            </div>
            <div className="department-modal-footer">
              <button
                type="button"
                className="department-btn department-btn-secondary"
                onClick={() => {
                  setShowDeleteCourseModal(false);
                  setItemToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="department-btn department-btn-danger"
                onClick={() => handleDeleteCourse(itemToDelete.id)}
              >
                <i className="fas fa-trash me-1"></i>
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement; 