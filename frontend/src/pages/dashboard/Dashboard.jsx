// src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI, hostelsAPI } from '../../api';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaBook, 
  FaUser, 
  FaChartBar, 
  FaCalendar, 
  FaMoneyBill, 
  FaStar, 
  FaSpinner,
  FaSearch,
  FaBell,
  FaPlus,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaWallet,
  FaUsers,
  FaBuilding
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';
import styles from './Dashboard.module.css';

// Loading State Component
const LoadingState = () => (
  <div className={styles.loadingState}>
    <FaSpinner className={styles.loadingSpinner} />
    <p>Loading dashboard...</p>
  </div>
);

// Quick Action Component
const QuickAction = ({ to, Icon, label, description, color }) => (
  <Link to={to} className={`${styles.quickAction} ${color ? styles[`quickAction${color}`] : ''}`}>
    <div className={styles.quickActionIcon}>
      <Icon />
    </div>
    <div className={styles.quickActionContent}>
      <span className={styles.quickActionLabel}>{label}</span>
      <span className={styles.quickActionDescription}>{description}</span>
    </div>
    <FaArrowRight className={styles.quickActionArrow} />
  </Link>
);

// Stat Card Component
const StatCard = ({ title, value, icon, trend, color }) => (
  <div className={`${styles.statCard} ${color ? styles[`stat${color}`] : ''}`}>
    <div className={styles.statHeader}>
      <div className={styles.statIcon}>
        {icon}
      </div>
      {trend && (
        <div className={`${styles.statTrend} ${trend > 0 ? styles.trendUp : styles.trendDown}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className={styles.statContent}>
      <span className={styles.statValue}>{value}</span>
      <h3 className={styles.statTitle}>{title}</h3>
    </div>
  </div>
);

// Booking Item Component
const BookingItem = ({ booking }) => {
  const getStatusClass = (status) => {
    switch(status) {
      case 'success': return styles.statusSuccess;
      case 'pending': return styles.statusPending;
      case 'failed': return styles.statusFailed;
      default: return styles.statusDefault;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return <FaCheckCircle />;
      case 'pending': return <FaClock />;
      case 'failed': return <FaExclamationTriangle />;
      default: return <FaClock />;
    }
  };

  return (
    <div className={styles.bookingItem}>
      <div className={styles.bookingInfo}>
        <div className={styles.bookingHostel}>
          <FaHome className={styles.bookingIcon} />
          <div>
            <h4 className={styles.bookingName}>{booking.hostel?.name || 'Hostel Not Found'}</h4>
            <p className={styles.bookingDate}>
              {new Date(booking.createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        
        <div className={styles.bookingMeta}>
          <div className={styles.bookingAmount}>
            <FaMoneyBill className={styles.metaIcon} />
            <span>{formatCurrency(booking.amount || 0)}</span>
          </div>
          <div className={`${styles.bookingStatus} ${getStatusClass(booking.paymentStatus)}`}>
            {getStatusIcon(booking.paymentStatus)}
            <span>{booking.paymentStatus}</span>
          </div>
        </div>
      </div>
      
      <Link to={`/bookings/${booking._id}`} className={styles.bookingLink}>
        <FaEye className={styles.bookingViewIcon} />
        <span>View Details</span>
      </Link>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch recent bookings
      const bookingsResponse = await bookingsAPI.getBookings({ limit: 5 });
      setRecentBookings(bookingsResponse.data.bookings || []);
      
      // Fetch stats based on role
      let roleStats = {};
      switch(user.role) {
        case 'student':
          const successfulBookings = bookingsResponse.data.bookings?.filter(b => b.paymentStatus === 'success') || [];
          const totalSpent = successfulBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
          
          roleStats = {
            activeBookings: successfulBookings.length,
            totalSpent,
            reviewsGiven: 0, // Placeholder - would come from API
            upcomingBookings: bookingsResponse.data.bookings?.filter(b => 
              b.paymentStatus === 'success' && new Date(b.checkInDate) > new Date()
            ).length || 0
          };
          break;
          
        case 'owner':
          // These would come from actual API endpoints
          roleStats = {
            totalHostels: 0,
            totalBookings: 0,
            totalRevenue: 0,
            occupancyRate: 0
          };
          break;
          
        case 'admin':
          roleStats = {
            totalUsers: 0,
            totalHostels: 0,
            totalBookings: 0,
            pendingApprovals: 0
          };
          break;
          
        default:
          roleStats = {};
      }
      
      setStats(roleStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuickActions = () => {
    const baseActions = [
      { to: "/hostels", Icon: FaSearch, label: "Browse Hostels", description: "Find your perfect stay", color: "Blue" },
      { to: "/bookings", Icon: FaBook, label: "My Bookings", description: "View all your bookings", color: "Green" },
      { to: "/profile", Icon: FaUser, label: "Profile", description: "Manage your account", color: "Purple" },
    ];

    if (user.role === 'owner') {
      return [...baseActions, 
        { to: "/add-hostel", Icon: FaPlus, label: "Add Hostel", description: "List your property", color: "Orange" }
      ];
    } else if (user.role === 'admin') {
      return [...baseActions,
        { to: "/admin-dashboard", Icon: FaChartBar, label: "Admin Panel", description: "System management", color: "Red" }
      ];
    }

    return baseActions;
  };

  const getRoleStats = () => {
    if (!stats) return [];

    switch (user.role) {
      case 'student':
        return [
          { 
            title: 'Active Bookings', 
            value: stats.activeBookings, 
            icon: <FaCalendar />, 
            color: 'Blue',
            trend: 12 // Example trend
          },
          { 
            title: 'Total Spent', 
            value: formatCurrency(stats.totalSpent), 
            icon: <FaWallet />,
            color: 'Green',
            trend: 8
          },
          { 
            title: 'Upcoming', 
            value: stats.upcomingBookings, 
            icon: <FaClock />,
            color: 'Orange'
          },
          { 
            title: 'Reviews Given', 
            value: stats.reviewsGiven, 
            icon: <FaStar />,
            color: 'Purple'
          }
        ];
      
      case 'owner':
        return [
          { 
            title: 'My Hostels', 
            value: stats.totalHostels, 
            icon: <FaHome />,
            color: 'Blue'
          },
          { 
            title: 'Total Bookings', 
            value: stats.totalBookings, 
            icon: <FaCalendar />,
            color: 'Green'
          },
          { 
            title: 'Total Revenue', 
            value: formatCurrency(stats.totalRevenue), 
            icon: <FaMoneyBill />,
            color: 'Orange'
          },
          { 
            title: 'Occupancy Rate', 
            value: `${stats.occupancyRate}%`, 
            icon: <FaChartBar />,
            color: 'Purple'
          }
        ];
      
      case 'admin':
        return [
          { 
            title: 'Total Users', 
            value: stats.totalUsers, 
            icon: <FaUsers />,
            color: 'Blue'
          },
          { 
            title: 'Total Hostels', 
            value: stats.totalHostels, 
            icon: <FaBuilding />,
            color: 'Green'
          },
          { 
            title: 'Total Bookings', 
            value: stats.totalBookings, 
            icon: <FaCalendar />,
            color: 'Orange'
          },
          { 
            title: 'Pending Approvals', 
            value: stats.pendingApprovals, 
            icon: <FaExclamationTriangle />,
            color: 'Red'
          }
        ];
      
      default:
        return [];
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  const welcomeMessage = user.role === 'student' 
    ? 'Track your bookings and discover new hostels.'
    : user.role === 'owner' 
      ? 'Manage your listed hostels and view booking performance.'
      : 'System-wide overview and administrative controls.';

  return (
    <div className={styles.container}>
      <br />
      <br />
      {/* Dashboard Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.title}>Welcome back, {user.name}!</h1>
            <p className={styles.subtitle}>{welcomeMessage}</p>
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.userRoleBadge}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className={styles.quickActionsSection}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActionsGrid}>
          {getQuickActions().map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Overview</h2>
        <div className={styles.statsGrid}>
          {getRoleStats().map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Recent Bookings Section (for students) */}
      {user.role === 'student' && recentBookings.length > 0 && (
        <div className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Bookings</h2>
            <Link to="/bookings" className={styles.viewAllLink}>
              View All <FaArrowRight className={styles.viewAllIcon} />
            </Link>
          </div>
          
          <div className={styles.bookingsList}>
            {recentBookings.slice(0, 3).map(booking => (
              <BookingItem key={booking._id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity for Owners/Admins */}
      {user.role !== 'student' && (
        <div className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {user.role === 'owner' ? 'Recent Activity' : 'System Overview'}
            </h2>
            <Link 
              to={user.role === 'owner' ? '/owner-dashboard' : '/admin-dashboard'} 
              className={styles.userRoleBadge}
            >
              View Details <FaArrowRight className={styles.viewAllIcon} />
            </Link>
          </div>
          
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {user.role === 'owner' ? <FaChartBar /> : <FaBuilding />}
            </div>
            <p className={styles.emptyText}>
              {user.role === 'owner' 
                ? 'No recent activity. Start by listing your first hostel!' 
                : 'System data will appear here.'}
            </p>
            {user.role === 'owner' && (
              <Link to="/add-hostel" className={styles.userRoleBadge}>
                <FaPlus className={styles.buttonIcon} />
                Add Hostel
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className={styles.tipsSection}>
        <h3 className={styles.tipsTitle}>Pro Tips</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <FaBell className={styles.tipIcon} />
            <p>Enable booking notifications to never miss a booking</p>
          </div>
          <div className={styles.tipCard}>
            <FaStar className={styles.tipIcon} />
            <p>Leave reviews to help other students find great hostels</p>
          </div>
          <div className={styles.tipCard}>
            <FaMoneyBill className={styles.tipIcon} />
            <p>Save payment methods for faster bookings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;