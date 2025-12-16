// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaHome, FaComments, FaBook, FaChartBar, FaBars, FaTimes } from 'react-icons/fa';
import { MdSpaceDashboard } from "react-icons/md";
import "./Header.css"

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
      <header className={`hostelhub-header ${styleType}`}>
        <div className={`hostelhub-header-container ${styleType}`}>
          <Link to="/" className={`hostelhub-logo ${styleType}`}>
            <FaHome className={`hostelhub-logo-icon ${styleType}`} />
            <span className={`hostelhub-logo-text ${styleType}`}>HostelHub</span>
          </Link>

          <button className="hostelhub-menu-button" onClick={toggleMenu}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <nav className={`hostelhub-nav ${styleType} ${menuOpen ? 'active' : ''}`}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={`hostelhub-nav-link ${styleType}`} onClick={() => setMenuOpen(false)}>
                  {/* <FaHome className={`hostelhub-nav-icon ${styleType}`} /> */}
                  < MdSpaceDashboard className={`hostelhub-nav-icon ${styleType}`} />
                  <span>Dashboard</span>
                </Link>
                
                <Link to="/hostels" className={`hostelhub-nav-link ${styleType}`} onClick={() => setMenuOpen(false)}>
                  <FaHome className={`hostelhub-nav-icon ${styleType}`} />
                  <span>Hostels</span>
                </Link>

                <Link to="/bookings" className={`hostelhub-nav-link ${styleType}`} onClick={() => setMenuOpen(false)}>
                  <FaBook className={`hostelhub-nav-icon ${styleType}`} />
                  <span>Bookings</span>
                </Link>

                <Link to="/messages" className={`hostelhub-nav-link ${styleType}`} onClick={() => setMenuOpen(false)}>
                  <FaComments className={`hostelhub-nav-icon ${styleType}`} />
                  <span>Messages</span>
                </Link>

                {user?.role === 'owner' && (
                  <Link to="/analytics" className={`hostelhub-nav-link ${styleType}`} onClick={() => setMenuOpen(false)}>
                    <FaChartBar className={`hostelhub-nav-icon ${styleType}`} />
                    <span>Analytics</span>
                  </Link>
                )}

                <div className={`hostelhub-user-menu ${styleType}`}>
                  <button className={`hostelhub-user-button ${styleType}`}>
                    <FaUser className={`hostelhub-user-icon ${styleType}`} />
                    <span>{user?.name}</span>
                  </button>
                  <div className={`hostelhub-user-dropdown ${styleType}`}>
                    <Link to="/profile" className={`hostelhub-dropdown-link ${styleType}`} onClick={() => setMenuOpen(false)}>Profile</Link>
                    {user?.role === 'owner' && (
                      <Link to="/my-hostels" className={`hostelhub-dropdown-link ${styleType}`} onClick={() => setMenuOpen(false)}>My Hostels</Link>
                    )}
                    <button onClick={handleLogout} className={`hostelhub-logout-button ${styleType}`}>
                      <FaSignOutAlt className={`hostelhub-logout-icon ${styleType}`} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={`hostelhub-nav-link ${styleType}`} onClick={() => setMenuOpen(true)}>Login</Link>
                <Link to="/register" className={`hostelhub-nav-link hostelhub-register-button ${styleType}`} onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {/* <br />
      <br />
      <br /> */}
    </>
  );
};

export default Header;