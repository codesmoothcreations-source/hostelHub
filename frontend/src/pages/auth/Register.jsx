// src/pages/auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { registerSchema } from '../../utils/validators';
import { FaMapMarkerAlt, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaHome, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import styles from './Auth.module.css';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  
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

  useEffect(() => {
    if (location) {
      setValue('lat', location.lat);
      setValue('lng', location.lng);
      
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
      setValue('address', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const handleManualLocation = () => {
    setValue('lat', '');
    setValue('lng', '');
    setValue('address', '');
  };

  const onSubmit = async (data) => {
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
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header with Logo */}
        <div className={styles.header}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <FaHome />
            </div>
            <span className={styles.logoText}>HostelHub</span>
          </Link>
          
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>
            Join HostelHub and find your perfect student accommodation
          </p>
        </div>

        {/* Location Banner */}
        <div className={styles.locationBanner}>
          <div className={styles.locationStatus}>
            <FaMapMarkerAlt className={styles.locationIcon} />
            <div className={styles.locationInfo}>
              <h4>Location Services</h4>
              <p className={styles.locationText}>
                {getLocationStatus()}
              </p>
              {location && (
                <p className={styles.locationCoordinates}>
                  Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
          
          {locationError && (
            <div className={styles.locationError}>
              <FaExclamationTriangle />
              <p>{locationError}</p>
            </div>
          )}
          
          {location && (
            <div className={styles.locationSuccess}>
              <FaCheckCircle />
              <p>Location captured successfully!</p>
            </div>
          )}
        </div>

        {/* Role Selector */}
        <div className={styles.roleSelector}>
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`${styles.roleButton} ${selectedRole === 'student' ? styles.roleButtonActive : ''}`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('owner')}
            className={`${styles.roleButton} ${selectedRole === 'owner' ? styles.roleButtonActive : ''}`}
          >
            Hostel Owner
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              <FaUser /> Full Name *
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className={styles.errorText}>{errors.name.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              <FaEnvelope /> Email *
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className={styles.errorText}>{errors.email.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              <FaPhone /> Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              className={styles.input}
              placeholder="Enter your phone number"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              <FaLock /> Password *
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password')}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="Create a password (min. 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.toggleButton}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className={styles.errorText}>{errors.password.message}</p>
            )}
          </div>

          {/* Location fields */}
          <div className={styles.hidden}>
            <input type="hidden" {...register('lat')} />
            <input type="hidden" {...register('lng')} />
            <input type="hidden" {...register('address')} />
            
            {watch('address') && (
              <div className={styles.detectedLocation}>
                <p><strong>Detected Location:</strong> {watch('address')}</p>
                <button
                  type="button"
                  onClick={handleManualLocation}
                  className={styles.changeLocation}
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
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className={styles.spinner} />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className={styles.links}>
          <p className={styles.text}>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>Login here</Link>
          </p>
        </div>

        {/* Privacy Notice */}
        <div className={styles.privacyNotice}>
          <p className={styles.privacyText}>
            We use your location to show nearby hostels and improve your experience. 
            Your location data is stored securely and never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;