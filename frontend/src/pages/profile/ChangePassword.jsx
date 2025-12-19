// src/pages/profile/ChangePassword.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft, FaKey, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle, FaLock, FaShieldAlt, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import * as yup from 'yup';
import styles from './ChangePassword.module.css';

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your password')
});

const ChangePassword = () => {
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      if (result.success) {
        setSuccess('Password changed successfully! Redirecting to profile...');
        reset();
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError(result.error?.message || 'Failed to change password. Please check your current password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Change password error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const newPassword = watch('newPassword', '');
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const getStrengthLabel = () => {
    if (passwordStrength === 0) return 'None';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthClass = () => {
    if (passwordStrength === 0) return styles.strengthNone;
    if (passwordStrength <= 2) return styles.strengthWeak;
    if (passwordStrength <= 3) return styles.strengthFair;
    if (passwordStrength <= 4) return styles.strengthGood;
    return styles.strengthStrong;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <FaKey />
          </div>
          <div>
            <h1 className={styles.title}>Change Password</h1>
            <p className={styles.subtitle}>Update your password to keep your account secure</p>
          </div>
        </div>
        
        <Link to="/profile" className={styles.backButton}>
          <FaArrowLeft className={styles.backIcon} />
          Back to Profile
        </Link>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <div className={styles.card}>
          {/* Requirements Section */}
          <div className={styles.requirements}>
            <div className={styles.requirementsHeader}>
              <FaShieldAlt className={styles.requirementsIcon} />
              <h3 className={styles.requirementsTitle}>Password Requirements</h3>
            </div>
            <ul className={styles.requirementsList}>
              <li>At least 8 characters long</li>
              <li>Contains uppercase and lowercase letters</li>
              <li>Includes at least one number</li>
              <li>Includes at least one special character</li>
              <li>Don't reuse your previous passwords</li>
            </ul>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {success && (
              <div className={styles.successMessage}>
                <FaCheckCircle className={styles.successIcon} />
                <span>{success}</span>
              </div>
            )}
            
            {error && (
              <div className={styles.errorMessage}>
                <FaExclamationTriangle className={styles.errorIcon} />
                <span>{error}</span>
              </div>
            )}

            {/* Current Password */}
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.label}>
                <FaLock className={styles.labelIcon} />
                Current Password
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  {...register('currentPassword')}
                  className={`${styles.input} ${errors.currentPassword ? styles.inputError : ''}`}
                  placeholder="Enter your current password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className={styles.toggleButton}
                  disabled={loading}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className={styles.errorText}>{errors.currentPassword.message}</p>
              )}
            </div>

            {/* New Password */}
            <div className={styles.formGroup}>
              <div className={styles.passwordHeader}>
                <label htmlFor="newPassword" className={styles.label}>
                  <FaLock className={styles.labelIcon} />
                  New Password
                </label>
                {newPassword && (
                  <div className={styles.strengthIndicator}>
                    <span className={styles.strengthLabel}>Strength:</span>
                    <span className={`${styles.strengthValue} ${getStrengthClass()}`}>
                      {getStrengthLabel()}
                    </span>
                    <div className={styles.strengthBar}>
                      <div 
                        className={`${styles.strengthFill} ${getStrengthClass()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.passwordWrapper}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  {...register('newPassword')}
                  className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
                  placeholder="Enter your new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={styles.toggleButton}
                  disabled={loading}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.newPassword && (
                <p className={styles.errorText}>{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                <FaLock className={styles.labelIcon} />
                Confirm New Password
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Confirm your new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.toggleButton}
                  disabled={loading}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className={styles.errorText}>{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className={styles.cancelButton}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? (
                  <>
                    <FaSpinner className={styles.spinner} />
                    Changing Password...
                  </>
                ) : 'Change Password'}
              </button>
            </div>
          </form>

          {/* Security Tips */}
          <div className={styles.securityTips}>
            <div className={styles.tipsHeader}>
              <FaInfoCircle className={styles.tipsIcon} />
              <h4 className={styles.tipsTitle}>Security Tips</h4>
            </div>
            <ul className={styles.tipsList}>
              <li>Never share your password with anyone</li>
              <li>Use a unique password for HostelHub</li>
              <li>Consider using a password manager</li>
              <li>Log out from shared computers</li>
              <li>Enable two-factor authentication if available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;