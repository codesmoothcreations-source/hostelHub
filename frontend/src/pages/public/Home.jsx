// src/pages/public/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaHome, FaShieldAlt, FaComments, FaStar } from 'react-icons/fa';
import "./Home.css"

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="hostelhub-home-page">
      {/* Hero Section */}
      <section className="hostelhub-hero">
        <div className="hostelhub-hero-content">
          <h1 className="hostelhub-hero-title">
            Find Your Perfect Student Accommodation
          </h1>
          <p className="hostelhub-hero-subtitle">
            Browse, book, and manage hostels with ease. HostelHub connects students 
            with verified hostel owners for a seamless accommodation experience.
          </p>
          
          <div className="hostelhub-hero-actions">
            {isAuthenticated ? (
              <>
                <Link to="/hostels" className="hostelhub-primary-button">
                  <FaSearch className="hostelhub-button-icon" />
                  Browse Hostels
                </Link>
                <Link to="/dashboard" className="hostelhub-secondary-button">
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="hostelhub-primary-button">
                  Get Started
                </Link>
                <Link to="/login" className="hostelhub-secondary-button">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="hostelhub-features">
        <div className="hostelhub-features-header">
          <h2 className="hostelhub-features-title">Why Choose HostelHub?</h2>
          <p className="hostelhub-features-subtitle">
            Everything you need for a stress-free hostel experience
          </p>
        </div>

        <div className="hostelhub-features-grid">
          <div className="hostelhub-feature-card">
            <div className="hostelhub-feature-icon">
              <FaSearch />
            </div>
            <h3 className="hostelhub-feature-title">Easy Search</h3>
            <p className="hostelhub-feature-description">
              Find hostels near your campus with advanced filters and location-based search.
            </p>
          </div>

          <div className="hostelhub-feature-card">
            <div className="hostelhub-feature-icon">
              <FaShieldAlt />
            </div>
            <h3 className="hostelhub-feature-title">Secure Booking</h3>
            <p className="hostelhub-feature-description">
              Secure payments with Paystack and verified hostel listings for your safety.
            </p>
          </div>

          <div className="hostelhub-feature-card">
            <div className="hostelhub-feature-icon">
              <FaComments />
            </div>
            <h3 className="hostelhub-feature-title">Direct Communication</h3>
            <p className="hostelhub-feature-description">
              Chat directly with hostel owners for inquiries and booking arrangements.
            </p>
          </div>

          <div className="hostelhub-feature-card">
            <div className="hostelhub-feature-icon">
              <FaStar />
            </div>
            <h3 className="hostelhub-feature-title">Verified Reviews</h3>
            <p className="hostelhub-feature-description">
              Read authentic reviews from students who have stayed in the hostels.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hostelhub-cta">
        <div className="hostelhub-cta-content">
          <h2 className="hostelhub-cta-title">Ready to find your new home?</h2>
          <p className="hostelhub-cta-text">
            Join thousands of students who have found their perfect accommodation through HostelHub.
          </p>
          <Link to={isAuthenticated ? "/hostels" : "/register"} className="hostelhub-cta-button">
            {isAuthenticated ? "Browse Hostels Now" : "Get Started Free"}
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="hostelhub-stats">
        <div className="hostelhub-stats-grid">
          <div className="hostelhub-stat-item">
            <h3 className="hostelhub-stat-number">500+</h3>
            <p className="hostelhub-stat-label">Hostels Listed</p>
          </div>
          <div className="hostelhub-stat-item">
            <h3 className="hostelhub-stat-number">10,000+</h3>
            <p className="hostelhub-stat-label">Happy Students</p>
          </div>
          <div className="hostelhub-stat-item">
            <h3 className="hostelhub-stat-number">98%</h3>
            <p className="hostelhub-stat-label">Satisfaction Rate</p>
          </div>
          <div className="hostelhub-stat-item">
            <h3 className="hostelhub-stat-number">24/7</h3>
            <p className="hostelhub-stat-label">Support Available</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;