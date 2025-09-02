import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SuperAdminDashboard.css";

const SuperAdminDashboard = () => {
  const stats = [
    { label: "Admin Accounts", value: 5, icon: "fas fa-users-cog", color: "admin" },
    { label: "Positions", value: 8, icon: "fas fa-briefcase", color: "position" },
    { label: "Candidates", value: 20, icon: "fas fa-user-tie", color: "candidate" },
    { label: "Voters", value: 150, icon: "fas fa-user-friends", color: "voter" },
    { label: "Votes Cast", value: 120, icon: "fas fa-vote-yea", color: "vote" },
  ];

  const actions = [
    { label: "Manage Admin", icon: "fas fa-user-shield", color: "admin" },
    { label: "Manage Positions", icon: "fas fa-briefcase", color: "position" },
    { label: "Manage Candidates", icon: "fas fa-user-tie", color: "candidate" },
    { label: "View Results", icon: "fas fa-chart-line", color: "vote" },
  ];

  // State to manage the election status dynamically
  const [electionStatus, setElectionStatus] = useState({
    isActive: true, // Change to 'false' to see the "No Active Election" state
    electionName: "Annual Student Council Election",
    startDate: "September 1, 2025, 9:00 AM",
    endDate: "September 5, 2025, 5:00 PM",
    totalVoters: 150,
    votesCast: 120,
    progress: (120 / 150) * 100,
  });

  const handleRefresh = () => {
    // In a real application, you would make an API call here to fetch the latest data
    console.log("Refreshing election data...");
    // For demonstration, we'll update with a new mock value
    setElectionStatus({
      ...electionStatus,
      votesCast: 125, // Simulating a few more votes
      progress: (125 / 150) * 100,
    });
  };

  // Conditional rendering for the election status body
  const renderElectionBody = () => {
    if (!electionStatus.isActive) {
      return <p className="no-election">⚠️ No Active Election</p>;
    }

    return (
      <div className="active-election-details">
        <h5>{electionStatus.electionName}</h5>
        <div className="status-item">
          <i className="fas fa-clock"></i>
          <p>
            **Start:** {electionStatus.startDate}
          </p>
        </div>
        <div className="status-item">
          <i className="fas fa-hourglass-end"></i>
          <p>
            **End:** {electionStatus.endDate}
          </p>
        </div>
        <div className="status-item">
          <i className="fas fa-users"></i>
          <p>
            **Voters:** {electionStatus.votesCast} / {electionStatus.totalVoters}
          </p>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{ width: `${electionStatus.progress}%` }}
          ></div>
        </div>
        <p className="progress-text">
          {Math.round(electionStatus.progress)}% of voters have cast their vote.
        </p>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h2>Super Admin Panel</h2>
        <p className="text-muted">Full control over all admin accounts and settings.</p>
      </header>

      {/* Stats Cards */}
      <section className="stat-cards-grid">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            <div className="stat-icon">
              <i className={s.icon}></i>
            </div>
            <h3>{s.value}</h3>
            <p>{s.label}</p>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h4>Quick Actions</h4>
        <div className="action-cards-grid">
          {actions.map((a, i) => (
            <div key={i} className={`action-card ${a.color}`}>
              <div className="stat-icon">
                <i className={a.icon}></i>
              </div>
              <p>{a.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Election Status Dashboard */}
      <section className="election-status">
        <h4>Current Ballot / Election Status</h4>
        <div className="status-card">
          <div className="status-header">
            <i className="fas fa-chart-bar"></i>
            <span>Election Status Dashboard</span>
            <button className="refresh-btn" onClick={handleRefresh}>
              Refresh
            </button>
          </div>
          <div className="status-body">
            {renderElectionBody()}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuperAdminDashboard;