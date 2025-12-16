import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import "./Layout.css"

const Layout = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className="hostelhub-layout">
      {/* Decorative elements */}
      <div className="layout-decoration star" style={{ top: '20%', left: '15%' }} />
      <div className="layout-decoration star" style={{ top: '60%', right: '10%', animationDelay: '1s' }} />
      <div className="layout-decoration star" style={{ top: '40%', left: '5%', animationDelay: '2s' }} />
      <div className="layout-decoration glow" style={{ top: '-100px', right: '-100px' }} />
      <div className="layout-decoration glow" style={{ bottom: '-100px', left: '-100px' }} />
      
      {/* Floating particles in content area */}
      <div className="floating-particle" style={{ top: '20%', left: '10%' }} />
      <div className="floating-particle" style={{ top: '60%', right: '15%', animationDelay: '5s' }} />
      <div className="floating-particle" style={{ top: '40%', left: '20%', animationDelay: '10s' }} />
      <div className="floating-particle" style={{ bottom: '30%', right: '25%', animationDelay: '15s' }} />
      
      <Header />
      <main className="hostelhub-main">
        {loading ? (
          <div className="hostelhub-loading">
            <div className="hostelhub-loader"></div>
          </div>
        ) : (
          <div className="hostelhub-content-wrapper">
            <Outlet />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;