import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../services/api';
import { checkCurrentUser, isSuperAdmin, checkAuthStatus } from '../../services/auth';
import './ManageAdmins.css';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ 
    Admin_Username: '', 
    Admin_Email: '', 
    password: '', 
    confirmPassword: '',
    role: 'ADMIN' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Check authentication status with server
        const authStatus = await checkAuthStatus();
        
        if (!authStatus.isAuthenticated) {
          setAuthError('Please log in to access this page');
          setLoading(false);
          return;
        }
        
        if (authStatus.role !== 'SUPERADMIN') {
          setAuthError('Access denied. Superadmin privileges required.');
          setLoading(false);
          return;
        }
        
        // Set current user data
        setCurrentUser(authStatus.user);
        
        // Fetch admins
        await fetchAdmins();
      } catch (error) {
        console.error('Error initializing page:', error);
        setAuthError('Failed to load page data');
        setLoading(false);
      }
    };
    
    initializePage();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const admins = await getAdmins();
      console.log('Fetched admins:', admins);
      setAdmins(admins);
      setError('');
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to load admin accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password confirmation for new admins
    if (!editingAdmin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (!editingAdmin && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      if (editingAdmin) {
        // For editing, only send fields that the backend expects
        const updateData = {
          Admin_Username: formData.Admin_Username,
          Admin_Email: formData.Admin_Email,
          role: formData.role
        };
        
        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await updateAdmin(editingAdmin.id, updateData);
      } else {
        // For creating new admin, only send fields that the backend DTO expects
        const createData = {
          Admin_Username: formData.Admin_Username,
          Admin_Email: formData.Admin_Email,
          password: formData.password,
          role: formData.role
        };
        
        await createAdmin(createData);
      }
      setShowModal(false);
      setEditingAdmin(null);
      setFormData({ Admin_Username: '', Admin_Email: '', password: '', confirmPassword: '', role: 'ADMIN' });
      setShowPassword(false);
      setShowConfirmPassword(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error saving admin:', error);
      setError('Failed to save admin account');
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
         setFormData({ 
       Admin_Username: admin.Admin_Username,
       Admin_Email: admin.Admin_Email || '', 
       password: '', 
       confirmPassword: '',
       role: admin.role 
     });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const adminToDelete = admins.find(admin => admin.id === id);
    
    // Prevent self-deletion
    if (currentUser?.id === id) {
      setError('You cannot delete your own account');
      return;
    }
    
    // Prevent deletion of last superadmin
    if (adminToDelete?.role === 'SUPERADMIN') {
      const superadminCount = admins.filter(admin => admin.role === 'SUPERADMIN').length;
      if (superadminCount <= 1) {
        setError('Cannot delete the last Superadmin account');
        return;
      }
    }
    
    const confirmMessage = `Are you sure you want to delete admin "${adminToDelete?.Admin_Username}"?\n\nThis action cannot be undone and will immediately revoke their access.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteAdmin(id);
        setSuccess(`Admin "${adminToDelete?.Admin_Username}" has been deleted successfully`);
        fetchAdmins();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting admin:', error);
        setError('Failed to delete admin account');
      }
    }
  };

  const openModal = () => {
    setEditingAdmin(null);
    setFormData({ 
      Admin_Username: '', 
      Admin_Email: '', 
      password: '', 
      confirmPassword: '', 
      role: 'ADMIN' 
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
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
    <div className="manage-admins-container">
      {/* Unified Professional Header */}
      <div className="dashboard-header-pro">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title-pro">Manage Admin Accounts</h1>
            <p className="dashboard-subtitle-pro">Create, update, and remove admin users.</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="btn btn-custom-blue" onClick={openModal}>
              Add Admin
            </button>
            <button 
              className="btn btn-outline-secondary ms-2" 
              onClick={fetchAdmins}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-1"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>



      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Debug: Show loading state and data */}
      {loading && (
        <div className="alert alert-info">
          <i className="fas fa-spinner fa-spin me-2"></i>
          Loading admin data...
        </div>
      )}

      {!loading && admins.length === 0 && (
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          No admin accounts found. You can create the first admin account below.
        </div>
      )}


      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-header-custom">
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>
                    <i className="fas fa-cogs me-1"></i>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.Admin_Username}</td>
                    <td>{admin.Admin_Email || 'N/A'}</td>
                    <td>
                      <span className={`badge ${admin.role === 'SUPERADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                        {admin.role}
                      </span>
                    </td>
                    <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                    <td>
                                               <div className="admin-actions">
                          <button
                            className="action-btn-icon edit-btn"
                            onClick={() => handleEdit(admin)}
                            title="Edit Admin"
                            disabled={admin.role === 'SUPERADMIN' && !isSuperAdmin()}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="action-btn-icon delete-btn"
                            onClick={() => handleDelete(admin.id)}
                            disabled={admin.role === 'SUPERADMIN' || currentUser?.id === admin.id}
                            title={
                              admin.role === 'SUPERADMIN' 
                                ? 'Superadmins cannot be deleted' 
                                : currentUser?.id === admin.id 
                                  ? 'You cannot delete your own account'
                                  : 'Delete Admin'
                            }
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                     </td>
                  </tr>
                ))}
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
                  {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.Admin_Username}
                      onChange={(e) => setFormData({ ...formData, Admin_Username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.Admin_Email}
                      onChange={(e) => setFormData({ ...formData, Admin_Email: e.target.value })}
                      required
                      placeholder="admin@votingsystem.com"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password {!editingAdmin && <span className="text-danger">*</span>}</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingAdmin}
                        placeholder={editingAdmin ? "Leave blank to keep current password" : ""}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  
                  {!editingAdmin && (
                    <div className="mb-3">
                      <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  )}
                                     <div className="mb-3">
                     <label className="form-label">Role</label>
                     <select
                       className="form-select"
                       value={formData.role}
                       onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                       required
                       disabled={!isSuperAdmin()}
                     >
                       <option value="ADMIN">Admin</option>
                       {isSuperAdmin() && <option value="SUPERADMIN">Super Admin</option>}
                     </select>
                     {!isSuperAdmin() && (
                       <small className="form-text text-muted">
                         Only Superadmins can create other Superadmins
                       </small>
                     )}
                   </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingAdmin ? 'Update' : 'Create'}
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

export default ManageAdmins; 