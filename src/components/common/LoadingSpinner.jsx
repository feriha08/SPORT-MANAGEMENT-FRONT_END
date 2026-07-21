import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', fullPage = false }) => {
  const spinner = <div className={`spinner spinner-${size}`}></div>;
  
  if (fullPage) {
    return (
      <div className="spinner-fullpage">
        {spinner}
        <p className="spinner-text">Loading...</p>
      </div>
    );
  }
  
  return spinner;
};

export default LoadingSpinner;