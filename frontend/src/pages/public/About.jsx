// src/pages/public/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaBullseye, FaHandshake } from 'react-icons/fa';
import styles from './About.module.css';

const About = () => {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.aboutHero}>
        <h1 className={styles.aboutTitle}>About HostelHub</h1>
        <p className={styles.aboutSubtitle}>
          Connecting students with quality accommodation since 2024
        </p>
      </div>

      <div className={styles.aboutContent}>
        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>Our Story</h2>
          <p className={styles.sectionText}>
            HostelHub was born out of a simple observation: finding quality student 
            accommodation is often a stressful and time-consuming process. As former 
            students ourselves, we experienced firsthand the challenges of searching 
            for safe, affordable, and conveniently located hostels.
          </p>
          <p className={styles.sectionText}>
            We created HostelHub to transform this experience, making it easier for 
            students to find their perfect home away from home, while helping hostel 
            owners effectively manage their properties and connect with students.
          </p>
        </section>

        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <div className={styles.missionGrid}>
            <div className={styles.missionCard}>
              <FaUsers className={styles.missionIcon} />
              <h3>For Students</h3>
              <p>Provide a seamless, stress-free hostel search and booking experience</p>
            </div>
            
            <div className={styles.missionCard}>
              <FaBullseye className={styles.missionIcon} />
              <h3>For Owners</h3>
              <p>Offer powerful tools to manage listings and connect with students</p>
            </div>
            
            <div className={styles.missionCard}>
              <FaHandshake className={styles.missionIcon} />
              <h3>For Everyone</h3>
              <p>Build a trusted community of verified listings and authentic reviews</p>
            </div>
          </div>
        </section>

        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>Our Values</h2>
          <div className={styles.valuesList}>
            <div className={styles.valueItem}>
              <h3>Trust & Safety</h3>
              <p>All hostels are verified, and all payments are securely processed</p>
            </div>
            
            <div className={styles.valueItem}>
              <h3>Transparency</h3>
              <p>Clear pricing, accurate information, and honest reviews</p>
            </div>
            
            <div className={styles.valueItem}>
              <h3>Community</h3>
              <p>Building connections between students and hostel owners</p>
            </div>
            
            <div className={styles.valueItem}>
              <h3>Innovation</h3>
              <p>Continuously improving our platform with student-focused features</p>
            </div>
          </div>
        </section>

        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>Join Our Community</h2>
          <p className={styles.sectionText}>
            Whether you're a student searching for accommodation or a hostel owner 
            looking to reach more students, HostelHub is here to help.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/register" className={styles.primaryButton}>
              Get Started as Student
            </Link>
            <Link to="/hostels" className={styles.secondaryButton}>
              List Your Hostel
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;