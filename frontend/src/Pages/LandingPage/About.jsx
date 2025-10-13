import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import './About.css';

const About = () => {
  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  return (
    <div className="ballotblitz-app">
      <Navigation />
      <div className="about-section">
        <div className="about-container">
          <div className="about-card">
            <div className="about-card-body">
              <h1 className="about-title">About BallotBlitz</h1>
              <p className="about-intro">
                BallotBlitz is a capstone project designed to revolutionize school elections by providing a secure,
                efficient, and disruption-free voting platform. Our goal is to eliminate the need for class interruptions
                during elections while ensuring every student's voice is heard.
              </p>

              <h2 className="about-subtitle">Our Purpose</h2>
              <p className="about-text">
                Traditional school elections often require class disruptions for voting booths, ballot counting,
                and result announcements. BallotBlitz solves these challenges by:
              </p>
              <ul className="about-list">
                <li><i className="fas fa-check-circle"></i>Allowing students to vote anytime during election periods without missing class time</li>
                <li><i className="fas fa-check-circle"></i>Providing instant, accurate results without manual counting</li>
                <li><i className="fas fa-check-circle"></i>Eliminating paper waste from traditional ballots</li>
                <li><i className="fas fa-check-circle"></i>Increasing participation through mobile accessibility</li>
                <li><i className="fas fa-check-circle"></i>Maintaining complete transparency with recorded participation</li>
              </ul>

              <h2 className="about-subtitle">How It Works</h2>
              <div className="about-steps">
                <div className="about-step">
                  <div className="about-step-body">
                    <div className="about-step-icon">
                      <i className="fas fa-users"></i>
                    </div>
                    <h5 className="about-step-title">Student Registration</h5>
                    <p className="about-step-text">
                      Verified school accounts ensure only eligible students can participate
                    </p>
                  </div>
                </div>
                <div className="about-step">
                  <div className="about-step-body">
                    <div className="about-step-icon">
                      <i className="fas fa-mobile-alt"></i>
                    </div>
                    <h5 className="about-step-title">Anywhere Voting</h5>
                    <p className="about-step-text">
                      Cast votes from smartphones or computers during the election window
                    </p>
                  </div>
                </div>
                <div className="about-step">
                  <div className="about-step-body">
                    <div className="about-step-icon">
                      <i className="fas fa-chart-bar"></i>
                    </div>
                    <h5 className="about-step-title">Instant Results</h5>
                    <p className="about-step-text">
                      Automated tallying provides immediate, verified election outcomes
                    </p>
                  </div>
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

export default About;