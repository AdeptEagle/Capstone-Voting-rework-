import React from 'react';
import { useBallot } from '../contexts/BallotContext';
import './ElectionStatusMessage.css';

const ElectionStatusMessage = ({ type = 'general' }) => {
  const { activeBallot, loading, hasActiveBallot, hasAnyBallot } = useBallot();

  if (loading) {
    return (
      <div className="election-status-message loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Checking election status...</p>
      </div>
    );
  }

  // Check if there's an election but it's not active
  if (activeBallot && activeBallot.Ballot_Status !== 'ACTIVE') {
    const getInactiveMessage = () => {
      const status = activeBallot.Ballot_Status;
      const statusText = status.charAt(0).toUpperCase() + status.slice(1);
      
      switch (type) {
        case 'vote':
          return {
            icon: 'fas fa-pause-circle',
            title: `Election ${statusText}`,
            message: `The ballot "${activeBallot.Ballot_Title}" is currently ${status}. Voting is not available at this time.`,
            color: status === 'ended' ? 'success' : 'warning'
          };
        case 'candidates':
          return {
            icon: 'fas fa-users',
            title: `Election ${statusText}`,
            message: `The ballot "${activeBallot.Ballot_Title}" is currently ${status}. Candidates are not available for viewing.`,
            color: status === 'ended' ? 'success' : 'warning'
          };
        case 'results':
          if (status === 'ended') {
            return {
              icon: 'fas fa-chart-bar',
              title: 'Election Ended',
              message: `The ballot "${activeBallot.Ballot_Title}" has ended. Results should be available now.`,
              color: 'success'
            };
          } else {
            return {
              icon: 'fas fa-chart-bar',
              title: `Election ${statusText}`,
              message: `The ballot "${activeBallot.Ballot_Title}" is currently ${status}. Results are not available yet.`,
              color: 'warning'
            };
          }
        default:
          return {
            icon: 'fas fa-info-circle',
            title: `Election ${statusText}`,
            message: `The ballot "${activeBallot.Ballot_Title}" is currently ${status}.`,
            color: status === 'ended' ? 'success' : 'warning'
          };
      }
    };

    const messageData = getInactiveMessage();
    return (
      <div className={`election-status-message ${messageData.color}`}>
        <div className="message-content">
          <div className="message-icon">
            <i className={messageData.icon}></i>
          </div>
          <div className="message-text">
            <h3>{messageData.title}</h3>
            <p>{messageData.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasActiveBallot) {
    return null; // Don't show message if there's an active election
  }

  // For results, check if there are any elections at all
  if (type === 'results' && hasAnyBallot) {
    return null; // Don't show message if there are elections
  }

  const getMessage = () => {
    switch (type) {
      case 'vote':
        return {
          icon: 'fas fa-vote-yea',
          title: 'No Active Election',
          message: 'There is currently no active election for voting. Please check back later or contact an administrator.',
          color: 'warning'
        };
      case 'candidates':
        return {
          icon: 'fas fa-users',
          title: 'No Candidates Available',
          message: 'Candidates will be available once an election is created and activated by an administrator.',
          color: 'info'
        };
      case 'results':
        return {
          icon: 'fas fa-chart-bar',
          title: 'No Election Results',
          message: 'There are no elections in the system yet. Results will be available once elections are created and completed.',
          color: 'info'
        };
      default:
        return {
          icon: 'fas fa-info-circle',
          title: 'No Active Election',
          message: 'There is currently no active election. Please check back later or contact an administrator.',
          color: 'info'
        };
    }
  };

  const messageData = getMessage();

  return (
    <div className={`election-status-message ${messageData.color}`}>
      <div className="message-content">
        <div className="message-icon">
          <i className={messageData.icon}></i>
        </div>
        <div className="message-text">
          <h3>{messageData.title}</h3>
          <p>{messageData.message}</p>
        </div>
      </div>
    </div>
  );
};

export default ElectionStatusMessage; 