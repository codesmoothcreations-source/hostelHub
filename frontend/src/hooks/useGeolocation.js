import { useState, useEffect, useCallback } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState(null);

  // --- SECURE IP FALLBACK WITH MULTIPLE PROVIDERS ---
  const getIPLocation = useCallback(async () => {
    try {
      // Try Provider 1: ipapi.co
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('ipapi.co failed');
      const data = await response.json();
      
      if (data.latitude) {
        updateLocationState(data, true);
        return;
      }
    } catch (err) {
      console.warn("ipapi.co blocked by CORS or failed, trying backup...");
      try {
        // Try Provider 2 (Backup): ip-api.com (Very reliable for Render)
        const response = await fetch('http://ip-api.com/json/');
        const data = await response.json();
        if (data.lat) {
          updateLocationState({
            latitude: data.lat,
            longitude: data.lon,
            city: data.city
          }, true);
        }
      } catch (backupErr) {
        setError('Location unavailable. Please search manually.');
        setLoading(false);
      }
    }
  }, []);

  const updateLocationState = (data, isIP) => {
    setLocation({
      lat: data.latitude,
      lng: data.longitude,
      accuracy: isIP ? 1000 : data.accuracy,
      timestamp: Date.now(),
      isIPBased: isIP,
      city: data.city || 'Unknown'
    });
    setPermission('granted');
    setError(null);
    setLoading(false);
  };

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      getIPLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocationState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }, false);
      },
      (err) => {
        console.warn(`GPS failed (${err.code}). Switching to IP...`);
        getIPLocation();
      },
      {
        enableHighAccuracy: false,
        timeout: 4000,
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
      getIPLocation();
    } else {
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
    requestPermission };
};