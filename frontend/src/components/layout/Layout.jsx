import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';

const Layout = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Trigger loading state on route change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600); // Slightly longer for smoother transition
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className={styles.layout}>
      {/* Dynamic Background Elements */}
      <div className={styles.decorations}>
        <div className={`${styles.star} ${styles.s1}`} />
        <div className={`${styles.star} ${styles.s2}`} />
        <div className={`${styles.star} ${styles.s3}`} />
        <div className={`${styles.glowTop}`} />
        <div className={`${styles.glowBottom}`} />
      </div>
      
      {/* Floating Particles */}
      <div className={styles.particleContainer}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.particle} style={{ '--delay': `${i * 3}s`, '--left': `${10 + (i * 15)}%` }} />
        ))}
      </div>
      
      <Header />

      <main className={styles.main}>
        {loading ? (
          <div className={styles.loadingOverlay}>
            <div className={styles.loaderWrapper}>
              <div className={styles.loader}></div>
              <div className={styles.loaderText}>Syncing Hub...</div>
            </div>
          </div>
        ) : (
          <div className={styles.contentWrapper}>
            <Outlet />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;