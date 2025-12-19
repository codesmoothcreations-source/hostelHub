// src/pages/dashboard/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, 
  FaChartBar, 
  FaUser, 
  FaBook, 
  FaComments, 
  FaBell, 
  FaSignOutAlt, 
  FaChevronLeft, 
  FaChevronRight,
  FaCog,
  FaBuilding,
  FaUsers,
  FaCaretDown,
  FaTachometerAlt,
  FaList,
  FaChartPie,
  FaUserShield,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications] = useState(3); // Example notification count

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Overview', exact: true },
      { path: '/bookings', icon: <FaBook />, label: 'Bookings' },
      { path: '/messages', icon: <FaComments />, label: 'Messages' },
      { path: '/profile', icon: <FaUser />, label: 'Profile' },
    ];

    if (user?.role === 'owner') {
      return [
        ...commonItems,
        { path: '/my-hostels', icon: <FaBuilding />, label: 'My Hostels' },
        { path: '/analytics', icon: <FaChartPie />, label: 'Analytics' },
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...commonItems,
        { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
        { path: '/admin/hostels', icon: <FaBuilding />, label: 'Hostels' },
        { path: '/admin/analytics', icon: <FaChartPie />, label: 'Analytics' },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <div className={styles.container}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <div className={styles.mobileLogo}>
          <FaHome />
          <span>HostelHub</span>
        </div>
        <button className={styles.notificationButton}>
          <FaBell />
          {notifications > 0 && <span className={styles.notificationBadge}>{notifications}</span>}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            {!collapsed && (
              <div className={styles.userDetails}>
                <h3 className={styles.userName}>{user?.name}</h3>
                <div className={styles.userRole}>
                  <span className={`${styles.roleBadge} ${user?.role === 'owner' ? styles.roleOwner : user?.role === 'admin' ? styles.roleAdmin : styles.roleStudent}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <button className={styles.collapseButton} onClick={toggleSidebar}>
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              end={item.exact}
              onClick={closeMobileMenu}
            >
              <div className={styles.navIcon}>
                {item.icon}
              </div>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          {!collapsed && (
            <>
              <NavLink to="/settings" className={styles.settingsLink} onClick={closeMobileMenu}>
                <FaCog className={styles.settingsIcon} />
                <span>Settings</span>
              </NavLink>
              
              <div className={styles.notificationSection}>
                <div className={styles.notificationHeader}>
                  <FaBell className={styles.notificationIcon} />
                  <span>Notifications</span>
                  {notifications > 0 && (
                    <span className={styles.notificationCount}>{notifications}</span>
                  )}
                </div>
              </div>
            </>
          )}
          
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt className={styles.logoutIcon} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={closeMobileMenu} />
      )}

      {/* Main Content */}
      <main className={styles.content}>
        <div className={styles.contentHeader}>
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbItem}>Dashboard</span>
            <FaChevronRight className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbItem}>Overview</span>
          </div>
          
          <div className={styles.headerActions}>
            <button className={styles.headerButton}>
              <FaBell />
              {notifications > 0 && <span className={styles.headerBadge}>{notifications}</span>}
            </button>
            
            <div className={styles.userDropdown}>
              <div className={styles.userAvatarSmall}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <div className={styles.avatarPlaceholderSmall}>
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <span className={styles.userNameSmall}>{user?.name}</span>
              <FaCaretDown className={styles.dropdownIcon} />
              
              <div className={styles.dropdownMenu}>
                <NavLink to="/profile" className={styles.dropdownItem}>
                  <FaUser /> Profile
                </NavLink>
                <NavLink to="/settings" className={styles.dropdownItem}>
                  <FaCog /> Settings
                </NavLink>
                <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutDropdownItem}`}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;