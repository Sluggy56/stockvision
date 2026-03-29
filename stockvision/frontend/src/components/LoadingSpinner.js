import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner() {
  return (
    <div className="loading-overlay">
      <div className="loading-inner">
        <div className="spinner-ring" />
        <div className="loading-text">
          <span className="loading-label">FETCHING DATA</span>
          <span className="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </div>
        <div className="loading-sub">Running LSTM predictions</div>
      </div>
    </div>
  );
}
