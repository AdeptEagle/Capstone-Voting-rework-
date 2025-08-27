import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '../services/api';
import { checkCurrentUser } from '../services/auth';

const ElectionContext = createContext();

export const useElection = () => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
};

export const ElectionProvider = ({ children }) => {
  const [activeElection, setActiveElection] = useState(null);
  const [allElections, setAllElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refreshTimeoutRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status first
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3001/auth/status', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  const fetchElectionData = useCallback(async () => {
    // Only fetch if authenticated
    if (!isAuthenticated) {
      console.log('🔒 [ElectionContext] Not authenticated, skipping election data fetch');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 [ElectionContext] Fetching election data...');
      
      // Fetch all elections to check for ended ones
      const allElectionsResponse = await api.get('/elections');
      console.log('📊 [ElectionContext] All elections response:', allElectionsResponse.data);
      setAllElections(allElectionsResponse.data || []);
      
      // Fetch active election (for admin monitoring, includes paused/stopped elections)
      try {
        const activeResponse = await api.get('/elections/active');
        console.log('🎯 [ElectionContext] Active elections response:', activeResponse.data);
        setActiveElection(activeResponse.data);
      } catch (activeError) {
        // No active election found, which is fine
        console.log('ℹ️ [ElectionContext] No active election found:', activeError.message);
        setActiveElection(null);
      }
    } catch (error) {
      console.error('❌ [ElectionContext] Error fetching election data:', error);
      setError('Failed to fetch election status');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshElection = useCallback(() => {
    if (isAuthenticated) {
      fetchElectionData();
    }
  }, [isAuthenticated, fetchElectionData]);

  const triggerImmediateRefresh = useCallback(() => {
    if (!isAuthenticated) {
      console.log('🔒 [ElectionContext] Not authenticated, cannot refresh election data');
      return;
    }
    
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Debounce the refresh to prevent multiple rapid calls
    // Only refresh if not already loading to prevent loops
    if (!loading) {
      refreshTimeoutRef.current = setTimeout(() => {
        fetchElectionData();
      }, 100);
    }
  }, [isAuthenticated, loading]);

  // Single useEffect to handle election data fetching when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔓 [ElectionContext] User authenticated, triggering election data fetch');
      fetchElectionData();
      
      // Refresh election status every 10 seconds for more responsive updates
      const interval = setInterval(fetchElectionData, 10000);
      
      return () => {
        clearInterval(interval);
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
      };
    }
  }, [isAuthenticated]); // Only run when authentication status changes

  // Get user role for permission checks - memoize to prevent unnecessary re-renders
  const userRole = useMemo(() => {
    try {
      return checkCurrentUser().role;
    } catch (error) {
      console.warn('Error getting user role:', error);
      return null;
    }
  }, []);
  
  const isAdmin = useMemo(() => {
    return userRole === 'admin' || userRole === 'superadmin';
  }, [userRole]);

  const value = useMemo(() => ({
    activeElection,
    allElections,
    loading,
    error,
    refreshElection,
    triggerImmediateRefresh,
    hasActiveElection: !!activeElection,
    hasAnyElection: allElections.length > 0,
    hasEndedElection: allElections.some(election => election.status === 'ended'),
    // Fix: Users can vote if there are any active elections, not just if activeElection is set
    canVote: isAdmin ? !!activeElection && activeElection.status === 'active' : allElections.length > 0 && allElections.some(election => election.status === 'active'),
    // Fix: Users can view results if there are any elections (active or ended)
    canViewResults: isAdmin || allElections.length > 0,
    // Fix: Users can view candidates if there are any elections
    canViewCandidates: isAdmin || allElections.length > 0
    // Remove forceRefresh to prevent memory leaks
  }), [activeElection, allElections, loading, error, refreshElection, triggerImmediateRefresh, isAdmin]);

  // Debug logging - only log when values change to prevent spam
  useEffect(() => {
    console.log('🔍 [ElectionContext] Debug Info:', {
      userRole,
      isAdmin,
              activeElection: activeElection ? { id: activeElection.id, status: activeElection.status, title: activeElection.Election_Title } : null,
      allElectionsCount: allElections.length,
              allElectionsStatuses: allElections.map(e => ({ id: e.id, status: e.status, title: e.Election_Title })),
      permissions: {
        canVote: value.canVote,
        canViewCandidates: value.canViewCandidates,
        canViewResults: value.canViewResults,
        hasActiveElection: value.hasActiveElection,
        hasAnyElection: value.hasAnyElection
      }
    });
  }, [userRole, isAdmin, activeElection, allElections, value.canVote, value.canViewCandidates, value.canViewResults, value.hasActiveElection, value.hasAnyElection]);

  return (
    <ElectionContext.Provider value={value}>
      {children}
    </ElectionContext.Provider>
  );
}; 