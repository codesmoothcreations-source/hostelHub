// src/components/maps/InteractiveMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaCrosshairs } from 'react-icons/fa';
import "./InteractiveMap.css";

// Fix Leaflet default icons
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
  const [userMarker, setUserMarker] = useState(null);

  // Create custom icon with street map visibility
  const createCustomIcon = (type) => {
    const icons = {
      user: {
        emoji: '📍',
        color: '#0077cc',
        bg: '#0077cc'
      },
      hostel: {
        emoji: '🏠',
        color: '#4cd964',
        bg: '#4cd964'
      },
      selected: {
        emoji: '⭐',
        color: '#ff9500',
        bg: '#ff9500'
      }
    };

    const icon = icons[type] || icons.hostel;

    return L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="
            background: ${icon.bg};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            border: 3px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1000;
          ">
            ${icon.emoji}
          </div>
        </div>
      `,
      className: 'hostelhub-custom-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });
  };

  // Initialize map with OpenStreetMap showing street names
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5
    }).setView([5.6037, -0.1870], 13);

    // OpenStreetMap with streets, labels, and colors
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add additional layer for more details at higher zoom
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 13,
      opacity: 0.3
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

  // Add user location marker
  useEffect(() => {
    if (!mapReady || !userLocation) return;

    const map = mapInstanceRef.current;
    const { lat, lng } = userLocation;

    // Center map on user location
    map.setView([lat, lng], 15);

    // Remove previous user marker
    if (userMarker) {
      userMarker.remove();
    }

    // Create user marker
    const newUserMarker = L.marker([lat, lng], { 
      icon: createCustomIcon('user')
    })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: 'Josefin Sans', sans-serif; padding: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 32px; height: 32px; background: #0077cc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
              📍
            </div>
            <div>
              <h4 style="margin: 0; font-size: 14px; color: #050d18; font-weight: 600;">Your Location</h4>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
                ${lat.toFixed(6)}, ${lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      `);

    setUserMarker(newUserMarker);

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
        const hostelIcon = createCustomIcon(isSelected ? 'selected' : 'hostel');

        const marker = L.marker([lat, lng], { icon: hostelIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: 'Josefin Sans', sans-serif; min-width: 240px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #eee;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4cd964, #34d399); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                  🏠
                </div>
                <div>
                  <h4 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #050d18;">${hostel.name}</h4>
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #666;">
                    <span style="display: flex; align-items: center; gap: 2px;">
                      ⭐ ${hostel.rating || 'N/A'}
                    </span>
                    <span style="color: #999;">•</span>
                    <span>(${hostel.numberOfRatings || 0} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div style="margin-bottom: 16px;">
                <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                  <span style="color: #0077cc; font-size: 14px; margin-top: 2px;">📍</span>
                  <div>
                    <p style="margin: 0; font-size: 14px; color: #050d18; font-weight: 500;">Location</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #666; line-height: 1.4;">
                      ${hostel.location?.address || 'Address not available'}
                    </p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="color: #4cd964; font-size: 14px;">💰</span>
                  <div>
                    <p style="margin: 0; font-size: 14px; color: #050d18; font-weight: 500;">Price</p>
                    <p style="margin: 4px 0 0 0; font-size: 15px; color: #050d18; font-weight: 700;">
                      GH₵${hostel.price}<span style="font-size: 13px; color: #999; font-weight: 400;">/${hostel.rentDuration}</span>
                    </p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: #ff9500; font-size: 14px;">🛏️</span>
                  <div>
                    <p style="margin: 0; font-size: 14px; color: #050d18; font-weight: 500;">Availability</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">
                      ${hostel.availableRooms || 0} rooms available
                    </p>
                  </div>
                </div>
              </div>
              
              <a href="/hostels/${hostel._id}" style="
                display: block;
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #0077cc, #005fa3);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                text-align: center;
                transition: all 0.2s ease;
                border: none;
                cursor: pointer;
              " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0, 119, 204, 0.3)';"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                View Hostel Details
              </a>
            </div>
          `)
          .on('mouseover', function() {
            this.openPopup();
          })
          .on('mouseout', function() {
            this.closePopup();
          });

        markersRef.current.push(marker);
      }
    });

  }, [hostels, mapReady, selectedHostel]);

  // Handle map click for location selection
  useEffect(() => {
    if (!mapReady || !interactive || !onLocationSelect) return;

    const map = mapInstanceRef.current;

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      
      // Get location details from click
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
          const address = data.display_name || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          
          const tempMarker = L.marker([lat, lng], { 
            icon: createCustomIcon('selected')
          })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: 'Josefin Sans', sans-serif; padding: 12px; min-width: 200px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                  <div style="width: 40px; height: 40px; background: #ff9500; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
                    📍
                  </div>
                  <div>
                    <h4 style="margin: 0; font-size: 15px; color: #050d18; font-weight: 700;">Location Selected</h4>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
                      Click to use this location
                    </p>
                  </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; margin-bottom: 12px;">
                  <p style="margin: 0; font-size: 13px; color: #050d18; line-height: 1.4;">
                    ${address}
                  </p>
                </div>
                
                <button onclick="
                  this.style.background='linear-gradient(135deg, #4cd964, #34d399)';
                  this.innerHTML='✓ Location Set!';
                  setTimeout(() => { this.closest('.leaflet-popup').style.display = 'none'; }, 1000);
                " style="
                  width: 100%;
                  padding: 10px;
                  background: linear-gradient(135deg, #ff9500, #ffcc00);
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.2s ease;
                " onmouseover="this.style.transform='translateY(-1px)';"
                onmouseout="this.style.transform='translateY(0)';">
                  Use This Location
                </button>
              </div>
            `)
            .openPopup();

          onLocationSelect({ lat, lng, address });

          // Remove marker after 5 seconds
          setTimeout(() => {
            if (tempMarker && map.hasLayer(tempMarker)) {
              tempMarker.remove();
            }
          }, 5000);
        })
        .catch(error => {
          console.error('Error fetching location details:', error);
          onLocationSelect({ 
            lat, 
            lng, 
            address: `Custom location at ${lat.toFixed(4)}, ${lng.toFixed(4)}` 
          });
        });
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [mapReady, interactive, onLocationSelect]);

  const centerOnUser = () => {
    if (mapReady && userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15);
      if (userMarker) {
        userMarker.openPopup();
      }
    }
  };

  return (
    <div className="hostelhub-interactive-map">
      <div className="hostelhub-map-container">
        <div 
          ref={mapRef} 
          className="hostelhub-map"
        />
        
        <div className="hostelhub-map-controls">
          {userLocation && (
            <button 
              onClick={centerOnUser}
              className="hostelhub-map-control-button"
              title="Center on my location"
            >
              <FaCrosshairs />
            </button>
          )}
        </div>

        <div className="hostelhub-map-legend">
          <div className="hostelhub-legend-item">
            <div className="hostelhub-legend-dot" style={{ background: '#0077cc' }}></div>
            <span>Your Location</span>
          </div>
          <div className="hostelhub-legend-item">
            <div className="hostelhub-legend-dot" style={{ background: '#4cd964' }}></div>
            <span>Available Hostels</span>
          </div>
          <div className="hostelhub-legend-item">
            <div className="hostelhub-legend-dot" style={{ background: '#ff9500' }}></div>
            <span>Selected Location</span>
          </div>
        </div>
      </div>

      {!mapReady && (
        <div className="hostelhub-map-loading">
          <div className="hostelhub-loading-spinner"></div>
          <p>Loading map with street details...</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;