import React from 'react';
import { Link } from 'react-router-dom';
import './CTA.css';

const CTA = () => {
  return (
    <div className="cta-section">
      <div className="cta-container">
        <div className="cta-content">
          <div className="cta-text">
            <h2 className="cta-title">
              <span className="title-line">Ready to make your voice heard?</span>
              <span className="title-line-light">Register now and start voting today.</span>
            </h2>
          </div>
          <div className="cta-actions">
            <Link to="/register" className="cta-button">
              Get started
              <i data-feather="arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;