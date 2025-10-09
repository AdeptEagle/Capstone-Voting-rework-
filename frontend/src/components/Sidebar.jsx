import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useElection } from '../contexts/ElectionContext';
import { checkCurrentUser, logout } from '../services/auth';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const currentUser = checkCurrentUser();
  
  // Safely get election context with fallback
  let electionContext = null;
  try {
    electionContext = useElection();
  } catch (error) {
    console.warn('ElectionContext not available:', error.message);
    // Provide fallback values
    electionContext = {
      canVote: false,
      canViewCandidates: false,
      canViewResults: false,
      hasActiveElection: false,
      hasAnyElection: false,
      hasEndedElection: false
    };
  }
  
  const { canVote, canViewCandidates, canViewResults, hasActiveElection, hasAnyElection, hasEndedElection } = electionContext;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from server
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:3001/auth/status', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated && data.user) {
            setUserData(data.user);
          }
        }
      } catch (error) {
        console.error('Error fetching user data for sidebar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const userRole = currentUser.role;
  
  // Debug logging to understand the data structure
  console.log('Sidebar userData:', userData);
  console.log('Sidebar userRole:', userRole);
  
  const userName = userData?.Voter_Name || userData?.Admin_Username || userData?.name || userData?.username || userRole || 'User';
  
  // State for collapsible sections - use localStorage to persist state
  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem('sidebar-expanded-sections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.log('Failed to parse saved sections, using default');
      }
    }
    return {
      main: true,
      ballots: true,
      elections: false,
      management: true,
      voting: true,
      advanced: false
    };
  });

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => {
      // Create a completely new object to ensure state update
      const newState = {
        main: prev.main,
        ballots: prev.ballots,
        elections: prev.elections,
        management: prev.management,
        voting: prev.voting,
        advanced: prev.advanced,
        [section]: !prev[section]
      };
      // Save to localStorage
      localStorage.setItem('sidebar-expanded-sections', JSON.stringify(newState));
      return newState;
    });
  }, []);

  // Role-specific navigation items with icons and grouping
  const getNavItems = () => {
    switch (userRole?.toLowerCase()) {
      case 'superadmin':
        return {
          main: [
            { path: '/superadmin', label: 'Dashboard', icon: 'fas fa-tachometer-alt' }
          ],
          ballots: [
            { path: '/admin/ballot-management', label: 'Ballot Management', icon: 'fas fa-list-alt' },
            { path: '/admin/ballot-traceability', label: 'Ballot Traceability', icon: 'fas fa-search' }
          ],
          management: [
            { path: '/admin/positions', label: 'Positions', icon: 'fas fa-user-tie' },
            { path: '/admin/candidates', label: 'Candidates', icon: 'fas fa-users' },
            { path: '/admin/voters', label: 'Voters', icon: 'fas fa-user-friends' },
            { path: '/admin/department-management', label: 'Department Management', icon: 'fas fa-university' }
          ],
          advanced: [
            { path: '/superadmin/manage-admins', label: 'Manage Admins', icon: 'fas fa-user-shield' },
            { path: '/superadmin/admin-logs', label: 'Admin Logs', icon: 'fas fa-history' },
            { path: '/superadmin/user-logs', label: 'User Logs', icon: 'fas fa-users' },
            { path: '/trash-bin', label: 'Trash Bin', icon: 'fas fa-trash' }
          ]
        };
      case 'admin':
        return {
          main: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' }
          ],
          ballots: [
            { path: '/admin/ballot-management', label: 'Ballot Management', icon: 'fas fa-list-alt' },
            { path: '/admin/ballot-traceability', label: 'Ballot Traceability', icon: 'fas fa-search' }
          ],
          management: [
            { path: '/admin/positions', label: 'Positions', icon: 'fas fa-user-tie' },
            { path: '/admin/candidates', label: 'Candidates', icon: 'fas fa-users' },
            { path: '/admin/voters', label: 'Voters', icon: 'fas fa-user-friends' },
            { path: '/admin/department-management', label: 'Department Management', icon: 'fas fa-university' }
          ],
          advanced: [
            { path: '/trash-bin', label: 'Trash Bin', icon: 'fas fa-trash' }
          ]
        };
      default: // User role
        return {
          main: [
            { path: '/user/dashboard', label: 'Dashboard', icon: 'fas fa-home' }
          ],
          voting: [
            { path: '/user/ballot-selection', label: 'Available Ballots', icon: 'fas fa-list-alt' },
            { path: '/user/voting-history', label: 'Voting History', icon: 'fas fa-history' }
          ]
        };
    }
  };

  const getRoleTitle = () => {
    switch (userRole?.toLowerCase()) {
      case 'superadmin':
        return 'Super Admin Panel';
      case 'admin':
        return 'Admin Panel';
      default:
        return 'Voting System';
    }
  };

  const getRoleIcon = () => {
    switch (userRole?.toLowerCase()) {
      case 'superadmin':
        return 'fas fa-crown';
      case 'admin':
        return 'fas fa-user-shield';
      default:
        return 'fas fa-user';
    }
  };

  const navItems = useMemo(() => getNavItems(), [userRole, canVote, canViewCandidates, canViewResults]);
  


  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to appropriate login page based on role
      const redirectUrl = userRole === 'USER' ? '/user-login' : '/admin-login';
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if logout fails
      const redirectUrl = userRole === 'USER' ? '/user-login' : '/admin-login';
      window.location.href = redirectUrl;
    }
  };

  const renderNavSection = (sectionKey, items, title, icon) => {
    // Check if items exists and is an array
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    
    const isExpanded = expandedSections[sectionKey] !== undefined ? expandedSections[sectionKey] : true;
    
    return (
      <div className="nav-section">
        <div 
          className="section-header"
          onClick={() => toggleSection(sectionKey)}
        >
          <i className={icon}></i>
          <span>{title}</span>
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} section-toggle`}></i>
        </div>
        <ul className={`section-items ${isExpanded ? 'expanded' : ''}`}>
          {items.map((item) => (
            <li key={item.path} className="nav-item">
                              <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event from bubbling up to section header
                    if (window.innerWidth < 768) {
                      onToggle();
                    }
                  }}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`} key="sidebar-component">
        <div className="sidebar-header">
          <div className="admin-profile">
            <div className="admin-avatar">
              <i className={getRoleIcon()}></i>
            </div>
          </div>
          <h3 className="admin-name">{userName}</h3>
          <div className="role-badge">
            <i className="fas fa-circle"></i>
            <span>{userRole?.toUpperCase() || 'USER'}</span>
          </div>
        </div>

        <div className="sidebar-nav">
          {/* Main Section */}
          {renderNavSection('main', navItems.main || [], 'MAIN', 'fas fa-home')}
          
          {/* Ballots Section */}
          {renderNavSection('ballots', navItems.ballots || [], 'BALLOTS', 'fas fa-list-alt')}
          
          {/* Management Section */}
          {renderNavSection('management', navItems.management || [], 'MANAGEMENT', 'fas fa-cogs')}
          
          {/* Voting Section (for users) */}
          {renderNavSection('voting', navItems.voting || [], 'VOTING', 'fas fa-vote-yea')}
          
          {/* Advanced Section */}
          {renderNavSection('advanced', navItems.advanced || [], 'ADVANCED', 'fas fa-tools')}
        </div>

        <div className="sidebar-footer">
          <button className="btn btn-outline-light logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div 
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`} 
        onClick={onToggle}
      />
    </>
  );
};

export default Sidebar; 