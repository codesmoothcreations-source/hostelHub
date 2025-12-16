// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import "./Footer.css"

const Footer = () => {
  return (
    <footer className="hostelhub-footer">
      <div className="hostelhub-footer-wrapper">
        <div className="hostelhub-footer-content">
          <div className="hostelhub-footer-section">
            <div className="hostelhub-footer-brand">
              <h3 className="hostelhub-footer-title">HostelHub</h3>
              <p className="hostelhub-footer-description">
                Your trusted platform for finding and booking student hostels.
              </p>
            </div>
          </div>
          
          <div className="hostelhub-footer-section">
            <h4 className="hostelhub-footer-subtitle">Quick Links</h4>
            <ul className="hostelhub-footer-links">
              <li><Link to="/" className="hostelhub-footer-link">Home</Link></li>
              <li><Link to="/hostels" className="hostelhub-footer-link">Browse Hostels</Link></li>
              <li><Link to="/about" className="hostelhub-footer-link">About Us</Link></li>
              <li><Link to="/contact" className="hostelhub-footer-link">Contact</Link></li>
            </ul>
          </div>
          
          <div className="hostelhub-footer-section">
            <h4 className="hostelhub-footer-subtitle">Legal</h4>
            <ul className="hostelhub-footer-links">
              <li><Link to="/privacy" className="hostelhub-footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hostelhub-footer-link">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="hostelhub-footer-social">
          <a href="#" className="hostelhub-footer-social-link" aria-label="Facebook">FB</a>
          <a href="#" className="hostelhub-footer-social-link" aria-label="Twitter">TW</a>
          <a href="#" className="hostelhub-footer-social-link" aria-label="Instagram">IG</a>
          <a href="#" className="hostelhub-footer-social-link" aria-label="LinkedIn">IN</a>
        </div>
        
        <div className="hostelhub-footer-bottom">
          <div className="hostelhub-footer-bottom-content">
            <p className="hostelhub-copyright">
              © {new Date().getFullYear()} HostelHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;