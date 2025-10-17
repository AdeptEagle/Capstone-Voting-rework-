import React, { useState, useEffect } from 'react';
import { 
  getBallots, 
  getBallotResults,
  getVotesByBallot 
} from '../../services/api';
import './BallotTraceability.css';

const BallotTraceability = () => {
  const [ballots, setBallots] = useState([]);
  const [selectedBallot, setSelectedBallot] = useState(null);
  const [ballotResults, setBallotResults] = useState(null);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterCandidate, setFilterCandidate] = useState('all');

  useEffect(() => {
    fetchBallots();
  }, []);

  useEffect(() => {
    if (selectedBallot) {
      fetchBallotData();
    }
  }, [selectedBallot]);

  const fetchBallots = async () => {
    try {
      setLoading(true);
      const ballotsData = await getBallots();
      setBallots(ballotsData);
      
      // Auto-select first ballot if available
      if (ballotsData.length > 0) {
        setSelectedBallot(ballotsData[0]);
      }
    } catch (error) {
      console.error('Error fetching ballots:', error);
      setError('Failed to load ballots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBallotData = async () => {
    if (!selectedBallot) return;

    try {
      setLoading(true);
      const [resultsData, votesData] = await Promise.all([
        getBallotResults(selectedBallot.id).catch(() => null),
        getVotesByBallot(selectedBallot.id).catch(() => [])
      ]);
      
      setBallotResults(resultsData);
      
      // Ensure votesData is an array (getVotesByBallot should return an array)
      const votesArray = Array.isArray(votesData) ? votesData : [];
      
      // Debug: Log the votesData structure if it's not an array
      if (!Array.isArray(votesData)) {
        console.warn('⚠️ votesData is not an array:', typeof votesData, votesData);
      }
      
      // No need to filter since getVotesByBallot already returns votes for this ballot
      setVotes(votesArray);
    } catch (error) {
      console.error('Error fetching ballot data:', error);
      setError('Failed to load ballot data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getBallotStatus = (ballot) => {
    const now = new Date();
    const startDate = new Date(ballot.Ballot_StartDate);
    const endDate = new Date(ballot.Ballot_EndDate);

    if (ballot.Ballot_Status === 'CANCELLED') {
      return { status: 'cancelled', color: 'red', text: 'Cancelled' };
    } else if (ballot.Ballot_Status === 'ENDED') {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else if (ballot.Ballot_Status === 'PAUSED') {
      return { status: 'paused', color: 'orange', text: 'Paused' };
    } else if (now < startDate) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else if (now > endDate) {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    } else {
      return { status: 'active', color: 'green', text: 'Active' };
    }
  };

  const getPositionName = (positionId) => {
    if (!selectedBallot || !selectedBallot.ballotPositions) return 'Unknown Position';
    
    const ballotPosition = selectedBallot.ballotPositions.find(
      bp => bp.position.id === positionId
    );
    
    return ballotPosition ? ballotPosition.position.Position_Title : 'Unknown Position';
  };

  const getCandidateName = (candidateId) => {
    if (!selectedBallot || !selectedBallot.ballotCandidates) return 'Unknown Candidate';
    
    const ballotCandidate = selectedBallot.ballotCandidates.find(
      bc => bc.candidate.id === candidateId
    );
    
    return ballotCandidate ? ballotCandidate.candidate.Candidate_Name : 'Unknown Candidate';
  };

  const getFilteredVotes = () => {
    let filtered = votes;

    // Filter by search term (voter name or student ID)
    if (searchTerm) {
      filtered = filtered.filter(vote =>
        vote.voter?.Voter_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.voter?.Voter_StudentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by position
    if (filterPosition !== 'all') {
      filtered = filtered.filter(vote => vote.positionId === filterPosition);
    }

    // Filter by candidate
    if (filterCandidate !== 'all') {
      filtered = filtered.filter(vote => vote.candidateId === filterCandidate);
    }

    return filtered;
  };


  if (loading && ballots.length === 0) {
    return (
      <div className="ballot-traceability-container">
        <div className="loading-message">
          <p>Loading ballots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ballot-traceability-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={fetchBallots} className="btn btn-secondary">
            <i className="fas fa-redo"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (ballots.length === 0) {
    return (
      <div className="ballot-traceability-container">
        <div className="no-ballots">
          <i className="fas fa-inbox"></i>
          <h3>No Ballots Found</h3>
          <p>No ballots have been created yet. Create a ballot to start tracking votes.</p>
        </div>
      </div>
    );
  }

  const filteredVotes = getFilteredVotes();

  return (
    <div className="ballot-traceability-container">
      <div className="traceability-header">
        <h1>Ballot Vote Traceability</h1>
        <p>Track and analyze votes across all ballots</p>
      </div>

      {/* Ballot Selection */}
      <div className="ballot-selection">
        <h2>Select Ballot</h2>
        <div className="ballots-grid">
          {ballots.map(ballot => {
            const status = getBallotStatus(ballot);
            const isSelected = selectedBallot?.id === ballot.id;
            
            return (
              <div 
                key={ballot.id} 
                className={`ballot-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedBallot(ballot)}
              >
                <div className="ballot-header">
                  <h3>{ballot.Ballot_Title}</h3>
                  <span className={`status-badge ${status.color}`}>
                    {status.text}
                  </span>
                </div>
                <div className="ballot-info">
                  <p>Positions: {ballot.ballotPositions?.length || 0}</p>
                  <p>Candidates: {ballot.ballotCandidates?.length || 0}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedBallot && (
        <>
          {/* Statistics */}
          <div className="statistics-section">
            <h2>Vote Statistics - {selectedBallot.Ballot_Title}</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-vote-yea"></i>
                </div>
                <div className="stat-content">
                  <h3>{votes.length}</h3>
                  <p>Total Votes</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <h3>{new Set(votes.map(vote => vote.voterId)).size}</h3>
                  <p>Unique Voters</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-user-tie"></i>
                </div>
                <div className="stat-content">
                  <h3>{selectedBallot.ballotPositions?.length || 0}</h3>
                  <p>Positions</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-user-friends"></i>
                </div>
                <div className="stat-content">
                  <h3>{selectedBallot.ballotCandidates?.length || 0}</h3>
                  <p>Candidates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vote Details with Filters */}
          <div className="votes-section">
            <div className="votes-header">
              <h2>Vote Details ({filteredVotes.length} votes)</h2>
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Search Voter</label>
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      placeholder="Search by name or student ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>Filter by Position</label>
                  <select 
                    value={filterPosition} 
                    onChange={(e) => setFilterPosition(e.target.value)}
                  >
                    <option value="all">All Positions</option>
                    {selectedBallot.ballotPositions?.map(bp => (
                      <option key={bp.position.id} value={bp.position.id}>
                        {bp.position.Position_Title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Filter by Candidate</label>
                  <select 
                    value={filterCandidate} 
                    onChange={(e) => setFilterCandidate(e.target.value)}
                  >
                    <option value="all">All Candidates</option>
                    {selectedBallot.ballotCandidates?.map(bc => (
                      <option key={bc.candidate.id} value={bc.candidate.id}>
                        {bc.candidate.Candidate_Name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {filteredVotes.length === 0 ? (
              <div className="no-votes">
                <i className="fas fa-search"></i>
                <h3>No Votes Found</h3>
                <p>No votes match your current filters.</p>
              </div>
            ) : (
              <div className="votes-table-container">
                <table className="votes-table">
                  <thead>
                    <tr>
                      <th>Vote ID</th>
                      <th>Voter</th>
                      <th>Student ID</th>
                      <th>Position</th>
                      <th>Candidate</th>
                      <th>Vote Time</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVotes.map(vote => (
                      <tr key={vote.id}>
                        <td className="vote-id">{vote.id}</td>
                        <td className="voter-name">{vote.voter?.Voter_Name || 'Unknown'}</td>
                        <td className="student-id">{vote.voter?.Voter_StudentId || 'Unknown'}</td>
                        <td className="position">{getPositionName(vote.positionId)}</td>
                        <td className="candidate">{getCandidateName(vote.candidateId)}</td>
                        <td className="vote-time">{formatDate(vote.createdAt)}</td>
                        <td className="ip-address">{vote.ipAddress || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BallotTraceability;



