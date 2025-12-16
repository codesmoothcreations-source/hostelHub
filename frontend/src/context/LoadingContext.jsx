// src/context/LoadingContext.jsx
import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const startLoading = (text = '') => {
    setLoading(true);
    setLoadingText(text);
  };

  const stopLoading = () => {
    setLoading(false);
    setLoadingText('');
  };

  const value = {
    loading,
    loadingText,
    startLoading,
    stopLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};