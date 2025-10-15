import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getPartylistResults, getUserBallotHistory, getAnalyticsData } from '../../services/api';
import './BallotResults.css';
import './Analytics.css';

const BallotResults = () => {
  const { ballotId } = useParams();
  const navigate = useNavigate();
  const [ballot, setBallot] = useState(null);
  const [results, setResults] = useState(null);
  const [partylistResults, setPartylistResults] = useState(null);
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    fetchBallot();
    fetchResults();
    fetchPartylistResults();
    fetchVotingHistory();
  }, [ballotId]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsData();
    }
  }, [activeTab, ballotId]);

  // Initialize charts when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics' && analytics) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializeAnalyticsCharts();
      }, 100);

      return () => {
        clearTimeout(timer);
        // Cleanup charts when component unmounts or tab changes
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
            // Silently handle chart destruction errors
          }
          window.departmentParticipationChart = null;
        }
      };
    }
  }, [activeTab, analytics]);

  // Animate progress bars after results are loaded
  useEffect(() => {
    if (results) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        setTimeout(() => {
          const progressBars = document.querySelectorAll('.progress-fill');
          
          if (progressBars.length === 0) {
            // Retry after a longer delay
            setTimeout(() => {
              const retryBars = document.querySelectorAll('.progress-fill');
              animateProgressBars(retryBars);
            }, 2000);
            return;
          }
          
          animateProgressBars(progressBars);
        }, 500);
      });
    }
  }, [results]);

  const animateProgressBars = (bars) => {
    bars.forEach((bar) => {
      const percent = bar.getAttribute('data-percent');
      
      if (percent && percent !== '0' && percent !== '0.0') {
        // Reset to 0 first
        bar.style.width = '0%';
        bar.style.transition = 'none';
        
        // Force a reflow
        bar.offsetHeight;
        
        // Animate to target width
        setTimeout(() => {
          bar.style.transition = 'width 1s ease-in-out';
          bar.style.width = `${percent}%`;
        }, 100);
      }
    });
  };

  useEffect(() => {
    let interval;
    if (autoRefresh && ballot?.Ballot_Status === 'ACTIVE') {
      interval = setInterval(() => {
        fetchResults();
        fetchPartylistResults();
        fetchVotingHistory();
      }, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, ballot?.Ballot_Status]);

  const fetchBallot = async () => {
    try {
      const response = await api.get(`/ballots/${ballotId}`);
      setBallot(response.data);
    } catch (err) {
      console.error('Error fetching ballot:', err);
      setError('Failed to load ballot information');
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ballots/${ballotId}/results`);
      setResults(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartylistResults = async () => {
    try {
      const response = await getPartylistResults(ballotId);
      setPartylistResults(response);
    } catch (err) {
      console.error('Error fetching partylist results:', err);
      // Don't set error state for partylist results as it's optional
    }
  };

  const fetchVotingHistory = async () => {
    try {
      const response = await getUserBallotHistory();
      setVotingHistory(response);
    } catch (err) {
      console.error('Error fetching voting history:', err);
      setVotingHistory([]);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await getAnalyticsData(ballotId, 'all');
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const initializeAnalyticsCharts = () => {
    if (typeof window.Chart === 'undefined') {
      setTimeout(() => initializeAnalyticsCharts(), 500);
      return;
    }

    if (!analytics || !analytics.departmentAnalytics || analytics.departmentAnalytics.length === 0) {
      return;
    }

    createAnalyticsChartsWithData(analytics.departmentAnalytics, analytics.userDepartmentVoting);
  };

  const createAnalyticsChartsWithData = (departmentData, userDepartmentData) => {
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
        // Silently handle chart destruction errors
      }
      window.departmentParticipationChart = null;
    }

    // Create department votes chart (showing all departments that have voters who voted)
    const votesCtx = document.getElementById('departmentVotesChart');
    if (votesCtx) {
      try {
        // Clear any existing chart on the canvas
        const existingChart = Chart.getChart(votesCtx);
        if (existingChart) {
          existingChart.destroy();
        }

        // Use system-wide department data (grouped by voter's department)
        const chartData = departmentData && departmentData.length > 0 ? departmentData : [];
        
        if (chartData.length === 0) {
          // Show placeholder message
          votesCtx.style.display = 'none';
          const placeholder = votesCtx.parentNode.querySelector('.chart-placeholder') || 
            votesCtx.parentNode.appendChild(document.createElement('div'));
          placeholder.className = 'chart-placeholder';
          placeholder.innerHTML = '<p>No department voting data available</p>';
          placeholder.style.display = 'flex';
        } else {
          // Hide placeholder and show chart
          const placeholder = votesCtx.parentNode.querySelector('.chart-placeholder');
          if (placeholder) placeholder.style.display = 'none';
          votesCtx.style.display = 'block';

          window.departmentVotesChart = new Chart(votesCtx, {
            type: 'bar',
            data: {
              labels: chartData.map(dept => dept.departmentName),
              datasets: [{
                label: 'Votes Cast',
                data: chartData.map(dept => dept.votesCast),
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
        }
      } catch (error) {
        console.error('Error creating votes bar chart:', error);
      }
    }

    // Create department participation chart (system-wide data)
    const participationCtx = document.getElementById('departmentParticipationChart');
    if (participationCtx) {
      try {
        // Clear any existing chart on the canvas
        const existingChart = Chart.getChart(participationCtx);
        if (existingChart) {
          existingChart.destroy();
        }

        // Filter department data to only include departments with votes
        const departmentsWithVotes = departmentData.filter(dept => dept.votesCast > 0);
        
        if (departmentsWithVotes.length === 0) {
          // Show placeholder if no departments have votes
          participationCtx.style.display = 'none';
          const placeholder = participationCtx.parentNode.querySelector('.chart-placeholder') || 
            participationCtx.parentNode.appendChild(document.createElement('div'));
          placeholder.className = 'chart-placeholder';
          placeholder.innerHTML = '<p>No department participation data available</p>';
          placeholder.style.display = 'flex';
        } else {
          // Hide placeholder and show chart
          const placeholder = participationCtx.parentNode.querySelector('.chart-placeholder');
          if (placeholder) placeholder.style.display = 'none';
          participationCtx.style.display = 'block';

          window.departmentParticipationChart = new Chart(participationCtx, {
            type: 'doughnut',
            data: {
              labels: departmentsWithVotes.map(dept => dept.departmentName),
              datasets: [{
                data: departmentsWithVotes.map(dept => dept.votesCast),
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
        }
      } catch (error) {
        console.error('Error creating participation doughnut chart:', error);
      }
    }
  };

  const hasVoted = () => {
    return votingHistory.some(h => 
      h.UserBallotHistory_BallotId === ballotId && 
      h.UserBallotHistory_IsCompleted
    );
  };

  const getBallotStatus = () => {
    if (!ballot) return { status: 'loading', text: 'Loading...', color: 'gray' };
    
    const now = new Date();
    const startDate = new Date(ballot.Ballot_StartDate);
    const endDate = new Date(ballot.Ballot_EndDate);

    console.log('🔍 BallotResults getBallotStatus debug:', {
      ballotStatus: ballot.Ballot_Status,
      isActive: ballot.Ballot_IsActive,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      now: now.toISOString()
    });

    // Check ballot status first - this takes precedence
    if (ballot.Ballot_Status === 'CANCELLED') {
      return { status: 'cancelled', text: 'Cancelled', color: 'red' };
    } else if (ballot.Ballot_Status === 'ENDED') {
      return { status: 'ended', text: 'Ended', color: 'red' };
    } else if (ballot.Ballot_Status === 'PAUSED') {
      return { status: 'paused', text: 'Paused', color: 'orange' };
    } else if (ballot.Ballot_Status === 'ACTIVE') {
      return { status: 'active', text: 'Active', color: 'green' };
    } else if (ballot.Ballot_Status === 'DRAFT') {
      return { status: 'draft', text: 'Draft', color: 'gray' };
    } else if (ballot.Ballot_Status === 'SCHEDULED') {
      return { status: 'scheduled', text: 'Scheduled', color: 'blue' };
    }
    
    // If no specific status, check dates
    if (now < startDate) {
      return { status: 'scheduled', text: 'Scheduled', color: 'blue' };
    } else if (now > endDate) {
      return { status: 'ended', text: 'Ended', color: 'red' };
    } else {
      return { status: 'active', text: 'Active', color: 'green' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPositionResults = () => {
    if (!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails)) {
      return [];
    }
    
    // Group result details by position
    const positionGroups = {};
    
    results.results.resultDetails.forEach(detail => {
      const positionId = detail.BallotResultDetails_PositionId;
      if (!positionGroups[positionId]) {
        positionGroups[positionId] = {
          positionId: positionId,
          positionTitle: detail.position?.Position_Title || 'Unknown Position',
          candidates: []
        };
      }
      
      positionGroups[positionId].candidates.push({
        candidateId: detail.BallotResultDetails_CandidateId,
        candidateName: detail.candidate?.Candidate_Name || 'Unknown Candidate',
        voteCount: detail.BallotResultDetails_VoteCount,
        percentage: detail.BallotResultDetails_Percentage,
        rank: detail.BallotResultDetails_Rank
      });
    });
    
    // Convert to array and sort by position display order
    const positionResults = Object.values(positionGroups);
    
    // Sort candidates within each position by vote count (descending) and then by candidate name (ascending)
    positionResults.forEach(position => {
      // Sort candidates by vote count (descending), then by name (ascending) for ties
      position.candidates.sort((a, b) => {
        if (b.voteCount !== a.voteCount) {
          return b.voteCount - a.voteCount;
        }
        return a.candidateName.localeCompare(b.candidateName);
      });
      
      // Assign proper ranks - handle ties correctly
      let currentRank = 1;
      let previousVoteCount = null;
      
      position.candidates.forEach((candidate, index) => {
        if (previousVoteCount !== null && candidate.voteCount !== previousVoteCount) {
          // Only increment rank when vote count changes
          currentRank = index + 1;
        }
        candidate.rank = currentRank;
        previousVoteCount = candidate.voteCount;
      });
    });
    
    positionResults.sort((a, b) => {
      const aOrder = results.ballotPositions?.find(p => p.BallotPosition_PositionId === a.positionId)?.BallotPosition_DisplayOrder || 0;
      const bOrder = results.ballotPositions?.find(p => p.BallotPosition_PositionId === b.positionId)?.BallotPosition_DisplayOrder || 0;
      return aOrder - bOrder;
    });
    
    return positionResults;
  };

  const getPositionResultsForPosition = (positionId) => {
    if (!results?.results?.resultDetails) return [];
    
    return results.results.resultDetails
      .filter(detail => detail.BallotResultDetails_PositionId === positionId)
      .map(detail => {
        const candidateName = detail.candidate?.Candidate_Name || 'Unknown Candidate';
        
        return {
          candidateId: detail.BallotResultDetails_CandidateId,
          candidateName,
          voteCount: detail.BallotResultDetails_VoteCount,
          percentage: detail.BallotResultDetails_Percentage || 0
        };
      })
      .sort((a, b) => b.voteCount - a.voteCount);
  };

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
      const positionResults = getPositionResultsForPosition(position.position.id);
      const totalPositionVotes = positionResults.reduce((sum, result) => sum + result.voteCount, 0);
      
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
    if (!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails)) {
      return 'Unknown Candidate';
    }
    
    const candidateDetail = results.results.resultDetails.find(
      detail => detail.BallotResultDetails_CandidateId === candidateId
    );
    
    return candidateDetail?.candidate?.Candidate_Name || 'Unknown Candidate';
  };

  const getPositionTitle = (positionId) => {
    if (!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails)) {
      console.log('BallotResults: getPositionTitle - No results data or resultDetails is not an array');
      return 'Unknown Position';
    }
    
    const positionDetail = results.results.resultDetails.find(
      detail => detail.BallotResultDetails_PositionId === positionId
    );
    
    return positionDetail?.position?.Position_Title || 'Unknown Position';
  };

  if (loading) {
    return (
      <div className="ballot-results-container">
        <div className="loading-message">
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ballot-results-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchResults} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="ballot-results-container">
        <div className="loading-message">
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const ballotStatus = getBallotStatus();
  console.log('BallotResults: About to access results.results, results:', results);
  console.log('BallotResults: results.results type:', typeof results?.results);
  console.log('BallotResults: results.results is array:', Array.isArray(results?.results));
  
  const positionIds = (results?.results && Array.isArray(results.results)) 
    ? results.results.map(result => result.positionId) 
    : [];

  // Show loading state if ballot data is not loaded yet
  if (!ballot) {
    return (
      <div className="ballot-results-container">
        <div className="loading-message">
          <i className="fas fa-spinner fa-spin"></i>
          <h3>Loading Ballot Results...</h3>
          <p>Please wait while we fetch the ballot information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ballot-results-container">
      {/* Back to Ballots Button - Top Navigation */}
      <div className="top-navigation">
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/user/ballot-selection')}
        >
          <i className="fas fa-arrow-left"></i>
          Back to Ballots
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <i className="fas fa-chart-bar"></i>
          Results
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <i className="fas fa-chart-line"></i>
          Analytics
        </button>
      </div>

      {activeTab === 'results' && (
        <>
          <div className="results-header">
            <div className="header-content">
              <h1>{ballot.Ballot_Title}</h1>
              {ballot.Ballot_Description && (
                <p className="ballot-description">{ballot.Ballot_Description}</p>
              )}
              <div className="ballot-info">
                <span className={`status-badge ${ballotStatus.color}`}>
                  {ballotStatus.text}
                </span>
                <span><i className="fas fa-calendar-alt"></i> Ended: {formatDate(ballot.Ballot_EndDate)}</span>
              </div>
            </div>
            
            {ballotStatus.status === 'active' && (
              <div className="auto-refresh-controls">
                <label className="refresh-toggle">
                  <input 
                    type="checkbox" 
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  <span>Auto-refresh</span>
                </label>
                <button 
                  className="btn btn-outline"
                  onClick={fetchResults}
                >
                  <i className="fas fa-sync-alt"></i>
                  Refresh Now
                </button>
              </div>
            )}
          </div>


          <div className="position-results">
            <h2>Results by Position</h2>
        
        {!results || !results.results || !results.results.resultDetails || !Array.isArray(results.results.resultDetails) || results.results.resultDetails.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-chart-bar"></i>
            <h3>No Results Yet</h3>
            <p>Results will appear here once voting begins.</p>
          </div>
        ) : (
          <div className="results-content">
            {/* Results Summary */}
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

            {/* Detailed Position Results - moved to top */}
            <div className="detailed-results-section">
              <h3>Detailed Results by Position</h3>
              <div className="detailed-results-grid">
                {ballot?.ballotPositions?.map(ballotPosition => {
                  const positionResults = getPositionResultsForPosition(ballotPosition.position.id);
                  const totalPositionVotes = positionResults.reduce((sum, result) => sum + result.voteCount, 0);
                  
                  return (
                    <div key={ballotPosition.position.id} className="detailed-result-card">
                      <div className="detailed-result-header">
                        <h4>{ballotPosition.position.Position_Title}</h4>
                        <span className="total-votes">{totalPositionVotes} votes</span>
                      </div>
                      
                      <div className="all-candidates-list">
                        {positionResults.length > 0 ? (
                          positionResults.map((candidate, index) => {
                            const isWinner = index === 0 && candidate.voteCount > 0;
                            return (
                              <div key={candidate.candidateId} className={`candidate-item ${isWinner ? 'winner' : ''}`}>
                                <div className="candidate-details">
                                  <div className="candidate-name">
                                    {isWinner && <i className="fas fa-crown"></i>}
                                    {candidate.candidateName}
                                  </div>
                                  <div className="vote-stats">
                                    <span className="vote-count">{candidate.voteCount} votes</span>
                                    <span className="vote-percentage">{candidate.percentage.toFixed(1)}%</span>
                                  </div>
                                  <div className="progress-bar">
                                    <div 
                                      className="progress-fill"
                                      style={{ 
                                        width: '0%'
                                      }}
                                      data-percent={candidate.percentage}
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
                {ballot?.ballotPositions?.map(ballotPosition => {
                  const positionResults = getPositionResultsForPosition(ballotPosition.position.id);
                  const leadingCandidate = positionResults.length > 0 ? positionResults[0] : null;
                  const totalPositionVotes = positionResults.reduce((sum, result) => sum + result.voteCount, 0);
                  
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
                              {leadingCandidate.candidateName}
                            </div>
                            <div className="vote-stats">
                              <span className="vote-count">{leadingCandidate.voteCount} votes</span>
                              <span className="vote-percentage">{leadingCandidate.percentage.toFixed(1)}%</span>
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
                                backgroundColor: partylist.partylistColor || '#3b82f6'
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
        )}
      </div>

          {ballotStatus.status === 'active' && !hasVoted() && (
            <div className="results-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/user/vote/${ballotId}`)}
              >
                <i className="fas fa-vote-yea"></i>
                Vote Now
              </button>
            </div>
          )}

          {ballotStatus.status === 'active' && hasVoted() && (
            <div className="results-actions">
              <div className="alert alert-success d-flex align-items-center" role="alert">
                <i className="fas fa-check-circle me-2"></i>
                <div>
                  <strong>You have already voted!</strong> Your vote has been recorded.
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-content">
          {analyticsLoading ? (
            <div className="loading-message">
              <i className="fas fa-spinner fa-spin"></i>
              <h3>Loading Analytics...</h3>
              <p>Please wait while we fetch the analytics data.</p>
            </div>
          ) : analytics ? (
            <>
              {/* Position Analytics */}
              <div className="analytics-section">
                <h2><i className="fas fa-user-tie"></i> Position Analytics</h2>
                <div className="position-analytics-grid">
                  {analytics.positionAnalytics?.map((position, index) => (
                    <div key={index} className="position-analytics-card">
                      <div className="position-header">
                        <h4>{position.positionTitle}</h4>
                        <span className="position-status">{position.status}</span>
                      </div>
                      <div className="position-stats">
                        <div className="stat-row">
                          <span>Total Votes:</span>
                          <span className="stat-value">{position.totalVotes}</span>
                        </div>
                        <div className="stat-row">
                          <span>Candidates:</span>
                          <span className="stat-value">{position.candidateCount}</span>
                        </div>
                        {/* Competitiveness metric removed per new spec */}
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
                          {analytics.departmentAnalytics?.map((dept, index) => (
                            <tr key={index}>
                              <td className="dept-name">{dept.departmentName}</td>
                              <td>{dept.registeredVoters.toLocaleString()}</td>
                              <td>{dept.registeredVoters.toLocaleString()}</td>
                              <td>{dept.votesCast.toLocaleString()}</td>
                              <td>
                                <span className={`participation-rate ${dept.participationRate > 80 ? 'high' : dept.participationRate > 60 ? 'medium' : 'low'}`}>
                                  {dept.participationRate.toFixed(1)}%
                                </span>
                              </td>
                              <td>{dept.registeredVoters}</td>
                              <td>{dept.avgVotesPerVoter.toFixed(1)}</td>
                            </tr>
                          ))}
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
                        <h4>{analytics.departmentAnalytics?.reduce((sum, dept) => sum + dept.votesCast, 0).toLocaleString() || 0}</h4>
                        <p>Total Votes Cast</p>
                        <span className="summary-subtitle">Across all departments</span>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon">
                        <i className="fas fa-users"></i>
                      </div>
                      <div className="summary-content">
                        <h4>{analytics.departmentAnalytics?.reduce((sum, dept) => sum + dept.registeredVoters, 0).toLocaleString() || 0}</h4>
                        <p>Registered Students</p>
                        <span className="summary-subtitle">Students eligible to vote</span>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon">
                        <i className="fas fa-percentage"></i>
                      </div>
                      <div className="summary-content">
                        <h4>{analytics.departmentAnalytics?.length > 0 ? 
                          (analytics.departmentAnalytics.reduce((sum, dept) => sum + dept.registeredVoters, 0) / 
                           analytics.departmentAnalytics.reduce((sum, dept) => sum + dept.registeredVoters, 0) * 100).toFixed(1) : '0.0'}%</h4>
                        <p>Overall Participation</p>
                        <span className="summary-subtitle">% of registered who voted</span>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon">
                        <i className="fas fa-building"></i>
                      </div>
                      <div className="summary-content">
                        <h4>{analytics.departmentAnalytics?.length || 0}</h4>
                        <p>Departments</p>
                        <span className="summary-subtitle">Count of departments included</span>
                      </div>
                    </div>
                  </div>

                  {/* Department Votes Chart - Second */}
                  <div className="chart-container">
                    <div className="chart-header">
                      <h4>Votes by Department (Voter's Department)</h4>
                      <button 
                        className="btn btn-sm btn-outline" 
                        onClick={() => initializeAnalyticsCharts()}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <i className="fas fa-sync-alt"></i> Refresh Chart
                      </button>
                    </div>
                    <canvas id="departmentVotesChart" width="800" height="400"></canvas>
                    {(!analytics.departmentAnalytics || analytics.departmentAnalytics.length === 0) && (
                      <div className="chart-placeholder">
                        <p>No department voting data available</p>
                      </div>
                    )}
                  </div>

                  {/* Participation Distribution Chart - Third */}
                  <div className="chart-container">
                    <div className="chart-header">
                      <h4>Participation Distribution</h4>
                      <button 
                        className="btn btn-sm btn-outline" 
                        onClick={() => initializeAnalyticsCharts()}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <i className="fas fa-sync-alt"></i> Refresh Chart
                      </button>
                    </div>
                    <canvas id="departmentParticipationChart" width="600" height="400"></canvas>
                    {(!analytics.departmentAnalytics || analytics.departmentAnalytics.filter(dept => dept.votesCast > 0).length === 0) && (
                      <div className="chart-placeholder">
                        <p>No department participation data available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Partylist Performance */}
              <div className="analytics-section">
                <h2><i className="fas fa-users"></i> Partylist Performance</h2>
                <div className="partylist-performance-grid">
                  {analytics.partylistAnalytics?.map((partylist, index) => (
                    <div key={index} className="partylist-card">
                      <div className="partylist-header">
                        <div className="partylist-info">
                          <h4>{partylist.partylistName}</h4>
                          <span className="partylist-color" style={{ backgroundColor: partylist.color }}></span>
                        </div>
                        <span className="success-rate">{partylist.voteShare.toFixed(1)}%</span>
                      </div>
                      <div className="partylist-metrics">
                        <div className="metric-row">
                          <span>Total Candidates:</span>
                          <span>{partylist.totalCandidates}</span>
                        </div>
                        <div className="metric-row">
                          <span>Winning Candidates:</span>
                          <span>{partylist.winningCandidates}</span>
                        </div>
                        <div className="metric-row">
                          <span>Total Votes Received:</span>
                          <span>{partylist.totalVotes}</span>
                        </div>
                        <div className="metric-row">
                          <span>Vote Share:</span>
                          <span>{partylist.voteShare}%</span>
                        </div>
                        {/* Success Rate removed per new spec - we now use overall Vote Share in header */}
                      </div>
                      <div className="partylist-positions">
                        <h5>Performance by Position:</h5>
                        {partylist.positionPerformance?.map((pos, idx) => (
                          <div key={idx} className="position-performance">
                            <span className="position-name">{pos.positionName}</span>
                            <div className="performance-bar">
                              <div 
                                className="performance-fill" 
                                style={{ width: `${pos.performance}%` }} 
                              ></div>
                            </div>
                            <span className="performance-value">{pos.performance}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>



            </>
          ) : (
            <div className="loading-message">
              <i className="fas fa-chart-line"></i>
              <h3>No Analytics Data</h3>
              <p>Analytics data is not available for this ballot.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BallotResults;