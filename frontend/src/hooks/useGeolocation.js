import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState(null);

  // --- SECURE IP FALLBACK (Works on Render/HTTPS) ---
  const getIPLocation = async () => {
    try {
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
        setLoading(false);
        setError(null); // Clear any previous block errors
      } else {
        throw new Error('IP-API failed');
      }
    } catch (err) {
      setError('Location services unavailable. Please enter location manually.');
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      getIPLocation();
      return;
    }

    setLoading(true);
    setError(null);

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
  };

  const getCurrentPosition = () => {
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
        setLoading(false);
        setPermission('granted');
      },
      (error) => {
        console.warn("GPS failed/blocked, switching to IP...");
        getIPLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 5000, 
        maximumAge: 0,
        ...options
      }
    );
  };

  // This ensures buttons in your UI still work!
  const requestPermission = () => {
    if (permission === 'denied') {
      // If already denied, don't ask again (it will fail), just use IP
      getIPLocation();
    } else {
      // Otherwise, trigger the browser popup
      getCurrentPosition();
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