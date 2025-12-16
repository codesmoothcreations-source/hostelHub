// src/pages/hostels/Hostels.jsx - UPDATED WITH PRICE RANGE AND RADIUS VALIDATION
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hostelsAPI } from '../../api';
import { useGeolocation } from '../../hooks/useGeolocation';
import HostelCard from '../../components/hostels/HostelCard';
import InteractiveMap from '../../components/maps/InteractiveMap';
import HostelFilters from '../../components/hostels/HostelFilters';
import { 
  FaMapMarkerAlt, 
  FaFilter, 
  FaSort, 
  FaSearch, 
  FaHome, 
  FaMap,
  FaTimes,
  FaSlidersH,
  FaMoneyBillWave
} from 'react-icons/fa';
import "./Hostels.css"

// --- Constants for Radius Validation ---
const DEFAULT_RADIUS_KM = 5;
const MIN_RADIUS_KM = 0.1;
const MAX_RADIUS_KM = 100;

const Hostels = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || ''
  });
  
  // Get user location
  const { location: userLocation, error: locationError } = useGeolocation();

  // Get query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const amenities = searchParams.get('amenities')?.split(',') || [];
  // CHANGE 1: Use a safe default for radius
  const radius = searchParams.get('radiusKm') || DEFAULT_RADIUS_KM.toString();

  useEffect(() => {
    fetchHostels();
  }, [searchParams, userLocation]);

  const fetchHostels = async () => {
    setLoading(true);
    setError('');
    
    // CHANGE 2: Validate and sanitize the radius value
    const rawRadius = searchParams.get('radiusKm');
    let safeRadiusKm = DEFAULT_RADIUS_KM;
    
    // Attempt to convert to a number
    const numRadius = Number(rawRadius);

    if (
        !isNaN(numRadius) && 
        numRadius >= MIN_RADIUS_KM && 
        numRadius <= MAX_RADIUS_KM
    ) {
        // Use the query parameter if it is a valid number within the range
        safeRadiusKm = numRadius;
    } else if (rawRadius !== null) {
        // If it was provided but invalid (e.g., "0", "abc", or > 100), log and use default
        console.warn(`Invalid radiusKm provided: ${rawRadius}. Using default: ${DEFAULT_RADIUS_KM} km.`);
        // Note: safeRadiusKm is already set to DEFAULT_RADIUS_KM
    }


    try {
      const params = {
        page,
        limit,
        ...(search && { search }),
        sort,
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(amenities.length > 0 && { amenities: amenities.join(',') }),
        // CHANGE 3: Use the validated number value
        radiusKm: safeRadiusKm
      };

      // Add location if available
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      
      // Log the final, safe parameters
      console.log('Fetching hostels with params:', params);

      const response = await hostelsAPI.getHostels(params);
      setHostels(response.data.hostels || []);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      
      // ... (rest of your error handling remains the same)
      if (error.response?.status === 422) {
        // Try without location/radius if validation fails
        try {
          const simpleParams = { 
            page, 
            limit, 
            sort, 
            ...(search && { search }),
            ...(minPrice && { minPrice }),
            ...(maxPrice && { maxPrice })
          };
          const simpleResponse = await hostelsAPI.getHostels(simpleParams);
          setHostels(simpleResponse.data.hostels || []);
          setError('Location services required for distance-based search. Showing all hostels.');
        } catch (e) {
          setError('Failed to load hostels. Please try again.');
        }
      } else {
        setError('Failed to load hostels. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSortChange = (sortBy) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortBy);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePriceRangeChange = (type, value) => {
    const newPriceRange = { ...priceRange, [type]: value };
    setPriceRange(newPriceRange);
  };

  const applyPriceFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    
    if (priceRange.min) {
      newParams.set('minPrice', priceRange.min);
    } else {
      newParams.delete('minPrice');
    }
    
    if (priceRange.max) {
      newParams.set('maxPrice', priceRange.max);
    } else {
      newParams.delete('maxPrice');
    }
    
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearPriceFilter = () => {
    setPriceRange({ min: '', max: '' });
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('minPrice');
    newParams.delete('maxPrice');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleFilterChange = (filters) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Update all filter parameters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        if (Array.isArray(filters[key])) {
          newParams.set(key, filters[key].join(','));
        } else {
          newParams.set(key, filters[key]);
        }
      } else {
        newParams.delete(key);
      }
    });
    
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setPriceRange({ min: '', max: '' });
    const newParams = new URLSearchParams();
    newParams.set('page', '1');
    newParams.set('limit', '12');
    newParams.set('sort', '-createdAt');
    // Set a valid default radius
    newParams.set('radiusKm', DEFAULT_RADIUS_KM.toString()); 
    setSearchParams(newParams);
    setShowFilters(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (minPrice || maxPrice) count++;
    if (amenities.length > 0) count++;
    // Check against the safe default constant
    if (radius !== DEFAULT_RADIUS_KM.toString()) count++; 
    return count;
  };

  const getNearbyHostelsCount = () => {
    if (!userLocation) return 0;
    return hostels.filter(h => h.distance && h.distance <= 5000).length;
  };

  return (
    <div className="hostelhub-hostels-page">
      <div className="hostelhub-hostels-header">
        <h1 className="hostelhub-hostels-title">Available Hostels</h1>
        <p className="hostelhub-hostels-subtitle">
          {userLocation 
            ? `Showing hostels near your location (${getNearbyHostelsCount()} nearby)`
            : 'Find your perfect student accommodation'}
        </p>
      </div>

      {userLocation && (
        <div className="hostelhub-location-banner">
          <FaMapMarkerAlt className="hostelhub-location-icon" />
          <div className="hostelhub-location-info">
            <p>Your location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</p>
            <p className="hostelhub-location-accuracy">
              Accuracy: ±{Math.round(userLocation.accuracy)} meters
            </p>
          </div>
        </div>
      )}

      {locationError && (
        <div className="hostelhub-location-warning">
          <FaMapMarkerAlt />
          <p>{locationError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="hostelhub-retry-location"
          >
            Retry Location
          </button>
        </div>
      )}

      {/* Price Range Quick Filter */}
      {/* <div className="hostelhub-quick-price-filter">
        <div className="hostelhub-price-filter-header">
          <FaMoneyBillWave className="hostelhub-price-icon" />
          <h3>Filter by Price (GH₵)</h3>
        </div>
        
        <div className="hostelhub-price-inputs">
          <div className="hostelhub-price-input-group">
            <label htmlFor="minPrice" className="hostelhub-price-label">Min Price</label>
            <input
              type="number"
              id="minPrice"
              value={priceRange.min}
              onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              className="hostelhub-price-input"
              placeholder="Min"
              min="0"
              step="10"
            />
          </div>
          
          <div className="hostelhub-price-separator">to</div>
          
          <div className="hostelhub-price-input-group">
            <label htmlFor="maxPrice" className="hostelhub-price-label">Max Price</label>
            <input
              type="number"
              id="maxPrice"
              value={priceRange.max}
              onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              className="hostelhub-price-input"
              placeholder="Max"
              min="0"
              step="10"
            />
          </div>
          
          <div className="hostelhub-price-buttons">
            <button
              onClick={applyPriceFilter}
              className="hostelhub-apply-price-button"
              disabled={!priceRange.min && !priceRange.max}
            >
              Apply Price Filter
            </button>
            
            {(minPrice || maxPrice) && (
              <button
                onClick={clearPriceFilter}
                className="hostelhub-clear-price-button"
              >
                <FaTimes />
                Clear
              </button>
            )}
          </div>
        </div>
        
        {(minPrice || maxPrice) && (
          <div className="hostelhub-active-price-filter">
            <span>Active filter:</span>
            <span className="hostelhub-price-filter-value">
              {minPrice ? `GH₵${minPrice}` : 'Any'} - {maxPrice ? `GH₵${maxPrice}` : 'Any'}
            </span>
          </div>
        )}
      </div> */}

      <div className="hostelhub-hostels-controls">
        <div className="hostelhub-search-container">
          <FaSearch className="hostelhub-search-icon" />
          <input
            type="text"
            placeholder="Search hostels by name, location, or amenities..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="hostelhub-search-input"
          />
        </div>

        <div className="hostelhub-controls-buttons">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="hostelhub-control-button"
          >
            <FaFilter className="hostelhub-control-icon" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="hostelhub-filter-count">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
          
          <div className="hostelhub-sort-dropdown">
            <button className="hostelhub-control-button">
              <FaSort className="hostelhub-control-icon" />
              Sort By
            </button>
            <div className="hostelhub-sort-options">
              <button onClick={() => handleSortChange('-createdAt')}>Newest</button>
              <button onClick={() => handleSortChange('price')}>Price: Low to High</button>
              <button onClick={() => handleSortChange('-price')}>Price: High to Low</button>
              {userLocation && (
                <button onClick={() => handleSortChange('distance')}>Nearest</button>
              )}
              <button onClick={() => handleSortChange('-rating')}>Highest Rated</button>
            </div>
          </div>

          <button
            onClick={() => setShowMap(!showMap)}
            className="hostelhub-control-button"
          >
            <FaMap className="hostelhub-control-icon" />
            {showMap ? 'List View' : 'Map View'}
          </button>
          
          {user?.role === 'owner' && (
            <Link to="/add-hostel" className="hostelhub-add-hostel-button">
              <FaHome className="hostelhub-button-icon" />
              Add Hostel
            </Link>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="hostelhub-filters-panel">
          <div className="hostelhub-filters-header">
            <h3>
              <FaSlidersH className="hostelhub-filters-icon" />
              Advanced Filters
            </h3>
          </div>
          
          <HostelFilters
            onFilterChange={handleFilterChange}
            currentFilters={{
              minPrice,
              maxPrice,
              amenities,
              radius
            }}
          />
        </div>
      )}

      {/* Active Filters Display */}
      {(minPrice || maxPrice || amenities.length > 0 || radius !== DEFAULT_RADIUS_KM.toString()) && (
        <div className="hostelhub-active-filters">
          <div className="hostelhub-active-filters-header">
            <span>Active Filters:</span>
            <button
              onClick={clearAllFilters}
              className="hostelhub-clear-filters-button"
            >
              Clear All
            </button>
          </div>
          
          <div className="hostelhub-filter-tags">
            {minPrice && (
              <span className="hostelhub-filter-tag">
                Min Price: GH₵{minPrice}
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('minPrice');
                    setSearchParams(newParams);
                  }}
                  className="hostelhub-remove-filter"
                >
                  ×
                </button>
              </span>
            )}
            
            {maxPrice && (
              <span className="hostelhub-filter-tag">
                Max Price: GH₵{maxPrice}
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('maxPrice');
                    setSearchParams(newParams);
                  }}
                  className="hostelhub-remove-filter"
                >
                  ×
                </button>
              </span>
            )}
            
            {amenities.length > 0 && (
              <span className="hostelhub-filter-tag">
                Amenities: {amenities.length} selected
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('amenities');
                    setSearchParams(newParams);
                  }}
                  className="hostelhub-remove-filter"
                >
                  ×
                </button>
              </span>
            )}
            
            {radius !== DEFAULT_RADIUS_KM.toString() && (
              <span className="hostelhub-filter-tag">
                Within {radius} km
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('radiusKm', DEFAULT_RADIUS_KM.toString());
                    setSearchParams(newParams);
                  }}
                  className="hostelhub-remove-filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
      
      {error && (
        <div className="hostelhub-error-message">
          <p>{error}</p>
        </div>
      )}

      {showMap ? (
        <div className="hostelhub-map-view">
          <InteractiveMap
            userLocation={userLocation}
            hostels={hostels}
            interactive={true}
          />
        </div>
      ) : (
        <>
          {loading ? (
            <div className="hostelhub-loading-state">
              <div className="hostelhub-loading-spinner"></div>
              <p>Loading hostels...</p>
            </div>
          ) : hostels.length === 0 ? (
            <div className="hostelhub-empty-state">
              <FaMapMarkerAlt className="hostelhub-empty-icon" />
              <h3>No hostels found</h3>
              <p>Try adjusting your search terms, price range, or filters</p>
              {(minPrice || maxPrice || amenities.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="hostelhub-clear-filters-button"
                >
                  Clear All Filters
                </button>
              )}
              {user?.role === 'owner' && (
                <Link to="/add-hostel" className="hostelhub-add-first-hostel">
                  Add Your First Hostel
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="hostelhub-results-summary">
                <p>
                  Showing <strong>{hostels.length}</strong> hostels
                  {minPrice && ` from GH₵${minPrice}`}
                  {maxPrice && ` up to GH₵${maxPrice}`}
                  {userLocation && ` near your location`}
                </p>
              </div>
              
              <div className="hostelhub-hostels-grid">
                {hostels.map(hostel => (
                  <HostelCard key={hostel._id} hostel={hostel} user={user} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Hostels;