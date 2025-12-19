// src/pages/hostels/Hostels.jsx - UPDATED WITH CSS MODULES
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
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
import styles from './Hostels.module.css';

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

  // --- FIX: LOCAL SEARCH STATE ---
  // We use this to keep the input snappy and responsive
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
  
  const { location: userLocation, error: locationError } = useGeolocation();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const amenities = searchParams.get('amenities')?.split(',') || [];
  const radius = searchParams.get('radiusKm') || DEFAULT_RADIUS_KM.toString();

  useEffect(() => {
    fetchHostels();
  }, [searchParams, userLocation]);

  const fetchHostels = async () => {
    setLoading(true);
    setError('');
    
    const rawRadius = searchParams.get('radiusKm');
    let safeRadiusKm = DEFAULT_RADIUS_KM;
    const numRadius = Number(rawRadius);

    if (!isNaN(numRadius) && numRadius >= MIN_RADIUS_KM && numRadius <= MAX_RADIUS_KM) {
        safeRadiusKm = numRadius;
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
        radiusKm: safeRadiusKm
      };

      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      
      const response = await hostelsAPI.getHostels(params);
      setHostels(response.data.hostels || []);
    } catch (error) {
      if (error.response?.status === 422) {
        try {
          const simpleParams = { page, limit, sort, ...(search && { search }), ...(minPrice && { minPrice }), ...(maxPrice && { maxPrice }) };
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

  // --- FIX: DEBOUNCED SEARCH LOGIC ---
  // This updates the URL only after the user stops typing for 500ms
  const debouncedUpdateURL = useCallback(
    (() => {
      let timeout;
      return (val) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const newParams = new URLSearchParams(window.location.search);
          if (val) {
            newParams.set('search', val);
          } else {
            newParams.delete('search');
          }
          newParams.set('page', '1');
          setSearchParams(newParams);
        }, 700);
      };
    })(),
    [setSearchParams]
  );

  const handleSearch = (value) => {
    setLocalSearch(value);    // 1. Update the input instantly
    debouncedUpdateURL(value); // 2. Update the URL later
  };

  const handleSortChange = (sortBy) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortBy);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleFilterChange = (filters) => {
    const newParams = new URLSearchParams(searchParams);
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
    setLocalSearch(''); // Reset input
    setPriceRange({ min: '', max: '' });
    const newParams = new URLSearchParams();
    newParams.set('page', '1');
    newParams.set('limit', '12');
    newParams.set('sort', '-createdAt');
    newParams.set('radiusKm', DEFAULT_RADIUS_KM.toString());
    setSearchParams(newParams);
    setShowFilters(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (minPrice || maxPrice) count++;
    if (amenities.length > 0) count++;
    if (radius !== DEFAULT_RADIUS_KM.toString()) count++; 
    return count;
  };

  const getNearbyHostelsCount = () => {
    if (!userLocation) return 0;
    return hostels.filter(h => h.distance && h.distance <= 5000).length;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Available Hostels</h1>
        <p className={styles.subtitle}>
          {userLocation 
            ? `Showing hostels near your location (${getNearbyHostelsCount()} nearby)`
            : 'Find your perfect student accommodation'}
        </p>
      </div>

      {userLocation && (
        <div className={styles.locationBanner}>
          <FaMapMarkerAlt className={styles.locationIcon} />
          <div className={styles.locationInfo}>
            <p>Your location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</p>
            <p className={styles.locationAccuracy}>
              Accuracy: ±{Math.round(userLocation.accuracy)} meters
            </p>
          </div>
        </div>
      )}

      {locationError && (
        <div className={styles.locationWarning}>
          <FaMapMarkerAlt />
          <p>{locationError}</p>
          <button onClick={() => window.location.reload()} className={styles.retryLocation}>
            Retry Location
          </button>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search hostels by name, location, or amenities..."
            value={localSearch} // Changed to localSearch
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.controlsButtons}>
          <button onClick={() => setShowFilters(!showFilters)} className={styles.controlButton}>
            <FaFilter className={styles.controlIcon} />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className={styles.filterCount}>{getActiveFiltersCount()}</span>
            )}
          </button>
          
          <div className={styles.sortDropdown}>
            <button className={styles.controlButton}>
              <FaSort className={styles.controlIcon} /> Sort By
            </button>
            <div className={styles.sortOptions}>
              <button onClick={() => handleSortChange('-createdAt')}>Newest</button>
              <button onClick={() => handleSortChange('price')}>Price: Low to High</button>
              <button onClick={() => handleSortChange('-price')}>Price: High to Low</button>
              {userLocation && <button onClick={() => handleSortChange('distance')}>Nearest</button>}
              <button onClick={() => handleSortChange('-rating')}>Highest Rated</button>
            </div>
          </div>

          <button onClick={() => setShowMap(!showMap)} className={styles.controlButton}>
            <FaMap className={styles.controlIcon} />
            {showMap ? 'List View' : 'Map View'}
          </button>
          
          {user?.role === 'owner' && (
            <Link to="/add-hostel" className={styles.addHostelButton}>
              <FaHome className={styles.buttonIcon} /> Add Hostel
            </Link>
          )}
        </div>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersHeader}>
            <h3><FaSlidersH className={styles.filtersIcon} /> Advanced Filters</h3>
          </div>
          <HostelFilters
            onFilterChange={handleFilterChange}
            currentFilters={{ minPrice, maxPrice, amenities, radius }}
          />
        </div>
      )}

      {/* Results Section */}
      {showMap ? (
        <div className={styles.mapView}>
          <InteractiveMap userLocation={userLocation} hostels={hostels} interactive={true} />
        </div>
      ) : (
        <>
          {loading ? (
            <div className={styles.loadingState}><div className={styles.loadingSpinner}></div><p>Loading hostels...</p></div>
          ) : hostels.length === 0 ? (
            <div className={styles.emptyState}>
              <FaMapMarkerAlt className={styles.emptyIcon} />
              <h3>No hostels found</h3>
              <p>Try adjusting your search terms, price range, or filters</p>
              {(minPrice || maxPrice || amenities.length > 0) && (
                <button onClick={clearAllFilters} className={styles.clearFiltersButton}>Clear All Filters</button>
              )}
            </div>
          ) : (
            <>
              <div className={styles.resultsSummary}>
                <p>Showing <strong>{hostels.length}</strong> hostels</p>
              </div>
              <div className={styles.hostelsGrid}>
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