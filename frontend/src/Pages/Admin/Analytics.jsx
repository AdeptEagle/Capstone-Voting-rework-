import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalyticsData } from '../../services/api';
import './Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedBallot, setSelectedBallot] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange, selectedBallot]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await getAnalyticsData(selectedBallot, selectedTimeRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/admin-login');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading Analytics</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={fetchAnalyticsData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1><i className="fas fa-chart-line"></i> Election Analytics Dashboard</h1>
            <p className="text-muted">Comprehensive analysis of voting patterns and performance metrics</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => navigate('/admin')}>
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="analytics-filters">
        <div className="row">
          <div className="col-md-4">
            <label className="form-label">Time Range:</label>
            <select 
              className="form-select" 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Ballot:</label>
            <select 
              className="form-select" 
              value={selectedBallot} 
              onChange={(e) => setSelectedBallot(e.target.value)}
            >
              <option value="all">All Ballots</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Actions:</label>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={fetchAnalyticsData}>
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
              <button className="btn btn-success" onClick={() => window.print()}>
                <i className="fas fa-print"></i> Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {analytics && (
        <div className="analytics-content">
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
                    <div className="stat-row">
                      <span>Competitiveness:</span>
                      <span className={`competitiveness ${position.competitiveness > 70 ? 'high' : position.competitiveness > 40 ? 'medium' : 'low'}`}>
                        {position.competitiveness}%
                      </span>
                    </div>
                    <div className="stat-row">
                      <span>Vote Distribution:</span>
                      <div className="vote-distribution">
                        {position.topCandidates?.slice(0, 3).map((candidate, idx) => (
                          <div key={idx} className="candidate-bar">
                            <span className="candidate-name">{candidate.candidateName}</span>
                            <div className="vote-bar">
                              <div 
                                className="vote-fill" 
                                style={{ width: `${candidate.percentage}%` }}
                              ></div>
                            </div>
                            <span className="vote-count">{candidate.votes} ({candidate.percentage.toFixed(1)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Performance Analysis */}
          <div className="analytics-section">
            <h2><i className="fas fa-building"></i> Department Performance Analysis</h2>
            <div className="department-performance-grid">
              {analytics.departmentAnalytics?.map((dept, index) => (
                <div key={index} className="department-card">
                  <div className="department-header">
                    <h4>{dept.departmentName}</h4>
                    <span className="participation-rate">{dept.participationRate}%</span>
                  </div>
                  <div className="department-metrics">
                    <div className="metric-row">
                      <span>Registered Voters:</span>
                      <span>{dept.registeredVoters}</span>
                    </div>
                    <div className="metric-row">
                      <span>Votes Cast:</span>
                      <span>{dept.votesCast}</span>
                    </div>
                    <div className="metric-row">
                      <span>Participation Rate:</span>
                      <span className={`participation ${dept.participationRate > 80 ? 'high' : dept.participationRate > 60 ? 'medium' : 'low'}`}>
                        {dept.participationRate}%
                      </span>
                    </div>
                    <div className="metric-row">
                      <span>Avg. Votes per Voter:</span>
                      <span>{dept.avgVotesPerVoter}</span>
                    </div>
                    <div className="metric-row">
                      <span>Top Performing Position:</span>
                      <span>{dept.topPosition}</span>
                    </div>
                  </div>
                  <div className="department-chart">
                    <canvas id={`dept-chart-${index}`} width="300" height="150"></canvas>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                    <span className="success-rate">{partylist.successRate}%</span>
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
                    <div className="metric-row">
                      <span>Success Rate:</span>
                      <span className={`success ${partylist.successRate > 70 ? 'high' : partylist.successRate > 40 ? 'medium' : 'low'}`}>
                        {partylist.successRate}%
                      </span>
                    </div>
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

          {/* Voting Patterns */}
          <div className="analytics-section">
            <h2><i className="fas fa-chart-area"></i> Voting Patterns</h2>
            <div className="voting-patterns-grid">
              <div className="pattern-card">
                <h4>Peak Voting Hours</h4>
                <div className="hourly-chart">
                  <canvas id="hourly-voting-chart" width="400" height="200"></canvas>
                </div>
                <div className="peak-hours">
                  {analytics.votingPatterns?.peakHours?.map((hour, index) => (
                    <div key={index} className="peak-hour">
                      <span>{hour.hour}:00</span>
                      <span>{hour.votes} votes</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pattern-card">
                <h4>Voting Behavior Trends</h4>
                <div className="behavior-metrics">
                  <div className="behavior-stat">
                    <span>Early Voters:</span>
                    <span>{analytics.votingPatterns?.earlyVoters}%</span>
                  </div>
                  <div className="behavior-stat">
                    <span>Last-Minute Voters:</span>
                    <span>{analytics.votingPatterns?.lastMinuteVoters}%</span>
                  </div>
                  <div className="behavior-stat">
                    <span>Mobile Users:</span>
                    <span>{analytics.votingPatterns?.mobileUsers}%</span>
                  </div>
                  <div className="behavior-stat">
                    <span>Desktop Users:</span>
                    <span>{analytics.votingPatterns?.desktopUsers}%</span>
                  </div>
                </div>
              </div>

              <div className="pattern-card">
                <h4>Vote Distribution by Time</h4>
                <div className="time-distribution-chart">
                  <canvas id="time-distribution-chart" width="400" height="200"></canvas>
                </div>
              </div>
            </div>
          </div>

          {/* Time Analytics */}
          <div className="analytics-section">
            <h2><i className="fas fa-clock"></i> Time Analytics</h2>
            <div className="time-analytics-grid">
              <div className="time-card">
                <h4>Voting Timeline</h4>
                <div className="timeline-chart">
                  <canvas id="timeline-chart" width="500" height="250"></canvas>
                </div>
                <div className="timeline-stats">
                  <div className="timeline-stat">
                    <span>First Vote:</span>
                    <span>{analytics.timeAnalytics?.firstVote}</span>
                  </div>
                  <div className="timeline-stat">
                    <span>Last Vote:</span>
                    <span>{analytics.timeAnalytics?.lastVote}</span>
                  </div>
                  <div className="timeline-stat">
                    <span>Peak Hour:</span>
                    <span>{analytics.timeAnalytics?.peakHour}</span>
                  </div>
                </div>
              </div>

              <div className="time-card">
                <h4>Temporal Patterns</h4>
                <div className="temporal-metrics">
                  <div className="temporal-stat">
                    <span>Daily Average:</span>
                    <span>{analytics.timeAnalytics?.dailyAverage} votes/day</span>
                  </div>
                  <div className="temporal-stat">
                    <span>Hourly Average:</span>
                    <span>{analytics.timeAnalytics?.hourlyAverage} votes/hour</span>
                  </div>
                  <div className="temporal-stat">
                    <span>Weekend vs Weekday:</span>
                    <span>{analytics.timeAnalytics?.weekendRatio}% weekend</span>
                  </div>
                  <div className="temporal-stat">
                    <span>Voting Duration:</span>
                    <span>{analytics.timeAnalytics?.votingDuration} days</span>
                  </div>
                </div>
              </div>

              <div className="time-card">
                <h4>Voting Velocity</h4>
                <div className="velocity-chart">
                  <canvas id="velocity-chart" width="400" height="200"></canvas>
                </div>
                <div className="velocity-stats">
                  <div className="velocity-stat">
                    <span>Fastest Hour:</span>
                    <span>{analytics.timeAnalytics?.fastestHour}</span>
                  </div>
                  <div className="velocity-stat">
                    <span>Slowest Hour:</span>
                    <span>{analytics.timeAnalytics?.slowestHour}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="analytics-section">
            <h2><i className="fas fa-chart-pie"></i> Summary Statistics</h2>
            <div className="summary-grid">
              <div className="summary-card">
                <h4>Overall Performance</h4>
                <div className="summary-metrics">
                  <div className="summary-metric">
                    <span>Total Votes Cast:</span>
                    <span>{analytics.summary?.totalVotes}</span>
                  </div>
                  <div className="summary-metric">
                    <span>Total Voters:</span>
                    <span>{analytics.summary?.totalVoters}</span>
                  </div>
                  <div className="summary-metric">
                    <span>Participation Rate:</span>
                    <span>{analytics.summary?.participationRate}%</span>
                  </div>
                  <div className="summary-metric">
                    <span>Most Competitive Position:</span>
                    <span>{analytics.summary?.mostCompetitivePosition}</span>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <h4>System Performance</h4>
                <div className="summary-metrics">
                  <div className="summary-metric">
                    <span>Average Voting Time:</span>
                    <span>{analytics.summary?.avgVotingTime} minutes</span>
                  </div>
                  <div className="summary-metric">
                    <span>System Uptime:</span>
                    <span>{analytics.summary?.systemUptime}%</span>
                  </div>
                  <div className="summary-metric">
                    <span>Error Rate:</span>
                    <span>{analytics.summary?.errorRate}%</span>
                  </div>
                  <div className="summary-metric">
                    <span>Data Integrity:</span>
                    <span>{analytics.summary?.dataIntegrity}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

