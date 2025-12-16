// src/pages/profile/ChangePassword.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import * as yup from 'yup';
import "./ChangePassword.css"

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(6, 'Password must be at least 6 characters')
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
    reset
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
        setSuccess('Password changed successfully!');
        reset();
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError(result.error?.message || 'Failed to change password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Change password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hostelhub-change-password-page">
      <div className="hostelhub-change-password-header">
        <Link to="/profile" className="hostelhub-back-link">
          <FaArrowLeft className="hostelhub-back-icon" />
          Back to Profile
        </Link>
        
        <h1 className="hostelhub-change-password-title">
          <FaKey className="hostelhub-title-icon" />
          Change Password
        </h1>
      </div>

      <div className="hostelhub-change-password-container">
        <div className="hostelhub-change-password-card">
          <div className="hostelhub-password-info">
            <h3 className="hostelhub-info-title">Password Requirements</h3>
            <ul className="hostelhub-requirements-list">
              <li>At least 6 characters long</li>
              <li>Use a combination of letters and numbers</li>
              <li>Avoid common words and patterns</li>
              <li>Don't reuse your previous passwords</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="hostelhub-password-form">
            {success && (
              <div className="hostelhub-success-message">
                {success}
              </div>
            )}
            
            {error && (
              <div className="hostelhub-error-message">
                {error}
              </div>
            )}

            <div className="hostelhub-formgroup">
              <label htmlFor="currentPassword" className="hostelhub-form-label">
                Current Password
              </label>
              <div className="hostelhub-password-input-wrapper">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  {...register('currentPassword')}
                  className="hostelhub-form-input"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="hostelhub-password-toggle"
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="hostelhub-form-error">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="hostelhub-formgroup">
              <label htmlFor="newPassword" className="hostelhub-form-label">
                New Password
              </label>
              <div className="hostelhub-password-input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  {...register('newPassword')}
                  className="hostelhub-form-input"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="hostelhub-password-toggle"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="hostelhub-form-error">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="hostelhub-form-group">
              <label htmlFor="confirmPassword" className="hostelhub-form-label">
                Confirm New Password
              </label>
              <div className="hostelhub-password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  className="hostelhub-form-input"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="hostelhub-password-toggle"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="hostelhub-form-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="hostelhub-form-actions">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="hostelhub-cancel-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="hostelhub-save-button"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>

          <div className="hostelhub-security-tips">
            <h4 className="hostelhub-tips-title">Security Tips</h4>
            <ul className="hostelhub-tips-list">
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