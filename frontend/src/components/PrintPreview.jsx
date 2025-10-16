import React from 'react';
import './PrintPreview.css';

// API base URL for logo paths
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-production-1960.up.railway.app';

const PrintPreview = ({ ballot, results }) => {
  if (!ballot || !results || !results.results) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPositionResults = (positionId) => {
    if (!results.results?.resultDetails) return [];
    
    return results.results.resultDetails
      .filter(detail => detail.BallotResultDetails_PositionId === positionId)
      .sort((a, b) => a.BallotResultDetails_Rank - b.BallotResultDetails_Rank);
  };

  return (
    <div className="professional-print-layout print-only">
      <header>
        <img 
          src={`${API_BASE_URL}/api/Logos/BC Logo.png`}
          alt="BC Logo" 
          className="left-logo"
          onError={(e) => {
            console.error('Failed to load BC Logo:', e.target.src);
            e.target.style.display = 'none';
          }}
          onLoad={() => {
            console.log('BC Logo loaded successfully');
          }}
        />
        <h1>Official Election Results</h1>
        <img 
          src={`${API_BASE_URL}/api/Logos/SSC Logo.png`}
          alt="SSC Logo" 
          className="right-logo"
          onError={(e) => {
            console.error('Failed to load SSC Logo:', e.target.src);
            e.target.style.display = 'none';
          }}
          onLoad={() => {
            console.log('SSC Logo loaded successfully');
          }}
        />
      </header>

      <div className="ballot-info">
        <table>
          <tbody>
            <tr>
              <td><strong>Ballot Name:</strong> {ballot.Ballot_Title}</td>
              <td><strong>Ballot ID:</strong> {ballot.id}</td>
            </tr>
            <tr>
              <td><strong>Start Date:</strong> {formatDate(ballot.Ballot_StartDate)}</td>
              <td><strong>End Date:</strong> {formatDate(ballot.Ballot_EndDate)}</td>
            </tr>
            <tr>
              <td><strong>Total Voters:</strong> {results.results?.BallotResults_TotalVoters || 0}</td>
              <td><strong>Total Votes Cast:</strong> {results.results?.BallotResults_TotalVotes || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="summary-box">
        <span>Voter Turnout: {results.results?.BallotResults_VoterTurnout ? results.results.BallotResults_VoterTurnout.toFixed(1) : '0.0'}%</span>
        <span>Average Votes per Position: {ballot.ballotPositions?.length ? ((results.results?.BallotResults_TotalVotes || 0) / ballot.ballotPositions.length).toFixed(1) : '0.0'}</span>
      </div>

      {ballot.ballotPositions?.map((ballotPosition, index) => {
        const positionResults = getPositionResults(ballotPosition.position.id);
        if (positionResults.length === 0) return null;

        return (
          <div key={ballotPosition.position.id} className="position-section">
            <div className="position-title">
              {ballotPosition.position.Position_Title}
            </div>
            <table className="candidates">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Votes</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {positionResults.map((result, resultIndex) => (
                  <tr key={resultIndex}>
                    <td>{result.candidate?.Candidate_Name || 'Unknown Candidate'}</td>
                    <td>{result.BallotResultDetails_VoteCount}</td>
                    <td>{result.BallotResultDetails_Percentage ? result.BallotResultDetails_Percentage.toFixed(1) : '0.0'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      <div className="signature-section">
        <h3>Official Certification of Results</h3>
        <div className="signatures">
          <div className="sig-box">
            <div className="sig-line">Gene Paul Cueva, CCS Dean</div>
          </div>
          <div className="sig-box">
            <div className="sig-line">Dr. CBM Dean</div>
          </div>
          <div className="sig-box">
            <div className="sig-line">Dr. COE Dean</div>
          </div>
          <div className="sig-box">
            <div className="sig-line">Dr. CEA Dean</div>
          </div>
          <div className="sig-box">
            <div className="sig-line">SSC Adviser</div>
          </div>
          <div className="sig-box">
            <div className="sig-line">Election Officer</div>
          </div>
        </div>
      </div>

      <div className="footer">
        Official Election Results - Page 1
      </div>
    </div>
  );
};

export default PrintPreview;
