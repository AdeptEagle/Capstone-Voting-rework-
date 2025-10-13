import React from 'react';
import { Link } from 'react-router-dom';
import BCLogo from '../../assets/BCLogo.png';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="bb-navbar bb-navbar-expand-lg">
      <div className="bb-container">
        <div className="bb-navbar-brand">
          <img src={BCLogo} alt="School Logo" />
          <Link to="/" className="bb-navbar-brand-link">
            <span>BallotBlitz</span>
          </Link>
        </div>
        
        <button className="bb-navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="bb-navbar-toggler-icon"></span>
        </button>
        
        <div className="bb-collapse bb-navbar-collapse" id="navbarNav">
          <ul className="bb-navbar-nav">
            <li className="bb-nav-item">
              <Link to="/" className="bb-nav-link">Home</Link>
            </li>
            <li className="bb-nav-item">
              <Link to="/about" className="bb-nav-link">About</Link>
            </li>
            <li className="bb-nav-item">
              <Link to="/login" className="bb-btn bb-btn-primary">Login</Link>
            </li>
            <li className="bb-nav-item">
              <Link to="/register" className="bb-btn bb-btn-outline-primary">Register</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;