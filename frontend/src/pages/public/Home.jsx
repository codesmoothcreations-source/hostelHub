// src/pages/public/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaShieldAlt, FaComments, FaStar, FaRocket, FaHeart } from 'react-icons/fa';
import styles from './Home.module.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <FaHeart className={styles.heartIcon} /> <span>Trusted by 10k+ Students</span>
          </div>
          <h1 className={styles.heroTitle}>
            Your Dream Space, <br /><span>Simplified.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Find and book verified hostels with a single tap. 
            The modern way to manage your student life.
          </p>
          
          <div className={styles.heroActions}>
            <Link to={isAuthenticated ? "/hostels" : "/register"} className={styles.primaryButton}>
              {isAuthenticated ? <FaSearch /> : <FaRocket />}
              {isAuthenticated ? "Explore Now" : "Join the Hub"}
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className={styles.secondaryButton}>
                Member Login
              </Link>
            )}
          </div>
        </div>
        
        {/* Floating Decor Elements for 'Cute' factor */}
        <div className={`${styles.floatCircle} ${styles.c1}`}></div>
        <div className={`${styles.floatCircle} ${styles.c2}`}></div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.featuresTitle}>Why you'll love us</h2>
          <div className={styles.titleUnderline}></div>
        </div>

        <div className={styles.featuresGrid}>
          {[
            { icon: <FaSearch />, title: "Smart Search", desc: "Filters that actually work for you." },
            { icon: <FaShieldAlt />, title: "Verified stays", desc: "Safety first. Always verified." },
            { icon: <FaComments />, title: "Fast Chat", desc: "Talk to owners in real-time." },
            { icon: <FaStar />, title: "Real Reviews", desc: "Honest feedback from students." }
          ].map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section - More Compact */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <h3>500+</h3>
            <p>Hostels</p>
          </div>
          <div className={styles.statItem}>
            <h3>10k+</h3>
            <p>Students</p>
          </div>
          <div className={styles.statItem}>
            <h3>98%</h3>
            <p>Happy</p>
          </div>
        </div>
      </section>

      {/* CTA Section - Gradient Transition */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to move in?</h2>
          <p>Secure your spot in seconds.</p>
          <Link to="/register" className={styles.ctaButton}>Get Started ✨</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;