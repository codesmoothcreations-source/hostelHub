// src/hooks/useGeolocation.js - ENHANCED VERSION
import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Check permission first
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermission(result.state);
        
        if (result.state === 'denied') {
          setError('Location permission denied. Please enable location services.');
          setLoading(false);
        } else if (result.state === 'granted' || result.state === 'prompt') {
          getCurrentPosition();
        }
      });
    } else {
      // Fallback for browsers that don't support permissions API
      getCurrentPosition();
    }
  };

  const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        setLocation(locationData);
        setLoading(false);
        setPermission('granted');
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services in your browser settings.';
            setPermission('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options
      }
    );
  };

  const requestPermission = () => {
    if (permission === 'prompt') {
      getCurrentPosition();
    } else if (permission === 'denied') {
      setError('Location permission denied. Please enable location services in your browser settings.');
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { 
    location, 
    error, 
    loading, 
    permission,
    getLocation,
    requestPermission 
  };
};