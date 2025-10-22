import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdmins, getPositions, getCandidates, getVoters, getVotes, changePassword, getNuclearResetStatus, executeNuclearReset } from '../../services/api';
import ElectionStatus from '../../components/ElectionStatus';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalPositions: 0,
    totalCandidates: 0,
    totalVoters: 0,
    totalVotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [notification, setNotification] = useState(null);

  // Nuclear Reset state
  const [showNuclearResetModal, setShowNuclearResetModal] = useState(false);
  const [nuclearResetStatus, setNuclearResetStatus] = useState(null);
  const [nuclearResetLoading, setNuclearResetLoading] = useState(false);
  const [nuclearResetStep, setNuclearResetStep] = useState(1); // 1: warning, 2: confirmation, 3: executing
  const [nuclearResetConfirmations, setNuclearResetConfirmations] = useState({
    understandConsequences: false,
    backupData: false,
    finalConfirmation: false
  });
  const [showNuclearResetSection, setShowNuclearResetSection] = useState(() => {
    // Load from localStorage, default to true if not set
    const saved = localStorage.getItem('nuclearResetSectionVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [nuclearResetTextConfirmation, setNuclearResetTextConfirmation] = useState(''); // Text confirmation input
  const [nuclearResetPasswordConfirmation, setNuclearResetPasswordConfirmation] = useState(''); // Password confirmation input
  const [showNuclearResetPassword, setShowNuclearResetPassword] = useState(false); // Password visibility toggle

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [admins, positions, candidates, voters, votes] = await Promise.all([
        getAdmins(),
        getPositions(),
        getCandidates(),
        getVoters(),
        getVotes()
      ]);

      setStats({
        totalAdmins: admins.length,
        totalPositions: positions.length,
        totalCandidates: candidates.length,
        totalVoters: voters.length,
        totalVotes: votes.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/admin-login');
  };

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotification({
        type: 'error',
        message: 'New password and confirmation do not match'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setNotification({
        type: 'error',
        message: 'New password must be at least 6 characters long'
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setNotification({
        type: 'success',
        message: 'Password changed successfully!'
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error changing password:', error);
      let errorMessage = 'Failed to change password';
      
      // Provide more specific error messages
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('Current password is incorrect')) {
          errorMessage = 'Current password is incorrect. Please try again.';
        } else if (error.response.data.message.includes('User not found')) {
          errorMessage = 'User account not found. Please log in again.';
        } else {
          errorMessage = error.response.data.message;
        }
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
    setNotification(null);
  };

  // Nuclear Reset functions
  const fetchNuclearResetStatus = async () => {
    try {
      const status = await getNuclearResetStatus();
      setNuclearResetStatus(status);
    } catch (error) {
      console.error('Error fetching nuclear reset status:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load system status'
      });
    }
  };

  const openNuclearResetModal = () => {
    setNuclearResetStep(1);
    setNuclearResetConfirmations({
      understandConsequences: false,
      backupData: false,
      finalConfirmation: false
    });
    fetchNuclearResetStatus();
    setShowNuclearResetModal(true);
  };

  const closeNuclearResetModal = () => {
    setShowNuclearResetModal(false);
    setNuclearResetStep(1);
    setNuclearResetConfirmations({
      understandConsequences: false,
      backupData: false,
      finalConfirmation: false
    });
    setNuclearResetStatus(null);
    setNuclearResetTextConfirmation('');
    setNuclearResetPasswordConfirmation('');
    setShowNuclearResetPassword(false);
  };

  const handleNuclearResetConfirmation = (field) => {
    setNuclearResetConfirmations(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleNuclearResetSectionToggle = (checked) => {
    setShowNuclearResetSection(checked);
    // Save to localStorage
    localStorage.setItem('nuclearResetSectionVisible', JSON.stringify(checked));
  };

  const executeNuclearResetAction = async () => {
    // Validate inputs first
    if (nuclearResetTextConfirmation !== 'DELETE ALL DATA') {
      setNotification({
        type: 'error',
        message: 'Text confirmation does not match. Please type "DELETE ALL DATA" exactly.'
      });
      return;
    }

    if (!nuclearResetPasswordConfirmation) {
      setNotification({
        type: 'error',
        message: 'Password confirmation is required.'
      });
      return;
    }

    setNuclearResetLoading(true);
    setNuclearResetStep(4); // Go to execution step
    
    try {
      // First verify the password by attempting to change password (this will validate current password)
      // We'll use a simple approach - try to get current user info with the password
      // For now, we'll proceed with the reset and let the backend handle password verification
      
      const result = await executeNuclearReset(nuclearResetPasswordConfirmation);
      
      setNotification({
        type: 'success',
        message: `Nuclear reset completed successfully! Deleted: ${result.deletedCounts.voters} voters, ${result.deletedCounts.candidates} candidates, ${result.deletedCounts.ballots} ballots, and more.`
      });
      
      // Refresh stats after reset
      await fetchStats();
      
      // Close modal after delay
      setTimeout(() => {
        closeNuclearResetModal();
      }, 3000);
      
    } catch (error) {
      console.error('Error executing nuclear reset:', error);
      setNotification({
        type: 'error',
        message: 'Nuclear reset failed. Please check the logs for details.'
      });
      setNuclearResetStep(3); // Go back to additional confirmation step
    } finally {
      setNuclearResetLoading(false);
    }
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

  return (
    <div className="superadmin-dashboard">
      {/* Unified Professional Header */}
      <div className="dashboard-header-pro">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-title-pro">Super Admin Panel</h1>
            <p className="dashboard-subtitle-pro">Full control over all admin accounts and settings.</p>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Notifications */}
      {notification && (
        <div className={`alert alert-${notification.type === 'error' ? 'danger' : notification.type} alert-dismissible fade show`} role="alert">
          <i className="fas fa-bell me-2"></i>
          {notification.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setNotification(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-2 mb-3">
          <div className="stat-card">
            <div className="stat-icon admin-icon">
              <i className="fas fa-users-cog"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalAdmins}</h3>
              <p>Admin Accounts</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="stat-card">
            <div className="stat-icon position-icon">
              <i className="fas fa-briefcase"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalPositions}</h3>
              <p>Positions</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="stat-card">
            <div className="stat-icon candidate-icon">
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalCandidates}</h3>
              <p>Candidates</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="stat-card">
            <div className="stat-icon voter-icon">
              <i className="fas fa-user-friends"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalVoters}</h3>
              <p>Voters</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="stat-card">
            <div className="stat-icon vote-icon">
              <i className="fas fa-vote-yea"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalVotes}</h3>
              <p>Votes Cast</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-primary w-100 action-btn"
                    onClick={() => navigate('/superadmin/manage-admins')}
                  >
                    <i className="fas fa-users-cog me-2"></i>
                    Manage Admins
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-success w-100 action-btn"
                    onClick={() => navigate('/admin/results')}
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    View Results
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-info w-100 action-btn"
                    onClick={() => navigate('/admin/positions')}
                  >
                    <i className="fas fa-briefcase me-2"></i>
                    Manage Positions
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-warning w-100 action-btn"
                    onClick={() => navigate('/admin/candidates')}
                  >
                    <i className="fas fa-user-tie me-2"></i>
                    Manage Candidates
                  </button>
                </div>
              </div>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-secondary w-100 action-btn"
                    onClick={() => setShowSettingsModal(true)}
                  >
                    <i className="fas fa-cog me-2"></i>
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Election Status */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-vote-yea me-2"></i>
                Current Ballot/Election Status
              </h5>
            </div>
            <div className="card-body">
              <ElectionStatus />
            </div>
          </div>
        </div>
      </div>

      {/* Nuclear Reset Section - Only show if enabled in settings */}
      {showNuclearResetSection && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-danger">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">
                  <i className="fas fa-radiation me-2"></i>
                  🚨 Nuclear Reset - System Administrator Only
                </h5>
              </div>
              <div className="card-body">
                <div className="alert alert-danger mb-3">
                  <p className="mb-0">
                    <strong>⚠️ CRITICAL WARNING:</strong> This action will permanently delete ALL user-generated data from the system! <p>What will be deleted: All voters and voter accounts, all candidates and candidate data, all ballots and voting data, all votes cast by users, all party lists, all regular admin accounts, and all audit logs and login history.</p> What will be preserved: SuperAdmin accounts (for system access), built-in positions and templates, departments and courses, and system configurations.
                  </p>
                </div>
                
                <div className="alert alert-warning mb-3">
                  <h6 className="alert-heading">Legal and Compliance Notice:</h6>
                  <p className="mb-0">
                    This action may violate data retention requirements, audit compliance standards, 
                    and legal obligations. Use only in exceptional circumstances with proper authorization.
                  </p>
                </div>

                <div className="d-flex justify-content-center">
                  <button
                    className="btn btn-danger btn-lg"
                    onClick={openNuclearResetModal}
                    disabled={nuclearResetLoading}
                  >
                    <i className="fas fa-radiation me-2"></i>
                    🚨 Execute Nuclear Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-cog me-2"></i>
                  Account Settings
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeSettingsModal}
                ></button>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="modal-body">
                  <div className="settings-section">
                    <h6 className="mb-3">
                      <i className="fas fa-key me-2"></i>
                      Change Password
                    </h6>
                    
                    <div className="mb-3">
                      <label className="form-label">Current Password</label>
                      <div className="input-group">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          className="form-control"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <span className="input-group-text">
                          <i 
                            className={`fas ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`} 
                            onClick={() => togglePasswordVisibility('current')}
                            style={{ cursor: 'pointer' }}
                          ></i>
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <div className="input-group">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          className="form-control"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength="6"
                        />
                        <span className="input-group-text">
                          <i 
                            className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`} 
                            onClick={() => togglePasswordVisibility('new')}
                            style={{ cursor: 'pointer' }}
                          ></i>
                        </span>
                      </div>
                      <small className="form-text text-muted">
                        Password must be at least 6 characters long
                      </small>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Confirm New Password</label>
                      <div className="input-group">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          className="form-control"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <span className="input-group-text">
                          <i 
                            className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`} 
                            onClick={() => togglePasswordVisibility('confirm')}
                            style={{ cursor: 'pointer' }}
                          ></i>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nuclear Reset Settings Section */}
                  <div className="settings-section mt-4">
                    <h6 className="mb-3">
                      <i className="fas fa-radiation me-2"></i>
                      Nuclear Reset Settings
                    </h6>
                    
                    <div className="mb-3">
                      <div className="form-check form-switch">
                         <input
                           className="form-check-input"
                           type="checkbox"
                           id="showNuclearResetSection"
                           checked={showNuclearResetSection}
                           onChange={(e) => handleNuclearResetSectionToggle(e.target.checked)}
                         />
                        <label className="form-check-label" htmlFor="showNuclearResetSection">
                          <strong>Show Nuclear Reset Section</strong>
                        </label>
                      </div>
                      <small className="form-text text-muted">
                        Toggle the visibility of the Nuclear Reset section in the dashboard. 
                        When hidden, the dangerous reset functionality will not be visible.
                        <br />
                        <strong>Current status:</strong> {showNuclearResetSection ? 'Visible' : 'Hidden'}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeSettingsModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-1"></i>
                        Changing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-1"></i>
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Backdrop */}
      {showSettingsModal && <div className="modal-backdrop fade show"></div>}

      {/* Nuclear Reset Modal */}
      {showNuclearResetModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="fas fa-radiation me-2"></i>
                  🚨 Nuclear Reset Confirmation
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeNuclearResetModal}
                  disabled={nuclearResetLoading}
                ></button>
              </div>
              <div className="modal-body">
                {nuclearResetStep === 1 && (
                  <div>
                    <div className="alert alert-danger mb-3">
                      <h6 className="alert-heading">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        ⚠️ FINAL WARNING
                      </h6>
                      <p className="mb-2">
                        <strong>You are about to permanently delete ALL user-generated data!</strong>
                      </p>
                      <p className="mb-0">
                        This action cannot be undone and will result in complete data loss.
                      </p>
                    </div>

                    {nuclearResetStatus && (
                      <div className="alert alert-info mb-3">
                        <h6 className="alert-heading">Current System Status:</h6>
                        <div className="row">
                          <div className="col-md-6">
                            <ul className="mb-0">
                              <li><strong>Voters:</strong> {nuclearResetStatus.voters}</li>
                              <li><strong>Candidates:</strong> {nuclearResetStatus.candidates}</li>
                              <li><strong>Ballots:</strong> {nuclearResetStatus.ballots}</li>
                              <li><strong>Votes:</strong> {nuclearResetStatus.votes}</li>
                            </ul>
                          </div>
                          <div className="col-md-6">
                            <ul className="mb-0">
                              <li><strong>Departments:</strong> {nuclearResetStatus.departments} (preserved)</li>
                              <li><strong>Courses:</strong> {nuclearResetStatus.courses} (preserved)</li>
                              <li><strong>Regular Admins:</strong> {nuclearResetStatus.regularAdmins}</li>
                              <li><strong>SuperAdmins:</strong> {nuclearResetStatus.superAdmins} (preserved)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-center">
                      <button
                        className="btn btn-danger btn-lg"
                        onClick={() => setNuclearResetStep(2)}
                      >
                        <i className="fas fa-radiation me-2"></i>
                        I Understand - Continue to Confirmation
                      </button>
                    </div>
                  </div>
                )}

                {nuclearResetStep === 2 && (
                  <div>
                    <div className="alert alert-danger mb-3">
                      <h6 className="alert-heading">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        ⚠️ FINAL CONFIRMATION REQUIRED
                      </h6>
                      <p className="mb-0">
                        Please confirm each statement below to proceed with the nuclear reset.
                      </p>
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="understandConsequences"
                          checked={nuclearResetConfirmations.understandConsequences}
                          onChange={() => handleNuclearResetConfirmation('understandConsequences')}
                        />
                        <label className="form-check-label" htmlFor="understandConsequences">
                          <strong>I understand that this action will permanently delete ALL user data and cannot be undone.</strong>
                        </label>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="backupData"
                          checked={nuclearResetConfirmations.backupData}
                          onChange={() => handleNuclearResetConfirmation('backupData')}
                        />
                        <label className="form-check-label" htmlFor="backupData">
                          <strong>I have backed up any important data and understand that this action violates audit compliance.</strong>
                        </label>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="finalConfirmation"
                          checked={nuclearResetConfirmations.finalConfirmation}
                          onChange={() => handleNuclearResetConfirmation('finalConfirmation')}
                        />
                        <label className="form-check-label" htmlFor="finalConfirmation">
                          <strong>I take full responsibility for this action and confirm that I have proper authorization.</strong>
                        </label>
                      </div>
                    </div>

                    <div className="d-flex justify-content-center gap-3">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setNuclearResetStep(1)}
                        disabled={nuclearResetLoading}
                      >
                        Back
                      </button>
                      <button
                        className="btn btn-danger btn-lg"
                        onClick={() => setNuclearResetStep(3)}
                        disabled={!nuclearResetConfirmations.understandConsequences || 
                                 !nuclearResetConfirmations.backupData || 
                                 !nuclearResetConfirmations.finalConfirmation ||
                                 nuclearResetLoading}
                      >
                        <i className="fas fa-radiation me-2"></i>
                        Continue to Final Confirmation
                      </button>
                    </div>
                  </div>
                )}

                {nuclearResetStep === 3 && (
                  <div>
                    <div className="alert alert-danger mb-3">
                      <h6 className="alert-heading">
                        <i className="fas fa-shield-alt me-2"></i>
                        🔐 ADDITIONAL SECURITY CONFIRMATION
                      </h6>
                      <p className="mb-0">
                        To prevent accidental execution, please complete the following security checks.
                      </p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        <strong>Type the following text exactly:</strong>
                      </label>
                      <div className="alert alert-warning mb-2">
                        <code className="fs-5">DELETE ALL DATA</code>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type: DELETE ALL DATA"
                        value={nuclearResetTextConfirmation}
                        onChange={(e) => setNuclearResetTextConfirmation(e.target.value)}
                        disabled={nuclearResetLoading}
                      />
                      {nuclearResetTextConfirmation && nuclearResetTextConfirmation !== 'DELETE ALL DATA' && (
                        <div className="text-danger mt-1">
                          <i className="fas fa-times me-1"></i>
                          Text does not match exactly
                        </div>
                      )}
                      {nuclearResetTextConfirmation === 'DELETE ALL DATA' && (
                        <div className="text-success mt-1">
                          <i className="fas fa-check me-1"></i>
                          Text confirmation verified
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        <strong>Enter your SuperAdmin password:</strong>
                      </label>
                      <div className="input-group">
                        <input
                          type={showNuclearResetPassword ? "text" : "password"}
                          className="form-control"
                          placeholder="Enter your password"
                          value={nuclearResetPasswordConfirmation}
                          onChange={(e) => setNuclearResetPasswordConfirmation(e.target.value)}
                          disabled={nuclearResetLoading}
                        />
                        <span className="input-group-text">
                          <i 
                            className={`fas ${showNuclearResetPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                            onClick={() => setShowNuclearResetPassword(!showNuclearResetPassword)}
                            style={{ cursor: 'pointer' }}
                          ></i>
                        </span>
                      </div>
                      <small className="form-text text-muted">
                        Your password will be verified before proceeding
                      </small>
                    </div>

                    <div className="d-flex justify-content-center gap-3">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setNuclearResetStep(2)}
                        disabled={nuclearResetLoading}
                      >
                        Back
                      </button>
                      <button
                        className="btn btn-danger btn-lg"
                        onClick={executeNuclearResetAction}
                        disabled={nuclearResetTextConfirmation !== 'DELETE ALL DATA' || 
                                 !nuclearResetPasswordConfirmation ||
                                 nuclearResetLoading}
                      >
                        <i className="fas fa-radiation me-2"></i>
                        🚨 EXECUTE NUCLEAR RESET
                      </button>
                    </div>
                  </div>
                )}

                {nuclearResetStep === 4 && (
                  <div className="text-center">
                    <div className="spinner-border text-danger mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                      <span className="visually-hidden">Executing...</span>
                    </div>
                    <h5 className="text-danger">Executing Nuclear Reset...</h5>
                    <p className="text-muted">
                      Please wait while the system removes all user-generated data.
                      This may take a few moments.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showSettingsModal && <div className="modal-backdrop fade show"></div>}
      {showNuclearResetModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default SuperAdminDashboard; 