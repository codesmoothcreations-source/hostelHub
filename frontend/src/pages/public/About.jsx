// src/pages/public/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaBullseye, FaHandshake } from 'react-icons/fa';
import "./About.css"

const About = () => {
  return (
    <div className="hostelhub-about-page">
      <div className="hostelhub-about-hero">
        <h1 className="hostelhub-about-title">About HostelHub</h1>
        <p className="hostelhub-about-subtitle">
          Connecting students with quality accommodation since 2024
        </p>
      </div>

      <div className="hostelhub-about-content">
        <section className="hostelhub-about-section">
          <h2 className="hostelhub-section-title">Our Story</h2>
          <p className="hostelhub-section-text">
            HostelHub was born out of a simple observation: finding quality student 
            accommodation is often a stressful and time-consuming process. As former 
            students ourselves, we experienced firsthand the challenges of searching 
            for safe, affordable, and conveniently located hostels.
          </p>
          <p className="hostelhub-section-text">
            We created HostelHub to transform this experience, making it easier for 
            students to find their perfect home away from home, while helping hostel 
            owners effectively manage their properties and connect with students.
          </p>
        </section>

        <section className="hostelhub-about-section">
          <h2 className="hostelhub-section-title">Our Mission</h2>
          <div className="hostelhub-mission-grid">
            <div className="hostelhub-mission-card">
              <FaUsers className="hostelhub-mission-icon" />
              <h3>For Students</h3>
              <p>Provide a seamless, stress-free hostel search and booking experience</p>
            </div>
            
            <div className="hostelhub-mission-card">
              <FaBullseye className="hostelhub-mission-icon" />
              <h3>For Owners</h3>
              <p>Offer powerful tools to manage listings and connect with students</p>
            </div>
            
            <div className="hostelhub-mission-card">
              <FaHandshake className="hostelhub-mission-icon" />
              <h3>For Everyone</h3>
              <p>Build a trusted community of verified listings and authentic reviews</p>
            </div>
          </div>
        </section>

        <section className="hostelhub-about-section">
          <h2 className="hostelhub-section-title">Our Values</h2>
          <div className="hostelhub-values-list">
            <div className="hostelhub-value-item">
              <h3>Trust & Safety</h3>
              <p>All hostels are verified, and all payments are securely processed</p>
            </div>
            
            <div className="hostelhub-value-item">
              <h3>Transparency</h3>
              <p>Clear pricing, accurate information, and honest reviews</p>
            </div>
            
            <div className="hostelhub-value-item">
              <h3>Community</h3>
              <p>Building connections between students and hostel owners</p>
            </div>
            
            <div className="hostelhub-value-item">
              <h3>Innovation</h3>
              <p>Continuously improving our platform with student-focused features</p>
            </div>
          </div>
        </section>

        <section className="hostelhub-about-section">
          <h2 className="hostelhub-section-title">Join Our Community</h2>
          <p className="hostelhub-section-text">
            Whether you're a student searching for accommodation or a hostel owner 
            looking to reach more students, HostelHub is here to help.
          </p>
          <div className="hostelhub-cta-buttons">
            <Link to="/register" className="hostelhub-primary-button">
              Get Started as Student
            </Link>
            <Link to="/register" className="hostelhub-secondary-button">
              List Your Hostel
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;