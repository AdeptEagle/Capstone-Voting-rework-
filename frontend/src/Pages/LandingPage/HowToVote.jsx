import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import './HowToVote.css';

const HowToVote = () => {
  return (
    <div className="ballotblitz-app">
      <Navigation />
      <div className="how-to-vote-section">
        <div className="how-to-vote-container">
          <div className="how-to-vote-card">
            <div className="how-to-vote-card-body">
              <h1 className="how-to-vote-title">How to Vote with BallotBlitz</h1>
              <p className="how-to-vote-intro">
                Follow these simple steps to participate in your school elections securely and conveniently.
              </p>
              
              <h2 className="how-to-vote-subtitle">Voting Steps</h2>
              <div className="how-to-vote-steps">
                <div className="how-to-vote-step">
                  <div className="how-to-vote-step-body">
                    <div className="how-to-vote-step-icon">
                      <i className="fas fa-user-plus"></i>
                    </div>
                    <h5 className="how-to-vote-step-title">Register with Credentials</h5>
                    <p className="how-to-vote-step-text">
                      Use your school ID to create a secure account
                    </p>
                  </div>
                </div>
                
                <div className="how-to-vote-step">
                  <div className="how-to-vote-step-body">
                    <div className="how-to-vote-step-icon">
                      <i className="fas fa-th-large"></i>
                    </div>
                    <h5 className="how-to-vote-step-title">Access Dashboard</h5>
                    <p className="how-to-vote-step-text">
                      View active ballots available for voting
                    </p>
                  </div>
                </div>
                
                <div className="how-to-vote-step">
                  <div className="how-to-vote-step-body">
                    <div className="how-to-vote-step-icon">
                      <i className="fas fa-check-square"></i>
                    </div>
                    <h5 className="how-to-vote-step-title">Make Your Selection</h5>
                    <p className="how-to-vote-step-text">
                      Choose candidates or abstain for each position
                    </p>
                  </div>
                </div>
                
                <div className="how-to-vote-step">
                  <div className="how-to-vote-step-body">
                    <div className="how-to-vote-step-icon">
                      <i className="fas fa-paper-plane"></i>
                    </div>
                    <h5 className="how-to-vote-step-title">Review & Submit</h5>
                    <p className="how-to-vote-step-text">
                      Confirm your choices and cast your vote
                    </p>
                  </div>
                </div>
                
                <div className="how-to-vote-step">
                  <div className="how-to-vote-step-body">
                    <div className="how-to-vote-step-icon">
                      <i className="fas fa-chart-bar"></i>
                    </div>
                    <h5 className="how-to-vote-step-title">View Results</h5>
                    <p className="how-to-vote-step-text">
                      See real-time results after voting closes
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="how-to-vote-subtitle">Voting Guidelines</h2>
              <div className="how-to-vote-guidelines">
                <div className="how-to-vote-guideline-item">
                  <i className="fas fa-check-circle"></i>
                  <span>One vote per ballot - cannot be changed after submission</span>
                </div>
                <div className="how-to-vote-guideline-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Option to abstain for any position</span>
                </div>
                <div className="how-to-vote-guideline-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Immediate confirmation of vote submission</span>
                </div>
                <div className="how-to-vote-guideline-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Real-time results available when voting closes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowToVote;