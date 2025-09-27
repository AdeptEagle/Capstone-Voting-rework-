import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SuperAdminDashboard from './Pages/SuperAdmin/SuperAdminDashboard';
import ManageAdmins from './Pages/SuperAdmin/ManageAdmins';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import BallotManagement from './Pages/Admin/BallotManagement';
import BallotDetails from './Pages/Admin/BallotDetails';
import BallotTraceability from './Pages/Admin/BallotTraceability';
import UserDashboard from './Pages/User/UserDashboard';
import Positions from './Pages/Positions';
import Candidates from './Pages/Candidates';
import Voters from './Pages/Voters';
import VoterHistory from './Pages/Admin/VoterHistory';
import Elections from './Pages/Elections';
import ElectionHistory from './Pages/ElectionHistory';
import UserRegister from './Pages/User/UserRegister';
import Vote from './Pages/User/Vote';
import BallotSelection from './Pages/User/BallotSelection';
import BallotVote from './Pages/User/BallotVote';
import BallotResults from './Pages/User/BallotResults';
import VotingHistory from './Pages/User/VotingHistory';
import AdminLogin from './Pages/AdminLogin';
import UserLogin from './Pages/User/UserLogin';
import ForgotPassword from './Pages/ForgotPassword';
import AdminForgotPassword from './Pages/AdminForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import DepartmentManagement from './Pages/DepartmentManagement';
import TrashBin from './Pages/TrashBin';
import { getToken, checkCurrentUser, getStoredRole, migrateToSecureStorage } from './services/auth';
import { ElectionProvider } from './contexts/ElectionContext';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Admin Route Protection (for admin and superadmin)
function AdminRoute({ children }) {
  const currentUser = checkCurrentUser();

  if (!currentUser.isAuthenticated) {
    return <Navigate to="/admin-login" />;
  }
  
  const role = currentUser.role?.toUpperCase();
  
  if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
    return <Navigate to="/admin-login" />;
  }
  
  return children;
}

// SuperAdmin Route Protection (superadmin only)
function SuperAdminRoute({ children }) {
  const currentUser = checkCurrentUser();

  if (!currentUser.isAuthenticated) {
    return <Navigate to="/admin-login" />;
  }
  
  const role = currentUser.role?.toUpperCase();
  
  if (role !== 'SUPERADMIN') {
    return <Navigate to="/admin-login" />;
  }
  
  return children;
}

// User Route Protection (user only)
function UserRoute({ children }) {
  const currentUser = checkCurrentUser();
  
  console.log('UserRoute check:', currentUser);

  if (!currentUser.isAuthenticated) {
    console.log('UserRoute: Not authenticated, redirecting to login');
    return <Navigate to="/user-login" />;
  }
  
  if (currentUser.role !== 'USER') {
    console.log('UserRoute: Role mismatch, expected "USER", got:', currentUser.role);
    return <Navigate to="/user-login" />;
  }
  
  console.log('UserRoute: Access granted');
  return children;
}

// Admin Layout Component (for admin and superadmin routes)
function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Header onToggleSidebar={toggleSidebar} />
      <main>
        {children}
      </main>
    </>
  );
}

// User Layout Component (for user routes)
function UserLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Header onToggleSidebar={toggleSidebar} />
      <main>
        {children}
      </main>
    </>
  );
}

