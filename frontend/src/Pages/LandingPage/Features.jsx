import React from 'react';

const Features = () => {
  const features = [
    {
      icon: 'shield',
      title: 'Secure Voting',
      description: 'Secure verification with school ID while keeping votes confidential.'
    },
    {
      icon: 'smartphone',
      title: 'Mobile Friendly',
      description: 'Vote from any device, anywhere, with our responsive and intuitive interface.'
    },
    {
      icon: 'bar-chart-2',
      title: 'Real-time Results',
      description: 'View live updates and verified results as soon as voting concludes.'
    }
  ];

  return (
    <div className="py-5 bg-white">
      <div className="container">
        <div className="text-center mb-5">
          <h6 className="text-primary fw-bold text-uppercase mb-2">Features</h6>
          <h2 className="display-5 fw-bold text-dark mb-3">Why Choose BallotBlitz</h2>
          <p className="lead text-muted">
            Our platform is designed with security, accessibility, and transparency in mind.
          </p>
        </div>

        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <i data-feather={feature.icon} className="text-primary" style={{width: '24px', height: '24px'}}></i>
                  </div>
                  <h5 className="card-title fw-bold text-dark mb-3">{feature.title}</h5>
                  <p className="card-text text-muted">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;