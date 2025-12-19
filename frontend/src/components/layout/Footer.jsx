// src/components/Footer/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Animated background elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.bgElement1}></div>
        <div className={styles.bgElement2}></div>
        <div className={styles.bgElement3}></div>
      </div>

      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.mainContent}>
          {/* Brand Section */}
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <span className={styles.logoText}>HOSTEL</span>
              <span className={styles.logoAccent}>HUB</span>
            </div>
            <p className={styles.tagline}>
              Premium Student Accommodation Management
            </p>
            <div className={styles.glowDivider}></div>
            {/* <p className={styles.description}>
              Transform your hostel management experience with our cutting-edge platform designed for modern administrators.
            </p> */}
          </div>

          {/* Quick Links */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.titleGlow}>Quick Links</span>
            </h3>
            <ul className={styles.linksList}>
              {[
                { path: '/dashboard', label: 'Dashboard' },
                { path: '/hostels', label: 'Browse Hostels' },
                { path: '/messages', label: 'Messages' },
                { path: '/bookings', label: 'Bookings' },
              ].map((link) => (
                <li key={link.path} className={styles.linkItem}>
                  <Link 
                    to={link.path} 
                    className={styles.link}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateX(8px)';
                      e.target.style.color = '#00e5ff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateX(0)';
                      e.target.style.color = '';
                    }}
                  >
                    <span className={styles.linkArrow}>→</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className={styles.legalSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.titleGlow}>Legal</span>
            </h3>
            <ul className={styles.linksList}>
              {[
                { path: '/privacy', label: 'Privacy Policy' },
                { path: '/terms', label: 'Terms of Service' },
                { path: '/', label: 'Home' },
                { path: '/about', label: 'About' },
                { path: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.path} className={styles.linkItem}>
                  <Link 
                    to={link.path} 
                    className={styles.link}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact/Newsletter */}
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.titleGlow}>Stay Updated</span>
            </h3>
            <p className={styles.newsletterText}>
              Subscribe to get premium updates and feature announcements
            </p>
            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Your email address"
                className={styles.newsletterInput}
              />
              <button className={styles.newsletterButton}>
                <span className={styles.buttonText}>Subscribe</span>
                <span className={styles.buttonIcon}>→</span>
              </button>
            </div>
            <div className={styles.contactInfo}>
              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>Support:</span>
                support@hostelhub.com
              </p>
              <p className={styles.contactItem}>
                <span className={styles.contactLabel}>Sales:</span>
                sales@hostelhub.com
              </p>
            </div>
          </div>
        </div>

        {/* Social Media & Bottom Section */}
        <div className={styles.bottomSection}>
          {/* Social Media */}
          <div className={styles.socialContainer}>
            <div className={styles.socialTitle}>Connect With Us</div>
            <div className={styles.socialLinks}>
              {[
                { icon: <Facebook />, label: 'Facebook', href: '#' },
                { icon: <Twitter />, label: 'Twitter', href: '#' },
                { icon: <Instagram />, label: 'Instagram', href: '#' },
                { icon: <Linkedin />, label: 'LinkedIn', href: '#' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className={styles.socialLink}
                  aria-label={social.label}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 229, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 229, 255, 0.3)';
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className={styles.divider}></div>

          {/* Copyright */}
          <div className={styles.copyrightSection}>
            <div className={styles.copyrightContent}>
              <p className={styles.copyright}>
                © {new Date().getFullYear()} <span className={styles.copyrightAccent}>HostelHub</span>. 
                All rights reserved.
              </p>
              <p className={styles.madeWith}>
                Crafted with <Heart className={styles.heartIcon} /> for premium hostel management
              </p>
              <div className={styles.techBadges}>
                <span className={styles.techBadge}>React 18</span>
                <span className={styles.techBadge}>Node.js</span>
                <span className={styles.techBadge}>MongoDB</span>
                <span className={styles.techBadge}>Premium UI</span>
              </div>
            </div>
            
            {/* Floating animation indicator */}
            <div className={styles.floatIndicator}>
              <div className={styles.floatDot}></div>
              <div className={styles.floatText}>
                Always Innovating
                <br />
                blinkweb
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;