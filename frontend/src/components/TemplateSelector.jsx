import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './TemplateSelector.css';

/* Force refresh - Icon only buttons - All Cancel text removed */

const TemplateSelector = ({ onSelect, onCancel, onGoBack }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onCancel]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ballot-templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    onSelect(template);
  };

  const getPositionCount = (templateData) => {
    try {
      const data = typeof templateData === 'string' ? JSON.parse(templateData) : templateData;
      return data.positions ? data.positions.length : 0;
    } catch {
      return 0;
    }
  };

  const getPositionTitles = (templateData) => {
    try {
      const data = typeof templateData === 'string' ? JSON.parse(templateData) : templateData;
      return data.positions ? data.positions.map(p => p.positionTitle).join(', ') : 'No positions';
    } catch {
      return 'No positions';
    }
  };

  if (loading) {
    return (
      <div className="template-selector">
        <div className="template-selector-header">
          <h3>Choose a Template</h3>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="loading-message">
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="template-selector">
        <div className="template-selector-header">
          <h3>Choose a Template</h3>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchTemplates}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="template-selector">
      <div className="template-selector-header">
        <div className="template-selector-header-left">
          <button 
            className="go-back-btn"
            onClick={onGoBack}
            title="Go back to options"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h3>Choose a Template</h3>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onCancel}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="template-selector-content">
        <p className="template-selector-description">
          Select a template to quickly create a ballot with pre-configured positions and settings.
        </p>
        
        <div className="templates-grid">
          {templates.map((template) => (
            <div key={template.id} className="template-card">
              <div className="template-card-header">
                <h4>{template.BallotTemplate_Name}</h4>
                <span className="template-visibility">
                  <i className={`fas ${template.BallotTemplate_IsPublic ? 'fa-globe' : 'fa-lock'}`}></i>
                  {template.BallotTemplate_IsPublic ? 'Public' : 'Private'}
                </span>
              </div>
              
              <p className="template-description">
                {template.BallotTemplate_Description}
              </p>
              
              <div className="template-positions">
                <div className="position-count">
                  <i className="fas fa-list"></i>
                  {getPositionCount(template.BallotTemplate_Data)} positions
                </div>
                <div className="positions-preview">
                  {getPositionTitles(template.BallotTemplate_Data)}
                </div>
              </div>
              
              <button
                className="btn btn-primary"
                onClick={() => handleTemplateSelect(template)}
              >
                <i className="fas fa-plus-circle"></i>
                Use This Template
              </button>
            </div>
          ))}
        </div>
        
        {templates.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <h4>No Templates Available</h4>
            <p>No ballot templates are currently available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;
