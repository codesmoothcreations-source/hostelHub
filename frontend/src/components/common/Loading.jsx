// src/components/common/Loading.jsx
import React from 'react';

const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className="hostelhub-loading">
      <div className="hostelhub-loading-spinner"></div>
      <p className="hostelhub-loading-text">{text}</p>
    </div>
  );
};

export default Loading;