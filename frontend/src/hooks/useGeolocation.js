import { useState, useEffect, useCallback } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState(null);

  // --- SECURE IP FALLBACK ---
  const getIPLocation = useCallback(async () => {
    try {
      // We don't set loading(true) here because we want to keep the UI
      // showing the previous state until we have the new coordinates.
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude) {
        const locationData = {
          lat: data.latitude,
          lng: data.longitude,
          accuracy: 1000,
          timestamp: Date.now(),
          isIPBased: true,
          city: data.city
        };
        setLocation(locationData);
        setPermission('granted'); 
        setError(null); // CRITICAL: This clears the "Timeout" or "Denied" message
        setLoading(false);
      } else {
        throw new Error('IP-API failed');
      }
    } catch (err) {
      setError('Location unavailable. Please search manually.');
      setLoading(false);
    }
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      getIPLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          isIPBased: false
        };
        setLocation(locationData);
        setError(null);
        setLoading(false);
        setPermission('granted');
      },
      (err) => {
        // GPS failed or timed out - immediately try IP
        console.warn(`GPS Error (${err.code}): ${err.message}. Switching to IP...`);
        getIPLocation();
      },
      {
        enableHighAccuracy: false, // Desktop browsers work better with false
        timeout: 4000,            // Reduced to 4 seconds for faster fallback
        maximumAge: 0,
        ...options
      }
    );
  }, [getIPLocation, options]);

  const getLocation = useCallback(() => {
    setLoading(true);
    
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermission(result.state);
        if (result.state === 'denied') {
          getIPLocation();
        } else {
          getCurrentPosition();
        }
      });
    } else {
      getCurrentPosition();
    }
  }, [getIPLocation, getCurrentPosition]);

  const requestPermission = () => {
    setLoading(true);
    if (permission === 'denied') {
      // If blocked, don't trigger the browser popup (it won't show anyway)
      getIPLocation();
    } else {
      getCurrentPosition();
    }
  };

  useEffect(() => {
    getLocation();
  }, []); // Only run on mount

  return { 
    location, 
    error, 
    loading, 
    permission,
    getLocation,
    requestPermission 
  };
};