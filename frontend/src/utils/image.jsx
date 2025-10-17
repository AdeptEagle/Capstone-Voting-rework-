import React from 'react';
import { getImageUrl as getEnvImageUrl } from '../config/environment';

// Utility to get the correct candidate photo URL
export function getCandidatePhotoUrl(photoUrl) {
  if (!photoUrl || photoUrl === 'undefined' || photoUrl === 'null') return null;
  return getEnvImageUrl(photoUrl);
}

// Placeholder component for candidate photo
export function CandidatePhotoPlaceholder({ className = '', style = {} }) {
  return (
    <div 
      className={`candidate-photo-placeholder ${className}`} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%', 
        height: '100%',
        fontSize: '3rem',
        color: '#9ca3af',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        borderRadius: '0.5rem',
        border: '4px solid #d1d5db',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
        ...style 
      }}
    >
      <i className="fas fa-user" style={{ fontSize: '3rem' }}></i>
    </div>
  );
} 