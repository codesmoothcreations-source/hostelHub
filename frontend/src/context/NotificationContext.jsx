// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showToast = (message, type = 'success') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast(message, { icon: '⚠️' });
        break;
      case 'info':
        toast(message, { icon: 'ℹ️' });
        break;
      default:
        toast(message);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    showToast,
    addNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'hostelhub-toast',
          duration: 4000,
        }}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};