import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

//Team Images
import FullstackImage from '../../assets/Fullstack.jpg';
import PMImage from '../../assets/PM.jpg';
import BackendImage from '../../assets/Backend.jpg';
import Frontend1Image from '../../assets/Frontend1.jpg';
import Frontend2Image from '../../assets/Frontend2.jpg';
import DocuImage from '../../assets/Docu.jpg';
import './Team.css';

const Team = () => {
  const members = [
    { name: 'Eirick Kerbi Cabardo', role: 'Leader / Fullstack Developer', image: FullstackImage, bio: 'Leads the team and builds across the stack.' },
    { name: 'Milven John Hermosa', role: 'Project Manager', image: PMImage, bio: 'Drives delivery, timelines, and coordination.' },
    { name: 'Jhian Kyle Cinco', role: 'Backend Developer', image: BackendImage, bio: 'Implements APIs, services, and data persistence.' },
    { name: 'Charles Louie Tampos', role: 'Frontend Developer', image: Frontend1Image, bio: 'Builds responsive and accessible UIs.' },
    { name: 'Kercson Didal', role: 'Frontend Developer', image: Frontend2Image, bio: 'Delivers polished interfaces and interactions.' },
    { name: 'Kreshia Dian Epe', role: 'Documentarian / Researcher', image: DocuImage, bio: 'Produces documentation and research insights.' }
  ];

  return (
    <div className="ballotblitz-app">
      <Navigation />
      <div className="team-section">
        <div className="team-container">
          <div className="team-header">
            <h1 className="team-title">Meet Our Team</h1>
            <p className="team-subtitle">The dedicated individuals behind BallotBlitz</p>
          </div>

          <div className="team-grid">
            {members.map((member, index) => (
              <div key={index} className="team-card">
                <img className="team-card-image" src={member.image} alt={member.name} />
                <div className="team-card-body">
                  <h5 className="team-member-name">{member.name}</h5>
                  <p className="team-member-role">{member.role}</p>
                  <p className="team-member-bio">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Team;