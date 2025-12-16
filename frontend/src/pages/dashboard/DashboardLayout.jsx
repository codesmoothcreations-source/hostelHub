// src/pages/dashboard/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import "./DashboardLayout.css"

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="hostelhub-dashboard-layout">
      <div className="hostelhub-dashboard-sidebar">
        <div className="hostelhub-user-info">
          <div className="hostelhub-user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="hostelhub-avatar-placeholder">
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="hostelhub-user-details">
            <h3 className="hostelhub-user-name">{user?.name}</h3>
            <span className="hostelhub-user-role">{user?.role}</span>
          </div>
        </div>
        
        <nav className="hostelhub-dashboard-nav">
          <a href="/dashboard" className="hostelhub-nav-link">Overview</a>
          {user?.role === 'owner' && (
            <>
              <a href="/my-hostels" className="hostelhub-nav-link">My Hostels</a>
              <a href="/analytics" className="hostelhub-nav-link">Analytics</a>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <a href="/admin/users" className="hostelhub-nav-link">Users</a>
              <a href="/admin/hostels" className="hostelhub-nav-link">Hostels</a>
              <a href="/admin/analytics" className="hostelhub-nav-link">Analytics</a>
            </>
          )}
          <a href="/bookings" className="hostelhub-nav-link">Bookings</a>
          <a href="/messages" className="hostelhub-nav-link">Messages</a>
          <a href="/profile" className="hostelhub-nav-link">Profile</a>
        </nav>
      </div>
      
      <div className="hostelhub-dashboard-content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;