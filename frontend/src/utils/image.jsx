import React from 'react';
// Utility to get the correct candidate photo URL
export function getCandidatePhotoUrl(photoUrl) {
  if (!photoUrl) return null;
  // If already a full URL, use as is
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }
  // If already starts with /uploads/, use as is (prepend host)
  if (photoUrl.startsWith('/uploads/')) {
    return `http://localhost:3001${photoUrl}`;
  }
  // If just a filename, prepend /uploads/
  return `http://localhost:3001/uploads/${photoUrl}`;
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