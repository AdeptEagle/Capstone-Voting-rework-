import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
  return (
    <div className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h6 className="testimonials-subtitle">Testimonials</h6>
          <h2 className="testimonials-title">
            What Our Users Say
          </h2>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-card-body">
              <div className="testimonial-user">
                <img className="testimonial-avatar" src="http://static.photos/people/200x200/1" alt="User 1" />
                <div className="testimonial-user-info">
                  <h6>Sarah Johnson</h6>
                  <small>Senior Student</small>
                </div>
              </div>
              <p className="testimonial-text">
                "The voting process was incredibly simple and secure. I love being able to participate in school decisions from anywhere!"
              </p>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-card-body">
              <div className="testimonial-user">
                <img className="testimonial-avatar" src="http://static.photos/people/200x200/2" alt="User 2" />
                <div className="testimonial-user-info">
                  <h6>Michael Chen</h6>
                  <small>Class President</small>
                </div>
              </div>
              <p className="testimonial-text">
                "As an organizer, BallotBlitz has made election management so much easier. The real-time results feature is fantastic."
              </p>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-card-body">
              <div className="testimonial-user">
                <img className="testimonial-avatar" src="http://static.photos/people/200x200/3" alt="User 3" />
                <div className="testimonial-user-info">
                  <h6>Dr. Emily Rodriguez</h6>
                  <small>Faculty Advisor</small>
                </div>
              </div>
              <p className="testimonial-text">
                "This platform has significantly increased student participation in our elections while maintaining the highest security standards."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;