function App() {
  useEffect(() => {
    migrateToSecureStorage();
  }, []);

  return (
    <ElectionProvider>
    <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<UserLogin />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin-forgot-password" element={<AdminForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* SuperAdmin Routes (SuperAdmin only) */}
            <Route path="/superadmin" element={
              <SuperAdminRoute>
                <AdminLayout>
                  <SuperAdminDashboard />
                </AdminLayout>
              </SuperAdminRoute>
            } />
            <Route path="/superadmin/manage-admins" element={
              <SuperAdminRoute>
                <AdminLayout>
                  <ManageAdmins />
                </AdminLayout>
              </SuperAdminRoute>
            } />

            {/* Admin Dashboard Routes (Admin and SuperAdmin) - require authentication */}
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/admin/positions" element={
              <AdminRoute>
                <AdminLayout>
                  <Positions />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/admin/candidates" element={
              <AdminRoute>
                <AdminLayout>
                  <Candidates />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/admin/voters" element={
              <AdminRoute>
                <AdminLayout>
                  <Voters />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/admin/voter-history/:voterId" element={
              <AdminRoute>
                <AdminLayout>
                  <VoterHistory />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/admin/elections" element={
              <AdminRoute>
                <AdminLayout>
                  <Elections />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/admin/election-history" element={
              <AdminRoute>
                <AdminLayout>
                  <ElectionHistory />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/admin/ballot-management" element={
              <AdminRoute>
                <AdminLayout>
                  <BallotManagement />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/admin/ballot-details/:ballotId" element={
              <AdminRoute>
                <AdminLayout>
                  <BallotDetails />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/admin/ballot-traceability" element={
              <AdminRoute>
                <AdminLayout>
                  <BallotTraceability />
                </AdminLayout>
              </AdminRoute>
            } />
                                     <Route path="/admin/department-management" element={
              <AdminRoute>
                <AdminLayout>
                  <DepartmentManagement />
                </AdminLayout>
              </AdminRoute>
            } />
            <Route path="/trash-bin" element={
              <AdminRoute>
                <AdminLayout>
                  <TrashBin />
                </AdminLayout>
              </AdminRoute>
            } />

            {/* User Routes (User only) */}
            <Route path="/user/dashboard" element={
              <UserRoute>
                <UserLayout>
                  <UserDashboard />
                </UserLayout>
              </UserRoute>
            } />
            <Route path="/user/vote" element={
              <UserRoute>
                <UserLayout>
                  <Vote />
                </UserLayout>
              </UserRoute>
            } />
            <Route path="/user/candidates" element={
              <UserRoute>
                <UserLayout>
                  <Candidates />
                </UserLayout>
              </UserRoute>
            } />
            <Route path="/user/ballot-selection" element={
              <UserRoute>
                <UserLayout>
                  <BallotSelection />
                </UserLayout>
              </UserRoute>
            } />
            <Route path="/user/vote/:ballotId" element={
              <UserRoute>
                <UserLayout>
                  <BallotVote />
                </UserLayout>
              </UserRoute>
            } />
            <Route path="/user/ballot-results/:ballotId" element={
              <UserRoute>
                <UserLayout>
                  <BallotResults />
                </UserLayout>
              </UserRoute>
            } />
            <Route path="/user/voting-history" element={
              <UserRoute>
                <UserLayout>
                  <VotingHistory />
                </UserLayout>
              </UserRoute>
            } />

            {/* Legacy Route Redirects for backward compatibility */}
            <Route path="/dashboard" element={<Navigate to="/user/dashboard" />} />
            <Route path="/vote" element={<Navigate to="/user/vote" />} />
            <Route path="/candidates" element={<Navigate to="/user/candidates" />} />
            <Route path="/positions" element={<Navigate to="/admin/positions" />} />
            <Route path="/voters" element={<Navigate to="/admin/voters" />} />
            <Route path="/elections" element={<Navigate to="/admin/elections" />} />

            {/* Catch all - redirect to appropriate login based on stored role */}
            <Route path="*" element={<CatchAllRedirect />} />
          </Routes>
        </div>
      </Router>
      </ElectionProvider>
  );
}

// Component to handle catch-all redirects intelligently
function CatchAllRedirect() {
  const role = getStoredRole();
  
  // If user has admin role, redirect to admin dashboard
  if (role === 'ADMIN' || role === 'SUPERADMIN') {
    return <Navigate to="/admin/dashboard" />;
  }
  
  // Otherwise redirect to user login
  return <Navigate to="/user-login" />;
}

export default App; 