// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaHome, FaComments, FaBook, FaChartBar, FaBars, FaTimes } from 'react-icons/fa';
import { MdSpaceDashboard } from "react-icons/md";
import styles from './Header.module.css';

const Header = ({ styleType = "modern" }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            <FaHome className={styles.logoIcon} />
            <span className={styles.logoText}>HostelHub</span>
          </Link>

          <button 
            className={styles.menuButton} 
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <nav className={`${styles.nav} ${menuOpen ? styles.active : ''}`}>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={styles.navLink} 
                  onClick={() => setMenuOpen(false)}
                >
                  <MdSpaceDashboard className={styles.navIcon} />
                  <span>Dashboard</span>
                </Link>
                
                <Link 
                  to="/hostels" 
                  className={styles.navLink} 
                  onClick={() => setMenuOpen(false)}
                >
                  <FaHome className={styles.navIcon} />
                  <span>Hostels</span>
                </Link>

                <Link 
                  to="/bookings" 
                  className={styles.navLink} 
                  onClick={() => setMenuOpen(false)}
                >
                  <FaBook className={styles.navIcon} />
                  <span>Bookings</span>
                </Link>

                <Link 
                  to="/messages" 
                  className={styles.navLink} 
                  onClick={() => setMenuOpen(false)}
                >
                  <FaComments className={styles.navIcon} />
                  <span>Messages</span>
                </Link>

                {user?.role === 'owner' && (
                  <Link 
                    to="/owner-dashboard" 
                    className={styles.navLink} 
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaChartBar className={styles.navIcon} />
                    <span>Analytics</span>
                  </Link>
                )}

                <div className={styles.userMenu}>
                  <button className={styles.userButton}>
                    <FaUser className={styles.userIcon} />
                    <span>{user?.name}</span>
                  </button>
                  <div className={styles.userDropdown}>
                    <Link 
                      to="/profile" 
                      className={styles.dropdownLink} 
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    {user?.role === 'owner' && (
                      <Link 
                        to="/my-hostels" 
                        className={styles.dropdownLink} 
                        onClick={() => setMenuOpen(false)}
                      >
                        My Hostels
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout} 
                      className={styles.logoutButton}
                    >
                      <FaSignOutAlt className={styles.logoutIcon} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={styles.navLink} 
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`${styles.navLink} ${styles.registerButton}`} 
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <br />
    </>
  );
};

export default Header;