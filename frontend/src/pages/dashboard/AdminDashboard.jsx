// src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, usersAPI, hostelsAPI } from '../../api';
import RevenueChart from '../../components/analytics/RevenueChart';
import OccupancyChart from '../../components/analytics/OccupancyChart';
import StatsCard from '../../components/analytics/StatsCard';
import { 
  FaChartBar, 
  FaUsers, 
  FaHome, 
  FaMoneyBill, 
  FaCalendar, 
  FaUserCheck, 
  FaUserTimes,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEdit,
  FaTrash,
  FaCog,
  FaBell,
  FaChartLine,
  FaBuilding,
  FaStar
} from 'react-icons/fa';
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentHostels, setRecentHostels] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsResponse, usersResponse, hostelsResponse] = await Promise.all([
        analyticsAPI.getAdminAnalytics({ timeRange }),
        usersAPI.getUsers({ limit: 6, sort: '-createdAt' }),
        hostelsAPI.getHostels({ limit: 8, sort: '-createdAt' })
      ]);

      setAnalytics(analyticsResponse.data);
      setRecentUsers(usersResponse.data.users || []);
      setRecentHostels(hostelsResponse.data.hostels || []);
      
      // Generate occupancy data from hostels
      if (hostelsResponse.data.hostels) {
        const occupancyStats = hostelsResponse.data.hostels.map(hostel => ({
          name: hostel.name,
          availableRooms: hostel.availableRooms || 0,
          initialRooms: hostel.totalRooms || hostel.availableRooms || 10
        }));
        setOccupancyData(occupancyStats.slice(0, 6)); // Show top 6
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate growth percentages
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading) {
    return (
      <div className="hostelhub-loading-state">
        <div className="hostelhub-loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="hostelhub-admin-dashboard-page">
      {/* Header */}
      <div className="hostelhub-admin-header">
        <div className="hostelhub-admin-title-container">
          <div className="hostelhub-admin-icon">
            <FaChartBar />
          </div>
          <div>
            <h1 className="hostelhub-admin-title">
              Admin Dashboard
            </h1>
            <p className="hostelhub-admin-subtitle">
              Welcome back, {user?.name}. Here's what's happening today.
            </p>
          </div>
        </div>
        
        <div className="hostelhub-admin-controls">
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
          
          <div className="hostelhub-admin-actions">
            <button className="hostelhub-notification-button">
              <FaBell />
              <span className="hostelhub-notification-count">3</span>
            </button>
            <button className="hostelhub-settings-button">
              <FaCog />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="hostelhub-stats-grid">
        <StatsCard
          title="Total Users"
          value={analytics?.totals?.users || 0}
          icon={<FaUsers />}
          change={calculateGrowth(
            analytics?.totals?.users || 0, 
            analytics?.previousTotals?.users || 0
          )}
          metricType="growth"
          previousValue={analytics?.previousTotals?.users || 0}
          description="Registered users on the platform"
        />
        
        <StatsCard
          title="Total Hostels"
          value={analytics?.totals?.hostels || 0}
          icon={<FaHome />}
          change={calculateGrowth(
            analytics?.totals?.hostels || 0, 
            analytics?.previousTotals?.hostels || 0
          )}
          metricType="occupancy"
          previousValue={analytics?.previousTotals?.hostels || 0}
          description="Hostels listed on the platform"
        />
        
        <StatsCard
          title="Total Revenue"
          value={analytics?.totals?.revenue || 0}
          icon={<FaMoneyBill />}
          change={calculateGrowth(
            analytics?.totals?.revenue || 0, 
            analytics?.previousTotals?.revenue || 0
          )}
          metricType="revenue"
          previousValue={analytics?.previousTotals?.revenue || 0}
          description="Total revenue generated"
        />
        
        <StatsCard
          title="Total Bookings"
          value={analytics?.totals?.bookings || 0}
          icon={<FaCalendar />}
          change={calculateGrowth(
            analytics?.totals?.bookings || 0, 
            analytics?.previousTotals?.bookings || 0
          )}
          metricType="trending"
          previousValue={analytics?.previousTotals?.bookings || 0}
          description="Total bookings made"
        />
        
        <StatsCard
          title="Avg. Occupancy Rate"
          value={analytics?.charts?.avgOccupancy || 75}
          icon={<FaBuilding />}
          change={8.5}
          metricType="percentage"
          description="Average hostel occupancy rate"
        />
        
        <StatsCard
          title="Avg. Rating"
          value={analytics?.charts?.avgRating || 4.2}
          icon={<FaStar />}
          change={2.3}
          metricType="rating"
          description="Average hostel rating"
        />
      </div>

      {/* Charts Section */}
      <div className="hostelhub-charts-section">
        <div className="hostelhub-chart-wrapper">
          <div className="hostelhub-chart-header">
            <h3 className="hostelhub-chart-title">
              <FaChartLine className="hostelhub-chart-icon" />
              Revenue Analytics
            </h3>
            <div className="hostelhub-chart-summary">
              <span className="hostelhub-chart-total">
                {formatCurrency(analytics?.totals?.revenue || 0)}
              </span>
              <span className="hostelhub-chart-change hostelhub-change-positive">
                <FaArrowUp /> 12.5%
              </span>
            </div>
          </div>
          <div className="hostelhub-chart-content">
            <RevenueChart data={analytics?.charts?.revenuePerDay || []} />
          </div>
        </div>
        
        <div className="hostelhub-chart-wrapper">
          <div className="hostelhub-chart-header">
            <h3 className="hostelhub-chart-title">
              <FaBuilding className="hostelhub-chart-icon" />
              Occupancy Analytics
            </h3>
            <div className="hostelhub-chart-summary">
              <span className="hostelhub-chart-total">
                {analytics?.charts?.avgOccupancy || 75}%
              </span>
              <span className="hostelhub-chart-change hostelhub-change-positive">
                <FaArrowUp /> 3.2%
              </span>
            </div>
          </div>
          <div className="hostelhub-chart-content">
            <OccupancyChart data={occupancyData} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="hostelhub-recent-activity">
        <div className="hostelhub-activity-section">
          <div className="hostelhub-section-header">
            <h3 className="hostelhub-section-title">
              <FaUsers className="hostelhub-section-icon" />
              Recent Users
            </h3>
            <button className="hostelhub-view-all">
              View All
            </button>
          </div>
          
          {recentUsers.length > 0 ? (
            <div className="hostelhub-users-list">
              {recentUsers.map((user) => (
                <div key={user._id} className="hostelhub-user-card">
                  <div className="hostelhub-user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <div className="hostelhub-avatar-placeholder">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="hostelhub-user-info">
                    <h4 className="hostelhub-user-name">{user.name}</h4>
                    <p className="hostelhub-user-email">{user.email}</p>
                    <div className="hostelhub-user-meta">
                      <span className={`hostelhub-user-role hostelhub-role-${user.role}`}>
                        {user.role}
                      </span>
                      <span className="hostelhub-user-date">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="hostelhub-user-actions">
                    <button className="hostelhub-action-button hostelhub-view-button" title="View Profile">
                      <FaEye />
                    </button>
                    <button className="hostelhub-action-button hostelhub-edit-button" title="Edit User">
                      <FaEdit />
                    </button>
                    <button className="hostelhub-action-button hostelhub-delete-button" title="Delete User">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hostelhub-empty-state">
              <FaUsers className="hostelhub-empty-icon" />
              <p>No recent users</p>
            </div>
          )}
        </div>

        <div className="hostelhub-activity-section">
          <div className="hostelhub-section-header">
            <h3 className="hostelhub-section-title">
              <FaHome className="hostelhub-section-icon" />
              Recent Hostels
            </h3>
            <button className="hostelhub-view-all">
              View All
            </button>
          </div>
          
          {recentHostels.length > 0 ? (
            <div className="hostelhub-hostels-list">
              {recentHostels.map((hostel) => (
                <div key={hostel._id} className="hostelhub-hostel-card">
                  <div className="hostelhub-hostel-image">
                    {hostel.images && hostel.images.length > 0 ? (
                      <img src={hostel.images[0]} alt={hostel.name} />
                    ) : (
                      <div className="hostelhub-no-image-placeholder">
                        <FaHome />
                      </div>
                    )}
                    <div className="hostelhub-hostel-status">
                      <span className={`hostelhub-status-dot hostelhub-status-${hostel.status}`}></span>
                      {hostel.status}
                    </div>
                  </div>
                  <div className="hostelhub-hostel-info">
                    <h4 className="hostelhub-hostel-name">{hostel.name}</h4>
                    <p className="hostelhub-hostel-address">{hostel.location?.address || 'No address'}</p>
                    <div className="hostelhub-hostel-meta">
                      <span className="hostelhub-hostel-price">
                        GH₵{hostel.price}<span>/{hostel.rentDuration}</span>
                      </span>
                      <span className="hostelhub-hostel-rating">
                        ⭐ {hostel.rating || 'N/A'} ({hostel.numberOfRatings || 0})
                      </span>
                    </div>
                  </div>
                  <div className="hostelhub-hostel-actions">
                    <button className="hostelhub-action-button hostelhub-view-button" title="View Details">
                      <FaEye />
                    </button>
                    <button className="hostelhub-action-button hostelhub-edit-button" title="Edit Hostel">
                      <FaEdit />
                    </button>
                    <button className="hostelhub-action-button hostelhub-delete-button" title="Delete Hostel">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hostelhub-empty-state">
              <FaHome className="hostelhub-empty-icon" />
              <p>No recent hostels</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="hostelhub-quick-actions">
        <h3 className="hostelhub-section-title">Quick Actions</h3>
        <div className="hostelhub-actions-grid">
          <button className="hostelhub-action-card">
            <div className="hostelhub-action-icon">
              <FaUsers />
            </div>
            <div className="hostelhub-action-content">
              <span className="hostelhub-action-title">Manage Users</span>
              <span className="hostelhub-action-desc">View and manage all users</span>
            </div>
            <div className="hostelhub-action-arrow">→</div>
          </button>
          
          <button className="hostelhub-action-card">
            <div className="hostelhub-action-icon">
              <FaHome />
            </div>
            <div className="hostelhub-action-content">
              <span className="hostelhub-action-title">Manage Hostels</span>
              <span className="hostelhub-action-desc">Approve or reject listings</span>
            </div>
            <div className="hostelhub-action-arrow">→</div>
          </button>
          
          <button className="hostelhub-action-card">
            <div className="hostelhub-action-icon">
              <FaMoneyBill />
            </div>
            <div className="hostelhub-action-content">
              <span className="hostelhub-action-title">View Reports</span>
              <span className="hostelhub-action-desc">Financial and analytics reports</span>
            </div>
            <div className="hostelhub-action-arrow">→</div>
          </button>
          
          <button className="hostelhub-action-card">
            <div className="hostelhub-action-icon">
              <FaCalendar />
            </div>
            <div className="hostelhub-action-content">
              <span className="hostelhub-action-title">View Bookings</span>
              <span className="hostelhub-action-desc">Manage all bookings</span>
            </div>
            <div className="hostelhub-action-arrow">→</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;