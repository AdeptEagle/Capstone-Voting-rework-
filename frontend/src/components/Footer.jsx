import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h6>Voting</h6>
            <ul className="footer-links">
              <li>
                <Link to="/how-to-vote">
                  How to Vote
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h6>About</h6>
            <ul className="footer-links">
              <li>
                <Link to="/about">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link to="/team">
                  Team
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <hr className="footer-divider" />
        <div className="footer-copyright">
          <p>
            &copy; 2025 BallotBlitz. Capstone project.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
