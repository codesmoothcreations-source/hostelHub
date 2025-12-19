// src/components/maps/InteractiveMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaCrosshairs } from 'react-icons/fa';
import styles from './InteractiveMap.module.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const InteractiveMap = ({ 
  userLocation, 
  hostels = [], 
  onLocationSelect,
  interactive = true,
  selectedHostel = null
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);

  // Simple custom icons
  const createCustomIcon = (type) => {
    const colors = {
      user: '#2E86AB',      // Ocean blue
      hostel: '#42B883',    // Mint green
      selected: '#FF6B6B'   // Coral
    };

    const iconColor = colors[type] || colors.hostel;

    return L.divIcon({
      html: `
        <div style="
          background: ${iconColor};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        ">
          ${type === 'user' ? '📍' : type === 'selected' ? '⭐' : '🏠'}
        </div>
      `,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([5.6037, -0.1870], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add user location
  useEffect(() => {
    if (!mapReady || !userLocation) return;

    const map = mapInstanceRef.current;
    const { lat, lng } = userLocation;

    map.setView([lat, lng], 15);

    L.marker([lat, lng], { 
      icon: createCustomIcon('user')
    })
      .addTo(map)
      .bindPopup(`
        <div style="padding: 8px; font-family: 'Inter', sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #2E86AB; font-size: 16px;">📍</span>
            <div>
              <h4 style="margin: 0; font-size: 14px; color: #2C3E50; font-weight: 600;">You are here</h4>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #6C757D;">
                ${lat.toFixed(4)}, ${lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      `);

  }, [userLocation, mapReady]);

  // Add hostel markers
  useEffect(() => {
    if (!mapReady || !hostels.length) return;

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add hostel markers
    hostels.forEach(hostel => {
      if (hostel.location?.coordinates) {
        const [lng, lat] = hostel.location.coordinates;
        const isSelected = selectedHostel && selectedHostel._id === hostel._id;

        const marker = L.marker([lat, lng], { 
          icon: createCustomIcon(isSelected ? 'selected' : 'hostel')
        })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: 'Inter', sans-serif; min-width: 220px; padding: 4px;">
              <div style="display: flex; align-items: flex-start; gap: 10px;">
                <div style="
                  width: 40px;
                  height: 40px;
                  background: #42B883;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 18px;
                  flex-shrink: 0;
                ">
                  🏠
                </div>
                <div style="flex: 1;">
                  <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #2C3E50; font-weight: 600;">
                    ${hostel.name}
                  </h4>
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                    <span style="color: #FFC107; font-size: 12px;">⭐ ${hostel.rating || 'N/A'}</span>
                    <span style="color: #ADB5BD; font-size: 11px;">(${hostel.numberOfRatings || 0})</span>
                  </div>
                  <div style="font-size: 14px; color: #42B883; font-weight: 600; margin-bottom: 4px;">
                    GH₵${hostel.price}
                    <span style="font-size: 12px; color: #6C757D; font-weight: 400;">/${hostel.rentDuration}</span>
                  </div>
                  <p style="margin: 0; font-size: 12px; color: #6C757D;">
                    ${hostel.availableRooms || 0} rooms available
                  </p>
                </div>
              </div>
              <a href="/hostels/${hostel._id}" style="
                display: block;
                width: 100%;
                padding: 8px;
                background: #2E86AB;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                text-align: center;
                margin-top: 12px;
              ">
                View Details
              </a>
            </div>
          `);

        markersRef.current.push(marker);
      }
    });
  }, [hostels, mapReady, selectedHostel]);

  // Handle map clicks
  useEffect(() => {
    if (!mapReady || !interactive || !onLocationSelect) return;

    const map = mapInstanceRef.current;

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      
      const marker = L.marker([lat, lng], { 
        icon: createCustomIcon('selected')
      })
        .addTo(map)
        .bindPopup(`
          <div style="padding: 12px; font-family: 'Inter', sans-serif;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span style="color: #FF6B6B; font-size: 18px;">📍</span>
              <div>
                <h4 style="margin: 0; font-size: 15px; color: #2C3E50; font-weight: 600;">Location Selected</h4>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #6C757D;">
                  Click to use this location
                </p>
              </div>
            </div>
            <button style="
              width: 100%;
              padding: 8px;
              background: #42B883;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
            ">
              Use This Location
            </button>
          </div>
        `)
        .openPopup();

      onLocationSelect({ lat, lng });

      setTimeout(() => {
        if (marker && map.hasLayer(marker)) {
          marker.remove();
        }
      }, 5000);
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [mapReady, interactive, onLocationSelect]);

  const centerOnUser = () => {
    if (mapReady && userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Map View</h3>
        <p className={styles.subtitle}>Find hostels near you</p>
      </div>

      <div className={styles.mapWrapper}>
        <div 
          ref={mapRef} 
          className={styles.map}
        />
        
        {!mapReady && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading map...</p>
          </div>
        )}

        {userLocation && (
          <button 
            onClick={centerOnUser}
            className={styles.locationButton}
            title="Find me"
          >
            <FaCrosshairs />
          </button>
        )}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.dot} ${styles.blue}`}></div>
          <span>Your location</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.dot} ${styles.green}`}></div>
          <span>Hostels</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.dot} ${styles.red}`}></div>
          <span>Selected</span>
        </div>
      </div>

      <div className={styles.footer}>
        <p>
          Showing <strong>{hostels.length}</strong> hostels in this area
        </p>
      </div>
    </div>
  );
};

export default InteractiveMap;