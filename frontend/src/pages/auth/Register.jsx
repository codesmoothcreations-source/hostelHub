// src/pages/auth/Register.jsx - UPDATED WITH GEOLOCATION
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { registerSchema } from '../../utils/validators';
import { FaMapMarkerAlt, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import "./auth.css"

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState('student');
  
  // Use geolocation hook
  const { location, error: locationError, loading: locationLoading, permission } = useGeolocation();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(registerSchema)
  });

  // Auto-fill location when available
  useEffect(() => {
    if (location) {
      setValue('lat', location.lat);
      setValue('lng', location.lng);
      
      // Reverse geocode to get address
      getAddressFromCoordinates(location.lat, location.lng);
    }
  }, [location, setValue]);

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setValue('address', data.display_name);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to coordinates
      setValue('address', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const handleManualLocation = () => {
    // Allow user to manually enter location
    setValue('lat', '');
    setValue('lng', '');
    setValue('address', '');
  };

  const onSubmit = async (data) => {
    // If no location, ask user to enable it
    if (!data.lat || !data.lng) {
      alert('Please enable location services for better experience. You can add location later in profile settings.');
    }

    const userData = {
      ...data,
      role: selectedRole,
      location: data.lat && data.lng ? {
        type: 'Point',
        coordinates: [parseFloat(data.lng), parseFloat(data.lat)],
        address: data.address || 'Location not specified'
      } : undefined
    };

    const result = await registerUser(userData);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const getLocationStatus = () => {
    if (locationLoading) return 'Getting your location...';
    if (location) return 'Location found!';
    if (locationError) return 'Location error';
    if (permission === 'denied') return 'Location permission denied';
    return 'Requesting location...';
  };

  return (
    <div className="hostelhub-auth-page">
      <div className="hostelhub-auth-container">
        <h1 className="hostelhub-auth-title">Create Account</h1>
        
        <div className="hostelhub-location-banner">
          <div className="hostelhub-location-status">
            <FaMapMarkerAlt className="hostelhub-location-icon" />
            <div className="hostelhub-location-info">
              <h4>Location Services</h4>
              <p className="hostelhub-location-text">
                {getLocationStatus()}
              </p>
              {location && (
                <p className="hostelhub-location-coordinates">
                  Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
          
          {locationError && (
            <div className="hostelhub-location-error">
              <FaExclamationTriangle />
              <p>{locationError}</p>
            </div>
          )}
          
          {location && (
            <div className="hostelhub-location-success">
              <FaCheckCircle />
              <p>Location captured successfully!</p>
            </div>
          )}
        </div>

        <div className="hostelhub-role-selector">
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`hostelhub-role-button ${selectedRole === 'student' ? 'hostelhub-role-button-active' : ''}`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('owner')}
            className={`hostelhub-role-button ${selectedRole === 'owner' ? 'hostelhub-role-button-active' : ''}`}
          >
            Hostel Owner
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="hostelhub-auth-form">
          <div className="hostelhub-formgroup">
            <label htmlFor="name" className="hostelhub-form-label">Full Name *</label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className="hostelhub-form-input"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="hostelhub-form-error">{errors.name.message}</p>
            )}
          </div>

          <div className="hostelhub-formgroup">
            <label htmlFor="email" className="hostelhub-form-label">Email *</label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className="hostelhub-form-input"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="hostelhub-form-error">{errors.email.message}</p>
            )}
          </div>

          <div className="hostelhub-formgroup">
            <label htmlFor="phone" className="hostelhub-form-label">Phone Number</label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              className="hostelhub-form-input"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="hostelhub-formgroup">
            <label htmlFor="password" className="hostelhub-form-label">Password *</label>
            <input
              type="password"
              id="password"
              {...register('password')}
              className="hostelhub-form-input"
              placeholder="Create a password (min. 6 characters)"
            />
            {errors.password && (
              <p className="hostelhub-form-error">{errors.password.message}</p>
            )}
          </div>

          {/* Location fields (hidden by default) */}
          <div className="hostelhub-location-fields">
            <input type="hidden" {...register('lat')} />
            <input type="hidden" {...register('lng')} />
            <input type="hidden" {...register('address')} />
            
            {watch('address') && (
              <div className="hostelhub-detected-location">
                <p><strong>Detected Location:</strong> {watch('address')}</p>
                <button
                  type="button"
                  onClick={handleManualLocation}
                  className="hostelhub-change-location"
                >
                  Change Location
                </button>
              </div>
            )}
          </div>

          <input type="hidden" {...register('role')} value={selectedRole} />

          <button
            type="submit"
            disabled={isSubmitting || locationLoading}
            className="hostelhub-auth-button"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="hostelhub-spinner" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="hostelhub-auth-links">
          <p className="hostelhub-auth-text">
            Already have an account?{' '}
            <Link to="/login" className="hostelhub-auth-link">Login here</Link>
          </p>
        </div>

        <div className="hostelhub-location-privacy">
          <p className="hostelhub-privacy-text">
            <small>
              We use your location to show nearby hostels and improve your experience. 
              Your location data is stored securely and never shared with third parties.
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;