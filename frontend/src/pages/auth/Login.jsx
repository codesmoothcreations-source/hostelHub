// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginSchema } from '../../utils/validators';
import { FaSpinner, FaHome, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaKey } from 'react-icons/fa';
import styles from './Auth.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setError('');
    const result = await login(data.email, data.password, rememberMe);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error?.message || 'Invalid email or password');
    }
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
          
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>
            Sign in to manage your hostels or find student accommodation
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`${styles.message} ${styles.messageError}`}>
            <FaKey className={styles.messageIcon} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              <FaEnvelope /> Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {errors.email && (
              <p className={styles.errorText}>{errors.email.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.passwordHeader}>
              <label htmlFor="password" className={styles.label}>
                <FaLock /> Password
              </label>
              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password')}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
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

          {/* Remember Me Checkbox */}
          <div className={styles.rememberMe}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="rememberMe" className={styles.rememberLabel}>
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className={styles.spinner} />
                Signing In...
              </>
            ) : (
              <>
                <FaSignInAlt className={styles.buttonIcon} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerText}>or</span>
        </div>

        {/* Auth Links */}
        <div className={styles.links}>
          <p className={styles.text}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>Create Account</Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className={styles.privacyNotice}>
          <p className={styles.privacyText}>
            For security reasons, please log out when using shared devices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;