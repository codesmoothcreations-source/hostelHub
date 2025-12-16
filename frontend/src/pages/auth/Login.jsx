// src/pages/auth/Login.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginSchema } from '../../utils/validators';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="hostelhub-auth-page">1
      <div className="hostelhub-auth-container">
        <h1 className="hostelhub-auth-title">Login to HostelHub</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="hostelhub-auth-form">
          <div className="hostelhub-formgroup">
            <label htmlFor="email" className="hostelhub-form-label">Email</label>
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
            <label htmlFor="password" className="hostelhub-form-label">Password</label>
            <input
              type="password"
              id="password"
              {...register('password')}
              className="hostelhub-form-input"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="hostelhub-form-error">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="hostelhub-auth-button"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="hostelhub-auth-links">
          <p className="hostelhub-auth-text">
            Don't have an account?{' '}
            <Link to="/register" className="hostelhub-auth-link">Register here</Link>
          </p>
          <Link to="/forgot-password" className="hostelhub-auth-link">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;