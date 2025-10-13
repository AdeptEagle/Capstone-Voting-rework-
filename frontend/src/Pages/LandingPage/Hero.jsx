import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-container">
      <div className="container-fluid">
        <div className="row align-items-stretch min-vh-50">
          <div className="col-lg-6 d-flex align-items-center">
            <div className="px-4 px-lg-5 py-5 w-100">
              <h1 className="display-3 fw-bold text-white mb-4">
                <span className="d-block">Democracy in</span>
                <span className="d-block text-light">Your Hands</span>
              </h1>
              <p className="lead text-light mb-4">
                Cast your vote securely and conveniently with our state-of-the-art online voting platform.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Link to="/register" className="btn btn-light btn-lg px-4 py-3">
                  Get Started
                </Link>
                <Link to="/how-to-vote" className="btn btn-outline-light btn-lg px-4 py-3">
                  How to Vote
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6 p-0">
            <img 
              className="img-fluid w-100 h-100 object-cover" 
              src="http://static.photos/people/1024x576/5" 
              alt="People voting"
              style={{opacity: 0.9}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;