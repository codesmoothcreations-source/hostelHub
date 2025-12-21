// import { useState, useEffect } from 'react';

// export const useGeolocation = (options = {}) => {
//   const [location, setLocation] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [permission, setPermission] = useState(null);

//   // --- SECURE IP FALLBACK (Works on Render/HTTPS) ---
//   const getIPLocation = async () => {
//     try {
//       const response = await fetch('https://ipapi.co/json/');
//       const data = await response.json();
      
//       if (data.latitude) {
//         const locationData = {
//           lat: data.latitude,
//           lng: data.longitude,
//           accuracy: 1000,
//           timestamp: Date.now(),
//           isIPBased: true,
//           city: data.city
//         };
//         setLocation(locationData);
//         setPermission('granted'); 
//         setLoading(false);
//         setError(null); // Clear any previous block errors
//       } else {
//         throw new Error('IP-API failed');
//       }
//     } catch (err) {
//       setError('Location services unavailable. Please enter location manually.');
//       setLoading(false);
//     }
//   };

//   const getLocation = () => {
//     if (!navigator.geolocation) {
//       getIPLocation();
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     if (navigator.permissions && navigator.permissions.query) {
//       navigator.permissions.query({ name: 'geolocation' }).then((result) => {
//         setPermission(result.state);
//         if (result.state === 'denied') {
//           getIPLocation();
//         } else {
//           getCurrentPosition();
//         }
//       });
//     } else {
//       getCurrentPosition();
//     }
//   };

//   const getCurrentPosition = () => {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const locationData = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//           accuracy: position.coords.accuracy,
//           timestamp: position.timestamp,
//           isIPBased: false
//         };
//         setLocation(locationData);
//         setLoading(false);
//         setPermission('granted');
//       },
//       (error) => {
//         console.warn("GPS failed/blocked, switching to IP...");
//         getIPLocation();
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 5000, 
//         maximumAge: 0,
//         ...options
//       }
//     );
//   };

//   // This ensures buttons in your UI still work!
//   const requestPermission = () => {
//     if (permission === 'denied') {
//       // If already denied, don't ask again (it will fail), just use IP
//       getIPLocation();
//     } else {
//       // Otherwise, trigger the browser popup
//       getCurrentPosition();
//     }
//   };

//   useEffect(() => {
//     getLocation();
//   }, []);

//   return { 
//     location, 
//     error, 
//     loading, 
//     permission,
//     getLocation,
//     requestPermission 
//   };
// };


import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState(null);

  const getIPLocation = async () => {
    console.log("DIAGNOSTIC: Attempting IP Fallback via https://ipapi.co/json/");
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const data = await response.json();
      console.log("DIAGNOSTIC: IP Data received successfully", data.city);
      
      setLocation({
        lat: data.latitude,
        lng: data.longitude,
        city: data.city,
        isIPBased: true
      });
      setLoading(false);
    } catch (err) {
      console.error("DIAGNOSTIC: IP Fallback Failed. Reason:", err.message);
      // This is usually a CSP block or a Network issue
      setError(`IP Fallback Failed: ${err.message}`);
      setLoading(false);
    }
  };

  const getLocation = () => {
    console.log("DIAGNOSTIC: Starting Location Search...");
    if (!navigator.geolocation) {
      console.error("DIAGNOSTIC: Browser does not support Geolocation.");
      getIPLocation();
      return;
    }

    // Check Permissions API
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log("DIAGNOSTIC: Permission State is:", result.state);
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
        console.log("DIAGNOSTIC: GPS Success!");
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          isIPBased: false
        });
        setLoading(false);
      },
      (err) => {
        console.warn(`DIAGNOSTIC: GPS Failed. Code: ${err.code} | Message: ${err.message}`);
        getIPLocation();
      },
      { timeout: 5000, ...options }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { location, error, loading, permission, getLocation };
};