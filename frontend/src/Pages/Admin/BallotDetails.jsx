import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  getBallotById,
  getBallotResults,
  getPartylistResults,
  getAnalyticsData,
  activateBallot,
  pauseBallot,
  endBallot,
  deleteBallot
} from '../../services/api';
import PrintPreview from '../../components/PrintPreview';
import './BallotDetails.css';
import './print-styles.css';

// API base URL for logo paths
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-production-1960.up.railway.app';

const BallotDetails = () => {
  const { ballotId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [ballot, setBallot] = useState(null);
  const [results, setResults] = useState(null);
  const [partylistResults, setPartylistResults] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    fetchBallotData();
    
    // Check for tab query parameter
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab && ['overview', 'positions', 'results'].includes(tab)) {
      setActiveTab(tab);
    }

    // Auto-refresh for ballots that might be auto-started
    const interval = setInterval(() => {
      if (ballot && (ballot.Ballot_Status === 'DRAFT' || ballot.Ballot_Status === 'SCHEDULED')) {
        console.log('🔄 Auto-refreshing ballot data for potential auto-start...');
        fetchBallotData();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [ballotId, location.search, ballot?.Ballot_Status]);

  // Real-time refresh functionality
  useEffect(() => {
    if (autoRefresh && ballot?.Ballot_Status === 'ACTIVE' && activeTab === 'results') {
      const interval = setInterval(() => {
        fetchResults();
        setLastUpdated(new Date());
      }, 5000); // Refresh every 5 seconds
      
      setRefreshInterval(interval);
      
      return () => {
        clearInterval(interval);
        setRefreshInterval(null);
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, ballot?.Ballot_Status, activeTab]);

  // Animate progress bars after results are loaded
  useEffect(() => {
    if (results && activeTab === 'results') {
      const progressBars = document.querySelectorAll('.vote-fill, .trend-bar-fill, .progress-fill');
      
      progressBars.forEach(bar => {
        const percent = bar.getAttribute('data-percent');
        bar.style.width = '0';
        
        setTimeout(() => {
          bar.style.transition = 'width 1s ease-in-out';
          bar.style.width = `${percent}%`;
        }, 100);
      });
    }
  }, [results, activeTab]);

  // Initialize charts when analytics tab is active
  useEffect(() => {
    if (analytics && activeTab === 'analytics' && analytics.departmentAnalytics.length > 0) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializeDepartmentCharts();
      }, 100);

      return () => {
        clearTimeout(timer);
        // Cleanup charts when component unmounts or tab changes
        if (window.departmentVotesChart && typeof window.departmentVotesChart.destroy === 'function') {
          try {
            window.departmentVotesChart.destroy();
          } catch (error) {
            console.log('Error destroying votes chart in cleanup:', error);
          }
          window.departmentVotesChart = null;
        }
        if (window.departmentParticipationChart && typeof window.departmentParticipationChart.destroy === 'function') {
          try {
            window.departmentParticipationChart.destroy();
          } catch (error) {
            console.log('Error destroying participation chart in cleanup:', error);
          }
          window.departmentParticipationChart = null;
        }
      };
    }
  }, [analytics, activeTab]);

  const initializeDepartmentCharts = () => {
    if (typeof window.Chart === 'undefined') {
      setTimeout(() => initializeDepartmentCharts(), 500);
      return;
    }

    // Ensure Chart.js is fully loaded
    if (!window.Chart || typeof window.Chart.getChart !== 'function') {
      setTimeout(() => initializeDepartmentCharts(), 500);
      return;
    }

    if (!analytics || !analytics.departmentAnalytics || analytics.departmentAnalytics.length === 0) {
      return;
    }

    createChartsWithData(analytics.departmentAnalytics);
  };

  const createChartsWithData = (departmentData) => {
    // Destroy existing charts safely
    if (window.departmentVotesChart && typeof window.departmentVotesChart.destroy === 'function') {
      try {
        window.departmentVotesChart.destroy();
      } catch (error) {
        // Silently handle chart destruction errors
      }
      window.departmentVotesChart = null;
    }
    if (window.departmentParticipationChart && typeof window.departmentParticipationChart.destroy === 'function') {
      try {
        window.departmentParticipationChart.destroy();
      } catch (error) {
        console.log('Error destroying participation chart:', error);
      }
      window.departmentParticipationChart = null;
    }
    
    // Wait for DOM elements to be available
    setTimeout(() => {
      // Votes by Department Bar Chart
      const votesCtx = document.getElementById('departmentVotesChart');
      console.log('Votes chart canvas found:', !!votesCtx);
      
      if (votesCtx) {
        try {
          console.log('Creating votes bar chart...');
          // Clear any existing chart on the canvas
          const existingChart = window.Chart.getChart(votesCtx);
          if (existingChart) {
            existingChart.destroy();
          }
          
          window.departmentVotesChart = new window.Chart(votesCtx, {
            type: 'bar',
            data: {
              labels: departmentData.map(dept => dept.departmentName),
              datasets: [{
                label: 'Votes Cast',
                data: departmentData.map(dept => dept.votesCast),
                backgroundColor: '#A7D9F8', // Light pastel blue
                borderColor: '#7DD3FC', // Slightly darker light blue for border
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 60, // Fixed bar thickness for better proportions
                maxBarThickness: 80, // Maximum bar thickness
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false, // Allow chart to fill container
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 0,
                    font: {
                      size: 14
                    }
                  },
                  grid: {
                    display: false
                  }
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    font: {
                      size: 14
                    }
                  },
                  grid: {
                    color: '#f3f4f6'
                  }
                }
              },
              layout: {
                padding: {
                  top: 20,
                  bottom: 20,
                  left: 20,
                  right: 20
                }
              }
            }
          });
          console.log('Votes bar chart created successfully');
        } catch (error) {
          console.error('Error creating votes bar chart:', error);
        }
      } else {
        console.log('Votes chart canvas not found in DOM');
      }

      // Participation Distribution Doughnut Chart
      const participationCtx = document.getElementById('departmentParticipationChart');
      console.log('Participation chart canvas found:', !!participationCtx);
      
      if (participationCtx) {
        try {
          console.log('Creating participation doughnut chart...');
          // Clear any existing chart on the canvas
          const existingChart = window.Chart.getChart(participationCtx);
          if (existingChart) {
            existingChart.destroy();
          }
          
          window.departmentParticipationChart = new window.Chart(participationCtx, {
            type: 'doughnut',
            data: {
              labels: departmentData.map(dept => dept.departmentName),
              datasets: [{
                data: departmentData.map(dept => dept.votesCast),
                backgroundColor: [
                  '#A7D9F8', // Light pastel blue
                  '#F8A5C2', // Light pink/coral
                  '#FFB366', // Light orange
                  '#FFE066', // Light yellow/gold
                  '#7DD3FC', // Light teal/mint
                  '#C4B5FD', // Light purple
                  '#86EFAC'  // Light green
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false, // Allow chart to fill container
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    usePointStyle: true,
                    padding: 25,
                    font: {
                      size: 14
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.parsed;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                      return `${label}: ${value} votes (${percentage}%)`;
                    }
                  }
                }
              },
              cutout: '40%', // Smaller cutout for larger chart area
              animation: {
                animateRotate: true,
                animateScale: true
              }
            }
          });
          console.log('Participation doughnut chart created successfully');
        } catch (error) {
          console.error('Error creating participation doughnut chart:', error);
        }
      } else {
        console.log('Participation chart canvas not found in DOM');
      }
    }, 200);
  };

  const fetchBallotData = async () => {
    try {
      setLoading(true);
      const [ballotData, resultsData, partylistData, analyticsData] = await Promise.all([
        getBallotById(ballotId),
        getBallotResults(ballotId).catch((error) => {
          console.log('Results fetch failed (this is normal if results are not available):', error);
          return null; // Results might not exist yet
        }),
        getPartylistResults(ballotId).catch((error) => {
          console.log('Partylist results fetch failed (this is normal if no partylist data):', error);
          return null; // Partylist results might not exist yet
        }),
        getAnalyticsData(ballotId, 'all').catch((error) => {
          console.log('Analytics fetch failed (this is normal if no analytics data):', error);
          return null; // Analytics might not exist yet
        })
      ]);
      
      setBallot(ballotData);
      setResults(resultsData);
      setPartylistResults(partylistData);
      setAnalytics(analyticsData);
      setLastUpdated(new Date());
      
      // Debug the results data
      // console.log('Results data received:', resultsData);
      // console.log('Partylist results received:', partylistData);
      // console.log('Results type:', typeof resultsData);
      // console.log('Results results property:', resultsData?.results);
      // console.log('Results results length:', resultsData?.results?.length);
    } catch (error) {
      console.error('Error fetching ballot data:', error);
      setError('Failed to load ballot details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const [resultsData, partylistData] = await Promise.all([
        getBallotResults(ballotId),
        getPartylistResults(ballotId).catch((error) => {
          console.log('Partylist results fetch failed:', error);
          return null;
        })
      ]);
      setResults(resultsData);
      setPartylistResults(partylistData);
      setLastUpdated(new Date());
    } catch (error) {
      console.log('Results fetch failed:', error);
    }
  };

  const handleBallotAction = async (action) => {
    try {
      let response;
      switch (action) {
        case 'activate':
          response = await activateBallot(ballotId);
          break;
        case 'pause':
          response = await pauseBallot(ballotId);
          break;
        case 'end':
          response = await endBallot(ballotId);
          break;
        default:
          throw new Error('Invalid action');
      }
      
      setSuccess(`Ballot ${action === 'end' ? 'ended' : action + 'd'} successfully!`);
      fetchBallotData();
    } catch (error) {
      console.error(`Error ${action}ing ballot:`, error);
      
      // Get more specific error message
      let errorMessage = `Failed to ${action} ballot. Please try again.`;
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = `Cannot ${action} ballot. The ballot may not be in the correct state.`;
      } else if (error.response?.status === 404) {
        errorMessage = 'Ballot not found.';
      }
      
      setError(errorMessage);
    }
  };

  const handleDeleteBallot = async () => {
    if (!window.confirm('Are you sure you want to delete this ballot? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Attempting to delete ballot:', ballotId);
      await deleteBallot(ballotId);
      setSuccess('Ballot deleted successfully!');
      setTimeout(() => {
        navigate('/admin/ballot-management');
      }, 2000);
    } catch (error) {
      console.error('🗑️ Error deleting ballot:', error);
      console.error('🗑️ Error response:', error.response);
      console.error('🗑️ Error status:', error.response?.status);
      console.error('🗑️ Error data:', error.response?.data);
      
      let errorMessage = 'Failed to delete ballot. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this ballot.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBallotStatus = () => {
    if (!ballot) return { status: 'unknown', color: 'gray', text: 'Unknown' };
    
    const now = new Date();
    const startDate = new Date(ballot.Ballot_StartDate);
    const endDate = new Date(ballot.Ballot_EndDate);

    // console.log('🔍 Ballot status debug:', {
    //   ballotStatus: ballot.Ballot_Status,
    //   isActive: ballot.Ballot_IsActive,
    //   startDate: startDate.toISOString(),
    //   endDate: endDate.toISOString(),
    //   now: now.toISOString()
    // });

    // Check ballot status first - this takes precedence
    if (ballot.Ballot_Status === 'CANCELLED') {
      return { status: 'cancelled', color: 'red', text: 'Cancelled' };
    } else if (ballot.Ballot_Status === 'ENDED') {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else if (ballot.Ballot_Status === 'PAUSED') {
      return { status: 'paused', color: 'orange', text: 'Paused' };
    } else if (ballot.Ballot_Status === 'ACTIVE') {
      return { status: 'active', color: 'green', text: 'Active' };
    } else if (ballot.Ballot_Status === 'DRAFT') {
      return { status: 'draft', color: 'gray', text: 'Draft' };
    } else if (ballot.Ballot_Status === 'SCHEDULED') {
      return { status: 'scheduled', color: 'blue', text: 'Scheduled' };
    }
    
    // If no specific status, check dates
    if (now < startDate) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else if (now > endDate) {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else {
      return { status: 'active', color: 'green', text: 'Active' };
    }
  };

  const getPositionResults = (positionId) => {
    if (!results || !results.results?.resultDetails) return [];
    
    return results.results.resultDetails
      .filter(detail => detail.BallotResultDetails_PositionId === positionId)
      .sort((a, b) => a.BallotResultDetails_Rank - b.BallotResultDetails_Rank);
  };

  // Analytics functions
  const getAverageVotesPerPosition = () => {
    if (!ballot?.ballotPositions?.length) return '0';
    const totalVotes = results.results?.BallotResults_TotalVotes || 0;
    return (totalVotes / ballot.ballotPositions.length).toFixed(1);
  };

  const getLeadingPosition = () => {
    if (!ballot?.ballotPositions?.length) return 'N/A';
    
    let maxVotes = 0;
    let leadingPosition = '';
    
    ballot.ballotPositions.forEach(position => {
      const positionResults = getPositionResults(position.position.id);
      const totalPositionVotes = positionResults.reduce((sum, result) => sum + result.BallotResultDetails_VoteCount, 0);
      
      if (totalPositionVotes > maxVotes) {
        maxVotes = totalPositionVotes;
        leadingPosition = position.position.Position_Title;
      }
    });
    
    return leadingPosition || 'N/A';
  };

  const getVoteDistribution = () => {
    if (!results?.results?.resultDetails?.length) return 'N/A';
    
    const allVotes = results.results.resultDetails.map(detail => detail.BallotResultDetails_VoteCount);
    const maxVotes = Math.max(...allVotes);
    const minVotes = Math.min(...allVotes);
    const spread = maxVotes - minVotes;
    
    if (spread === 0) return 'Even';
    if (spread <= 2) return 'Close';
    if (spread <= 5) return 'Moderate';
    return 'Wide';
  };

  const getVotingActivity = () => {
    // This would ideally come from vote timestamps, but we'll simulate based on current time
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 9 && hour <= 11) return 'Morning Peak';
    if (hour >= 14 && hour <= 16) return 'Afternoon Peak';
    if (hour >= 19 && hour <= 21) return 'Evening Peak';
    return 'Off-Peak';
  };

  const getCandidateName = (candidateId) => {
    if (!ballot || !ballot.ballotCandidates) return 'Unknown Candidate';
    
    const ballotCandidate = ballot.ballotCandidates.find(
      bc => bc.candidate.id === candidateId
    );
    
    return ballotCandidate ? ballotCandidate.candidate.Candidate_Name : 'Unknown Candidate';
  };

  if (loading) {
    return (
      <div className="ballot-details-container">
        <div className="loading-message">
          <p>Loading ballot details...</p>
        </div>
      </div>
    );
  }

  if (error && !ballot) {
    return (
      <div className="ballot-details-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => navigate('/admin/ballot-management')} className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i>
            Back to Ballots
          </button>
        </div>
      </div>
    );
  }

  if (!ballot) {
    return (
      <div className="ballot-details-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Ballot not found</span>
        </div>
      </div>
    );
  }

  const ballotStatus = getBallotStatus();

  return (
    <div className="ballot-details-container">
      <div className="ballot-details-header">
        <div className="header-content">
          <button 
            className="btn btn-outline back-btn"
            onClick={() => navigate('/admin/ballot-management')}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Ballots
          </button>
          
          <div className="ballot-title-section">
            <h1>{ballot.Ballot_Title}</h1>
            <span className={`status-badge ${ballotStatus.color}`}>
              {ballotStatus.text}
            </span>
            <button 
              className="btn btn-outline btn-sm refresh-btn"
              onClick={fetchBallotData}
              title="Refresh ballot data"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
          
          {ballot.Ballot_Description && (
            <p className="ballot-description">{ballot.Ballot_Description}</p>
          )}
        </div>
        
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-info-circle"></i>
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'positions' ? 'active' : ''}`}
          onClick={() => setActiveTab('positions')}
        >
          <i className="fas fa-user-tie"></i>
          Positions & Candidates
        </button>
        <button 
          className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <i className="fas fa-chart-bar"></i>
          Results
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <i className="fas fa-chart-line"></i>
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-content">
              {/* Ballot Information Card */}
              <div className="info-card">
                <div className="info-card-header">
                  <h3>Ballot Information</h3>
                </div>
                <div className="info-card-content">
                  <div className="info-grid">
                    <div className="info-column">
                      <div className="info-field">
                        <p className="info-label">Start Date</p>
                        <p className="info-value">{formatDate(ballot.Ballot_StartDate)}</p>
                      </div>
                      <div className="info-field">
                        <p className="info-label">End Date</p>
                        <p className="info-value">{formatDate(ballot.Ballot_EndDate)}</p>
                      </div>
                    </div>
                    <div className="info-column">
                      <div className="info-field">
                        <p className="info-label">Positions</p>
                        <p className="info-value">{ballot.ballotPositions?.length || 0}</p>
                      </div>
                      <div className="info-field">
                        <p className="info-label">Candidates</p>
                        <p className="info-value">{ballot.ballotCandidates?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voting Rules Card */}
              <div className="info-card">
                <div className="info-card-header">
                  <h3>Voting Rules</h3>
                </div>
                <div className="info-card-content">
                  <div className="info-grid">
                    <div className="info-column">
                      <div className="info-field">
                        <p className="info-label">Max Votes Per User</p>
                        <p className="info-value">{ballot.Ballot_MaxVotesPerUser}</p>
                      </div>
                      <div className="info-field">
                        <p className="info-label">Allow Multiple Votes</p>
                        <p className="info-value">{ballot.Ballot_AllowMultipleVotes ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <div className="info-column">
                      <div className="info-field">
                        <p className="info-label">Require All Positions</p>
                        <p className="info-value">{ballot.Ballot_RequireAllPositions ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Settings Card */}
              <div className="info-card">
                <div className="info-card-header">
                  <h3>Results Settings</h3>
                </div>
                <div className="info-card-content">
                  <div className="info-grid">
                    <div className="info-column">
                      <div className="info-field">
                        <p className="info-label">Show Results</p>
                        <p className="info-value">{ballot.Ballot_ShowResults ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="info-field">
                        <p className="info-label">Live Results</p>
                        <p className="info-value">{ballot.Ballot_ShowLiveResults ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    {ballot.Ballot_ShowResultsAfter && (
                      <div className="info-column">
                        <div className="info-field">
                          <p className="info-label">Show After</p>
                          <p className="info-value">{formatDate(ballot.Ballot_ShowResultsAfter)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons-section">
                {(ballotStatus.status === 'upcoming' || ballotStatus.status === 'draft') && (
                  <button 
                    className="btn btn-success action-btn"
                    onClick={() => handleBallotAction('activate')}
                  >
                    <i className="fas fa-play"></i>
                    Activate Ballot
                  </button>
                )}

                {ballotStatus.status === 'active' && (
                  <>
                    <button 
                      className="btn btn-warning action-btn"
                      onClick={() => handleBallotAction('pause')}
                    >
                      <i className="fas fa-pause"></i>
                      Pause Ballot
                    </button>
                    <button 
                      className="btn btn-danger action-btn"
                      onClick={() => handleBallotAction('end')}
                    >
                      <i className="fas fa-stop"></i>
                      End Ballot
                    </button>
                  </>
                )}

                {ballotStatus.status === 'paused' && (
                  <>
                    <button 
                      className="btn btn-success action-btn"
                      onClick={() => handleBallotAction('activate')}
                    >
                      <i className="fas fa-play"></i>
                      Resume Ballot
                    </button>
                    <button 
                      className="btn btn-danger action-btn"
                      onClick={() => handleBallotAction('end')}
                    >
                      <i className="fas fa-stop"></i>
                      End Ballot
                    </button>
                  </>
                )}
                
                <button 
                  className="btn btn-danger action-btn"
                  onClick={() => handleDeleteBallot()}
                >
                  <i className="fas fa-trash"></i>
                  Delete Ballot
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="positions-tab">
            <div className="positions-list">
              {ballot.ballotPositions?.map((ballotPosition, index) => (
                <div key={ballotPosition.position.id} className="position-card">
                  <div className="position-header">
                    <h3>{ballotPosition.position.Position_Title}</h3>
                    <div className="position-header-right">
                      <span className="vote-limit-text">
                        Vote Limit: {ballotPosition.position.voteLimit || 1}
                      </span>
                      <span className="status-badge active">
                        Active
                      </span>
                    </div>
                  </div>
                  
                  {ballotPosition.position.Position_Description && (
                    <p className="position-description">
                      {ballotPosition.position.Position_Description}
                    </p>
                  )}

                  <div className="candidates-list">
                    <h4>Candidates ({ballot.ballotCandidates?.filter(bc => bc.BallotCandidate_PositionId === ballotPosition.position.id).length || 0})</h4>
                    <div className="candidates-grid">
                      {ballot.ballotCandidates
                        ?.filter(bc => bc.BallotCandidate_PositionId === ballotPosition.position.id)
                        .map(bc => (
                          <div key={bc.candidate.id} className="candidate-item">
                            <div className="candidate-info">
                              <h5>{bc.candidate.Candidate_Name}</h5>
                              <p>{bc.candidate.Candidate_StudentId}</p>
                              {bc.candidate.manifesto && (
                                <p className="manifesto">{bc.candidate.manifesto}</p>
                              )}
                            </div>
                            <div className="candidate-status">
                              <span className={`status ${bc.BallotCandidate_IsActive ? 'active' : 'inactive'}`}>
                                {bc.BallotCandidate_IsActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="results-tab">
            {/* Real-time Controls */}
            <div className="realtime-controls">
              <div className="realtime-header">
                <h3>Live Results</h3>
                <div className="realtime-status">
                  {autoRefresh ? (
                    <span className="status-indicator live">
                      <i className="fas fa-circle"></i>
                      Live Updates
                    </span>
                  ) : (
                    <span className="status-indicator paused">
                      <i className="fas fa-pause-circle"></i>
                      Paused
                    </span>
                  )}
                </div>
              </div>
              
              <div className="realtime-actions">
                <button 
                  className={`realtime-btn ${autoRefresh ? 'active' : ''}`}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  disabled={ballot?.Ballot_Status !== 'ACTIVE'}
                >
                  <i className={`fas ${autoRefresh ? 'fa-pause' : 'fa-play'}`}></i>
                  {autoRefresh ? 'Pause Updates' : 'Start Live Updates'}
                </button>
                
                <button 
                  className="realtime-btn refresh-btn"
                  onClick={fetchResults}
                >
                  <i className="fas fa-sync-alt"></i>
                  Refresh Now
                </button>
                
                {lastUpdated && (
                  <div className="last-updated">
                    <i className="fas fa-clock"></i>
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            {results ? (
              <div className="results-content">
                {/* Print Button - Only show when ballot has ended and there are results */}
                {ballot && ballot.Ballot_Status === 'ENDED' && results && results.results && results.results.resultDetails && results.results.resultDetails.length > 0 && (
                  <div className="print-controls">
                    <button 
                      className="btn btn-primary print-btn"
                      onClick={handlePrint}
                    >
                      <i className="fas fa-print"></i>
                      Print Official Results
                    </button>
                  </div>
                )}

                <div className="results-summary">
                  <div className="summary-card">
                    <div className="summary-icon">
                      <i className="fas fa-vote-yea"></i>
                    </div>
                    <div className="summary-content">
                      <h3>{results.results?.BallotResults_TotalVotes || 0}</h3>
                      <p>Total Votes</p>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon">
                      <i className="fas fa-users"></i>
                    </div>
                    <div className="summary-content">
                      <h3>{results.results?.BallotResults_TotalVoters || 0}</h3>
                      <p>Total Voters</p>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon">
                      <i className="fas fa-percentage"></i>
                    </div>
                    <div className="summary-content">
                      <h3>{results.results?.BallotResults_VoterTurnout ? results.results.BallotResults_VoterTurnout.toFixed(1) : '0.0'}%</h3>
                      <p>Voter Turnout</p>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="summary-content">
                      <h3>{getAverageVotesPerPosition()}</h3>
                      <p>Avg Votes/Position</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Results by Position - moved to top */}
                <div className="detailed-results-section">
                  <h3>Detailed Results by Position</h3>
                  <div className="detailed-results-grid">
                    {ballot.ballotPositions?.map(ballotPosition => {
                      const positionResults = getPositionResults(ballotPosition.position.id);
                      const totalPositionVotes = positionResults.reduce((sum, result) => sum + result.BallotResultDetails_VoteCount, 0);
                      
                      return (
                        <div key={ballotPosition.position.id} className="detailed-result-card">
                          <div className="detailed-result-header">
                            <h4>{ballotPosition.position.Position_Title}</h4>
                            <span className="total-votes">{totalPositionVotes} votes</span>
                          </div>
                          
                          <div className="all-candidates-list">
                            {positionResults.length > 0 ? (
                              positionResults.map((result, index) => {
                                const isWinner = index === 0 && result.BallotResultDetails_VoteCount > 0;
                                const percentage = result.BallotResultDetails_Percentage || 0;
                                
                                return (
                                  <div key={result.BallotResultDetails_CandidateId} className={`candidate-item ${isWinner ? 'winner' : ''}`}>
                                    <div className="candidate-details">
                                      <div className="candidate-name">
                                        {isWinner && <i className="fas fa-crown"></i>}
                                        {getCandidateName(result.BallotResultDetails_CandidateId)}
                                      </div>
                                      <div className="vote-stats">
                                        <span className="vote-count">{result.BallotResultDetails_VoteCount} votes</span>
                                        <span className="vote-percentage">{percentage.toFixed(1)}%</span>
                                      </div>
                                      <div className="progress-bar">
                                        <div 
                                          className="progress-fill"
                                          style={{ 
                                            width: '0%'
                                          }}
                                          data-percent={percentage}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="no-candidates">
                                <i className="fas fa-user-slash"></i>
                                <span>No candidates yet</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Leading Candidates Quick Glance - moved below detailed */}
                <div className="leading-candidates-section">
                  <h3>Leading Candidates by Position</h3>
                  <div className="leading-candidates-grid">
                    {ballot.ballotPositions?.map(ballotPosition => {
                      const positionResults = getPositionResults(ballotPosition.position.id);
                      const leadingCandidate = positionResults.length > 0 ? positionResults[0] : null;
                      const totalPositionVotes = positionResults.reduce((sum, result) => sum + result.BallotResultDetails_VoteCount, 0);
                      
                      return (
                        <div key={ballotPosition.position.id} className="leading-candidate-card">
                          <div className="leading-candidate-header">
                            <h4>{ballotPosition.position.Position_Title}</h4>
                            <span className="total-votes">{totalPositionVotes} votes</span>
                          </div>
                          
                          {leadingCandidate ? (
                            <div className="leading-candidate-info">
                              <div className="candidate-details">
                                <div className="candidate-name">
                                  <i className="fas fa-crown"></i>
                                  {getCandidateName(leadingCandidate.BallotResultDetails_CandidateId)}
                                </div>
                                <div className="vote-stats">
                                  <span className="vote-count">{leadingCandidate.BallotResultDetails_VoteCount} votes</span>
                                  <span className="vote-percentage">
                                    {leadingCandidate.BallotResultDetails_Percentage ? leadingCandidate.BallotResultDetails_Percentage.toFixed(1) : '0.0'}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="no-candidates">
                              <i className="fas fa-user-slash"></i>
                              <span>No candidates yet</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Partylist Results Section - moved to bottom */}
                {partylistResults && partylistResults.length > 0 && (
                  <div className="partylist-results-section">
                    <h3>Partylist Results</h3>
                    <div className="partylist-results-grid">
                      {partylistResults.map((partylist, index) => (
                        <div key={partylist.partylistId} className="partylist-result-card">
                          <div className="partylist-header">
                            <div className="partylist-logo-container">
                              {partylist.partylistLogo ? (
                                <img 
                                  src={partylist.partylistLogo} 
                                  alt={`${partylist.partylistName} logo`}
                                  className="partylist-logo"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) {
                                      e.target.nextSibling.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div 
                                className="partylist-logo-fallback"
                                style={{ 
                                  display: partylist.partylistLogo ? 'none' : 'flex',
                                  backgroundColor: partylist.partylistColor || '#6c757d'
                                }}
                              >
                                {partylist.partylistName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                              </div>
                            </div>
                            <div className="partylist-info">
                              <h4 className="partylist-name">{partylist.partylistName}</h4>
                              <div className="partylist-rank">
                                <span className="rank-number">#{index + 1}</span>
                                <span className="rank-label">Partylist</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="partylist-stats">
                            <div className="stat-row">
                              <div className="stat-item">
                                <span className="stat-value">{partylist.totalVotes}</span>
                                <span className="stat-label">Total Votes</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-value">{partylist.percentage.toFixed(1)}%</span>
                                <span className="stat-label">Vote Share</span>
                              </div>
                            </div>
                            
                            <div className="stat-row">
                              <div className="stat-item">
                                <span className="stat-value">{partylist.candidateCount}</span>
                                <span className="stat-label">Candidates</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-value">{partylist.averageVotesPerCandidate.toFixed(1)}</span>
                                <span className="stat-label">Avg Votes/Candidate</span>
                              </div>
                            </div>
                            
                            <div className="progress-container">
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill"
                                  style={{ 
                                    width: '0%',
                                    backgroundColor: partylist.partylistColor || '#93c5fd'
                                  }}
                                  data-percent={partylist.percentage}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-results">
                <i className="fas fa-chart-bar"></i>
                <h3>No Results Yet</h3>
                <p>Results will appear here once voting begins and votes are cast.</p>
              </div>
            )}

          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            {analytics ? (
              <div className="analytics-content">

                {/* Position Analytics */}
                <div className="analytics-section">
                  <h3><i className="fas fa-user-tie"></i> Position Analytics</h3>
                  <div className="position-analytics-grid">
                    {Object.values(analytics.positionAnalytics).map((position, index) => (
                      <div key={index} className="position-analytics-card">
                        <h4>{position.positionTitle}</h4>
                        <div className="position-stats">
                          <div className="stat-row">
                            <span>Total Votes:</span>
                            <span>{position.totalVotes || 0}</span>
                          </div>
                          <div className="stat-row">
                            <span>Candidates:</span>
                            <span>{position.candidateCount || 0}</span>
                          </div>
                          {/* Competitiveness metric removed per new spec */}
                        </div>
                        <div className="vote-distribution-section">
                          <div className="vote-distribution-header">Vote Distribution:</div>
                          <div className="vote-distribution">
                            {position.topCandidates?.slice(0, 3).map((candidate, idx) => (
                              <div key={idx} className="candidate-bar">
                                <span className="candidate-name">{candidate.candidateName}</span> : <span className="vote-percentage">{candidate.percentage.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                    {/* Enhanced Department Analytics */}
                {analytics && (
                  <div className="analytics-section">
                    <h3><i className="fas fa-building"></i> Department Performance Analytics</h3>
                    
                    
                    {/* Department Details Table - First */}
                    <div className="department-details-section">
                      <h4>Department Details</h4>
                      <div className="department-table-container">
                        <table className="department-table">
                          <thead>
                            <tr>
                              <th>Department</th>
                              <th>Registered</th>
                              <th>Voted</th>
                              <th>Votes Cast</th>
                              <th>Participation</th>
                              <th>Candidates</th>
                              <th>Avg Votes/Voter</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.departmentAnalytics.filter(dept => dept.votesCast > 0).length > 0 ? (
                              analytics.departmentAnalytics.filter(dept => dept.votesCast > 0).map((dept, index) => (
                                <tr key={index}>
                                  <td className="dept-name">{dept.departmentName}</td>
                                  <td>{(dept.registeredVoters || 0).toLocaleString()}</td>
                                  <td>{Math.round((dept.registeredVoters || 0) * (dept.participationRate || 0) / 100).toLocaleString()}</td>
                                  <td>{(dept.votesCast || 0).toLocaleString()}</td>
                                  <td>
                                    <span className={`participation-rate ${(dept.participationRate || 0) > 80 ? 'high' : (dept.participationRate || 0) > 60 ? 'medium' : 'low'}`}>
                                      {(dept.participationRate || 0).toFixed(1)}%
                                    </span>
                                  </td>
                                  <td>{dept.registeredVoters || 0}</td>
                                  <td>{(dept.avgVotesPerVoter || 0).toFixed(1)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                  No department voting activity found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Department Summary Cards */}
                    <div className="department-summary-cards">
                      <div className="summary-card">
                        <div className="summary-icon">
                          <i className="fas fa-vote-yea"></i>
                        </div>
                        <div className="summary-content">
                          <h4>{analytics.departmentAnalytics.filter(dept => dept.votesCast > 0).reduce((sum, dept) => sum + (dept.votesCast || 0), 0).toLocaleString()}</h4>
                          <p>Total Votes Cast</p>
                          <span className="summary-subtitle">Across all departments</span>
                        </div>
                      </div>
                      <div className="summary-card">
                        <div className="summary-icon">
                          <i className="fas fa-users"></i>
                        </div>
                        <div className="summary-content">
                          <h4>{analytics.departmentAnalytics.filter(dept => dept.votesCast > 0).reduce((sum, dept) => sum + (dept.registeredVoters || 0), 0).toLocaleString()}</h4>
                          <p>Registered Students</p>
                          <span className="summary-subtitle">Students eligible to vote</span>
                        </div>
                      </div>
                      <div className="summary-card">
                        <div className="summary-icon">
                          <i className="fas fa-percentage"></i>
                        </div>
                        <div className="summary-content">
                          <h4>{(() => {
                            const activeDepts = analytics.departmentAnalytics.filter(dept => dept.votesCast > 0);
                            if (activeDepts.length === 0) return '0.0';
                            const totalRegistered = activeDepts.reduce((sum, dept) => sum + (dept.registeredVoters || 0), 0);
                            const totalVoted = activeDepts.reduce((sum, dept) => sum + Math.round((dept.registeredVoters || 0) * (dept.participationRate || 0) / 100), 0);
                            return totalRegistered > 0 ? ((totalVoted / totalRegistered) * 100).toFixed(1) : '0.0';
                          })()}%</h4>
                          <p>Overall Participation</p>
                          <span className="summary-subtitle">% of registered who voted</span>
                        </div>
                      </div>
                      <div className="summary-card">
                        <div className="summary-icon">
                          <i className="fas fa-building"></i>
                        </div>
                        <div className="summary-content">
                          <h4>{analytics.departmentAnalytics.filter(dept => dept.votesCast > 0).length}</h4>
                          <p>Departments</p>
                          <span className="summary-subtitle">Count of departments included</span>
                        </div>
                      </div>
                    </div>

                    {/* Votes by Department Chart - Second */}
                    <div className="chart-container">
                      <div className="chart-header">
                        <h4>Votes by Department</h4>
                        <button 
                          className="btn btn-sm btn-outline" 
                          onClick={() => initializeDepartmentCharts()}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          <i className="fas fa-sync-alt"></i> Refresh Chart
                        </button>
                      </div>
                      <canvas id="departmentVotesChart" width="800" height="400"></canvas>
                      {analytics.departmentAnalytics.filter(dept => dept.votesCast > 0).length === 0 && (
                        <div className="chart-placeholder">
                          <p>No department voting activity found</p>
                        </div>
                      )}
                    </div>

                    {/* Participation Distribution Chart - Third */}
                    <div className="chart-container">
                      <div className="chart-header">
                        <h4>Participation Distribution</h4>
                        <button 
                          className="btn btn-sm btn-outline" 
                          onClick={() => initializeDepartmentCharts()}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          <i className="fas fa-sync-alt"></i> Refresh Chart
                        </button>
                      </div>
                      <canvas id="departmentParticipationChart" width="600" height="400"></canvas>
                      {analytics.departmentAnalytics.filter(dept => dept.votesCast > 0).length === 0 && (
                        <div className="chart-placeholder">
                          <p>No department voting activity found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Partylist Performance */}
                {analytics.partylistAnalytics && analytics.partylistAnalytics.length > 0 && (
                  <div className="analytics-section">
                    <h2><i className="fas fa-users"></i> Partylist Performance</h2>
                    <div className="partylist-performance-grid">
                      {analytics.partylistAnalytics.map((partylist, index) => (
                        <div key={index} className="partylist-card">
                          <div className="partylist-header">
                            <div className="partylist-info">
                              <h4>{partylist.partylistName}</h4>
                              <span className="partylist-color" style={{ backgroundColor: partylist.partylistColor || partylist.color || '#6c757d' }}></span>
                            </div>
                            <span className="success-rate">{(partylist.voteShare || 0).toFixed(1)}%</span>
                          </div>
                          <div className="partylist-metrics">
                            <div className="metric-row">
                              <span>Total Candidates:</span>
                              <span>{partylist.uniqueCandidates || partylist.totalCandidates || 0}</span>
                            </div>
                            <div className="metric-row">
                              <span>Winning Candidates:</span>
                              <span>{partylist.winningCandidates || 0}</span>
                            </div>
                            <div className="metric-row">
                              <span>Total Votes Received:</span>
                              <span>{partylist.totalVotes || 0}</span>
                            </div>
                            <div className="metric-row">
                              <span>Vote Share:</span>
                              <span>{(partylist.voteShare || 0).toFixed(1)}%</span>
                            </div>
                            {/* Success Rate removed to match user analytics; header shows Vote Share */}
                          </div>
                          <div className="partylist-positions">
                            <h5>Performance by Position:</h5>
                            {(partylist.positionPerformance || []).map((pos, idx) => (
                              <div key={idx} className="position-performance">
                                <span className="position-name">{pos.positionName}</span>
                                <div className="performance-bar">
                                  <div 
                                    className="performance-fill" 
                                    style={{ width: `${pos.performance || 0}%` }} 
                                  ></div>
                                </div>
                                <span className="performance-value">{(pos.performance || 0).toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voting Patterns and Time Analytics sections removed */}
              </div>
            ) : (
              <div className="analytics-loading">
                <i className="fas fa-chart-line fa-spin"></i>
                <h3>Loading Analytics...</h3>
                <p>Calculating comprehensive voting insights</p>
              </div>
            )}
          </div>
        )}


        {/* Print Preview Component */}
        <PrintPreview ballot={ballot} results={results} />
      </div>
    </div>
  );
};

export default BallotDetails;

