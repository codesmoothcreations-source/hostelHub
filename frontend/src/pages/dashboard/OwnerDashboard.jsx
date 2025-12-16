// src/pages/dashboard/OwnerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI } from '../../api';
import RevenueChart from '../../components/analytics/RevenueChart';
import OccupancyChart from '../../components/analytics/OccupancyChart';
import StatsCard from '../../components/analytics/StatsCard';
import { FaChartBar, FaMoneyBill, FaBed, FaUsers, FaCalendar } from 'react-icons/fa';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getOwnerAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="hostelhub-loading-state">
        <div className="hostelhub-loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="hostelhub-owner-analytics">
      <div className="hostelhub-analytics-header">
        <h1 className="hostelhub-analytics-title">
          <FaChartBar className="hostelhub-title-icon" />
          Owner Analytics
        </h1>
        
        <div className="hostelhub-time-range-selector">
          <button
            onClick={() => setTimeRange('week')}
            className={`hostelhub-time-button ${timeRange === 'week' ? 'hostelhub-time-active' : ''}`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`hostelhub-time-button ${timeRange === 'month' ? 'hostelhub-time-active' : ''}`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`hostelhub-time-button ${timeRange === 'year' ? 'hostelhub-time-active' : ''}`}
          >
            This Year
          </button>
        </div>
      </div>

      <div className="hostelhub-stats-grid">
        <StatsCard
          title="Total Revenue"
          value={`GH₵${analytics?.totals?.revenue || 0}`}
          icon={<FaMoneyBill />}
          change={15}
        />
        
        <StatsCard
          title="Total Bookings"
          value={analytics?.totals?.bookings || 0}
          icon={<FaCalendar />}
          change={8}
        />
        
        <StatsCard
          title="Total Hostels"
          value={analytics?.totals?.hostels || 0}
          icon={<FaBed />}
          change={3}
        />
        
        <StatsCard
          title="Occupancy Rate"
          value={`${analytics?.totals?.occupancyRate || 0}%`}
          icon={<FaUsers />}
          change={5}
        />
      </div>

      <div className="hostelhub-charts-grid">
        <div className="hostelhub-chart-container">
          <h3 className="hostelhub-chart-title">Revenue Over Time</h3>
          <RevenueChart data={analytics?.charts?.revenuePerDay || []} />
        </div>
        
        <div className="hostelhub-chart-container">
          <h3 className="hostelhub-chart-title">Occupancy Rate</h3>
          <OccupancyChart data={analytics?.hostelPerformance || []} />
        </div>
      </div>

      <div className="hostelhub-hostel-performance">
        <h3 className="hostelhub-section-title">Hostel Performance</h3>
        {analytics?.hostelPerformance?.length > 0 ? (
          <div className="hostelhub-performance-table">
            <table className="hostelhub-table">
              <thead>
                <tr>
                  <th>Hostel Name</th>
                  <th>Rating</th>
                  <th>Available Rooms</th>
                  <th>Total Bookings</th>
                  <th>Revenue</th>
                  <th>Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {analytics.hostelPerformance.map((hostel) => (
                  <tr key={hostel.name}>
                    <td>{hostel.name}</td>
                    <td>{hostel.rating}</td>
                    <td>{hostel.availableRooms} / {hostel.initialRooms}</td>
                    <td>{hostel.totalBookings}</td>
                    <td>GH₵{hostel.totalRevenue}</td>
                    <td>{Math.round((hostel.availableRooms / hostel.initialRooms) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="hostelhub-empty-message">No hostel performance data available</p>
        )}
      </div>

      <div className="hostelhub-recent-bookings">
        <h3 className="hostelhub-section-title">Recent Bookings</h3>
        {analytics?.recentBookings?.length > 0 ? (
          <div className="hostelhub-bookings-list">
            {analytics.recentBookings.slice(0, 5).map((booking) => (
              <div key={booking._id} className="hostelhub-booking-item">
                <div className="hostelhub-booking-info">
                  <h4 className="hostelhub-booking-hostel">{booking.hostel?.name}</h4>
                  <p className="hostelhub-booking-student">
                    Student: {booking.student?.name}
                  </p>
                  <p className="hostelhub-booking-date">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="hostelhub-booking-amount">
                  GH₵{booking.amount}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="hostelhub-empty-message">No recent bookings</p>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;