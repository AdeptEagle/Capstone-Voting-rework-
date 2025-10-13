import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '../services/api';
import { checkCurrentUser } from '../services/auth';

const BallotContext = createContext();

export const useBallot = () => {
  const context = useContext(BallotContext);
  if (!context) {
    throw new Error('useBallot must be used within a BallotProvider');
  }
  return context;
};

export const BallotProvider = ({ children }) => {
  const [activeBallot, setActiveBallot] = useState(null);
  const [allBallots, setAllBallots] = useState([]);
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

  const fetchBallotData = useCallback(async () => {
    // Only fetch if authenticated
    if (!isAuthenticated) {
      console.log('🔒 [BallotContext] Not authenticated, skipping ballot data fetch');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // console.log('🔍 [BallotContext] Fetching ballot data...');
      
      // Fetch all ballots to check for ended ones
      const allBallotsResponse = await api.get('/ballots');
      // console.log('📊 [BallotContext] All ballots response:', allBallotsResponse.data);
      setAllBallots(allBallotsResponse.data || []);
      
      // Fetch active ballot (for admin monitoring, includes paused/stopped ballots)
      try {
        const activeResponse = await api.get('/ballots/available');
        // console.log('🎯 [BallotContext] Active ballots response:', activeResponse.data);
        setActiveBallot(activeResponse.data?.[0] || null);
      } catch (activeError) {
        // No active ballot found, which is fine
        // console.log('ℹ️ [BallotContext] No active ballot found:', activeError.message);
        setActiveBallot(null);
      }
    } catch (error) {
      console.error('❌ [BallotContext] Error fetching ballot data:', error);
      setError('Failed to fetch ballot status');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshBallot = useCallback(() => {
    if (isAuthenticated) {
      fetchBallotData();
    }
  }, [isAuthenticated, fetchBallotData]);

  const triggerImmediateRefresh = useCallback(() => {
    if (!isAuthenticated) {
      // console.log('🔒 [BallotContext] Not authenticated, cannot refresh ballot data');
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
        fetchBallotData();
      }, 100);
    }
  }, [isAuthenticated, loading]);

  // Single useEffect to handle ballot data fetching when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // console.log('🔓 [BallotContext] User authenticated, triggering ballot data fetch');
      fetchBallotData();
      
      // Refresh ballot status every 10 seconds for more responsive updates
      const interval = setInterval(fetchBallotData, 10000);
      
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
    return userRole === 'ADMIN' || userRole === 'SUPERADMIN';
  }, [userRole]);

  const value = useMemo(() => ({
    activeBallot,
    allBallots,
    loading,
    error,
    refreshBallot,
    triggerImmediateRefresh,
    hasActiveBallot: !!activeBallot,
    hasAnyBallot: allBallots.length > 0,
    hasEndedBallot: allBallots.some(ballot => ballot.Ballot_Status === 'ENDED'),
    // Fix: Users can vote if there are any active ballots, not just if activeBallot is set
    canVote: isAdmin ? !!activeBallot && activeBallot.Ballot_Status === 'ACTIVE' : allBallots.length > 0 && allBallots.some(ballot => ballot.Ballot_Status === 'ACTIVE'),
    // Fix: Users can view results if there are any ballots (active or ended)
    canViewResults: isAdmin || allBallots.length > 0,
    // Fix: Users can view candidates if there are any ballots
    canViewCandidates: isAdmin || allBallots.length > 0
    // Remove forceRefresh to prevent memory leaks
  }), [activeBallot, allBallots, loading, error, refreshBallot, triggerImmediateRefresh, isAdmin]);

  // Debug logging - only log when values change to prevent spam
  // useEffect(() => {
  //   console.log('🔍 [ElectionContext] Debug Info:', {
  //     userRole,
  //     isAdmin,
  //     activeElection: activeElection ? { id: activeElection.id, status: activeElection.status, title: activeElection.Election_Title } : null,
  //     allElectionsCount: allElections.length,
  //     allElectionsStatuses: allElections.map(e => ({ id: e.id, status: e.status, title: e.Election_Title })),
  //     permissions: {
  //       canVote: value.canVote,
  //       canViewCandidates: value.canViewCandidates,
  //       canViewResults: value.canViewResults,
  //       hasActiveElection: value.hasActiveElection,
  //       hasAnyElection: value.hasAnyElection
  //     }
  //   });
  // }, [userRole, isAdmin, activeElection, allElections, value.canVote, value.canViewCandidates, value.canViewResults, value.hasActiveElection, value.hasAnyElection]);

  return (
    <BallotContext.Provider value={value}>
      {children}
    </BallotContext.Provider>
  );
}; 