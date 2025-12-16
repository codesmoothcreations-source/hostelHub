// src/pages/dashboard/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI } from '../../api';
import { Link } from 'react-router-dom';
import { FaCalendar, FaHome, FaStar, FaMoneyBill } from 'react-icons/fa';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalSpent: 0,
    reviewsGiven: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const bookingsResponse = await bookingsAPI.getBookings({ limit: 5 });
      
      const activeBookings = bookingsResponse.data.bookings?.filter(
        booking => booking.paymentStatus === 'success'
      ).length || 0;
      
      const totalSpent = bookingsResponse.data.bookings
        ?.filter(booking => booking.paymentStatus === 'success')
        .reduce((sum, booking) => sum + booking.amount, 0) || 0;
      
      setStats({
        activeBookings,
        totalSpent,
        reviewsGiven: 0 // This would come from reviews API
      });
      
      setRecentBookings(bookingsResponse.data.bookings || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="hostelhub-loading-state">
        <div className="hostelhub-loading-spinner"></div>
        <p>Loading student dashboard...</p>
      </div>
    );
  }

  return (
    <div className="hostelhub-student-dashboard">
      <div className="hostelhub-stats-grid">
        <div className="hostelhub-stat-card">
          <FaCalendar className="hostelhub-stat-icon" />
          <h3 className="hostelhub-stat-title">Active Bookings</h3>
          <p className="hostelhub-stat-value">{stats.activeBookings}</p>
        </div>
        
        <div className="hostelhub-stat-card">
          <FaMoneyBill className="hostelhub-stat-icon" />
          <h3 className="hostelhub-stat-title">Total Spent</h3>
          <p className="hostelhub-stat-value">GH₵{stats.totalSpent}</p>
        </div>
        
        <div className="hostelhub-stat-card">
          <FaStar className="hostelhub-stat-icon" />
          <h3 className="hostelhub-stat-title">Reviews Given</h3>
          <p className="hostelhub-stat-value">{stats.reviewsGiven}</p>
        </div>
      </div>

      <div className="hostelhub-recent-bookings-section">
        <div className="hostelhub-section-header">
          <h3 className="hostelhub-section-title">Recent Bookings</h3>
          <Link to="/bookings" className="hostelhub-view-all">View All</Link>
        </div>
        
        {recentBookings.length > 0 ? (
          <div className="hostelhub-bookings-list">
            {recentBookings.map(booking => (
              <div key={booking._id} className="hostelhub-booking-item">
                <div className="hostelhub-booking-info">
                  <h4 className="hostelhub-booking-hostel">{booking.hostel?.name}</h4>
                  <p className="hostelhub-booking-date">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                  <span className={`hostelhub-booking-status hostelhub-status-${booking.paymentStatus}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <div className="hostelhub-booking-amount">
                  GH₵{booking.amount}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="hostelhub-empty-state">
            <p>No bookings yet</p>
            <Link to="/hostels" className="hostelhub-find-hostels-button">
              <FaHome className="hostelhub-button-icon" />
              Find Hostels
            </Link>
          </div>
        )}
      </div>

      <div className="hostelhub-quick-actions">
        <h3 className="hostelhub-section-title">Quick Actions</h3>
        <div className="hostelhub-actions-grid">
          <Link to="/hostels" className="hostelhub-action-card">
            <FaHome className="hostelhub-action-icon" />
            <span>Browse Hostels</span>
          </Link>
          <Link to="/bookings" className="hostelhub-action-card">
            <FaCalendar className="hostelhub-action-icon" />
            <span>My Bookings</span>
          </Link>
          <Link to="/messages" className="hostelhub-action-card">
            <FaStar className="hostelhub-action-icon" />
            <span>Messages</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;