import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import './Mission.css';

const Mission = () => {
  return (
    <div className="ballotblitz-app">
      <Navigation />
      <div className="mission-section">
        <div className="mission-container">
          <div className="mission-card">
            <div className="mission-card-body">
              <h1 className="mission-title">Our Mission</h1>
              <p className="mission-intro">
                To revolutionize school elections by providing a secure, efficient, and disruption-free voting platform 
                that ensures every student's voice is heard while maintaining the integrity of the democratic process.
              </p>

              <div className="mission-values">
                <h2 className="mission-subtitle">Our Core Values</h2>
                
                <div className="mission-value">
                  <div className="mission-value-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="mission-value-content">
                    <h3 className="mission-value-title">Security & Integrity</h3>
                    <p className="mission-value-text">
                      We prioritize the security and integrity of every vote, ensuring that elections are fair, 
                      transparent, and tamper-proof through advanced encryption and audit trails.
                    </p>
                  </div>
                </div>

                <div className="mission-value">
                  <div className="mission-value-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="mission-value-content">
                    <h3 className="mission-value-title">Accessibility & Inclusion</h3>
                    <p className="mission-value-text">
                      We believe every student should have equal access to participate in school democracy, 
                      regardless of their schedule, location, or technical capabilities.
                    </p>
                  </div>
                </div>

                <div className="mission-value">
                  <div className="mission-value-icon">
                    <i className="fas fa-leaf"></i>
                  </div>
                  <div className="mission-value-content">
                    <h3 className="mission-value-title">Sustainability</h3>
                    <p className="mission-value-text">
                      By eliminating paper ballots and reducing physical voting infrastructure, we contribute 
                      to environmental sustainability while improving efficiency.
                    </p>
                  </div>
                </div>

                <div className="mission-value">
                  <div className="mission-value-icon">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <div className="mission-value-content">
                    <h3 className="mission-value-title">Educational Impact</h3>
                    <p className="mission-value-text">
                      We aim to enhance civic education by making democratic participation more accessible 
                      and engaging for students, preparing them for active citizenship.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mission-vision">
                <h2 className="mission-subtitle">Our Vision</h2>
                <p className="mission-vision-text">
                  To create a future where school elections are seamless, inclusive, and educational experiences 
                  that strengthen student engagement in democracy while eliminating administrative burdens and 
                  class disruptions. We envision a world where every student can participate in their school's 
                  democratic process with confidence, convenience, and complete transparency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Mission;
