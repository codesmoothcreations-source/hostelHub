// src/pages/dashboard/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI, reviewsAPI } from '../../api';
import { Link } from 'react-router-dom';
import { 
  FaCalendar, 
  FaHome, 
  FaStar, 
  FaMoneyBill, 
  FaSpinner, 
  FaComments, 
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaHeart,
  FaSearch,
  FaChartLine,
  FaBell,
  FaReceipt,
  FaUserFriends,
  FaBookOpen
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalSpent: 0,
    reviewsGiven: 0,
    upcomingTrips: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedHostels] = useState([
    { id: 1, name: 'Sunshine Hostel', price: 1200, rating: 4.8 },
    { id: 2, name: 'Campus View', price: 950, rating: 4.5 },
    { id: 3, name: 'Student Hub', price: 1100, rating: 4.7 }
  ]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [bookingsResponse, reviewsResponse] = await Promise.all([
        bookingsAPI.getBookings({ limit: 5 }),
        reviewsAPI.getUserReviews()
      ]);
      
      const successfulBookings = bookingsResponse.data.bookings?.filter(
        booking => booking.paymentStatus === 'success'
      ) || [];
      
      const upcomingBookings = successfulBookings.filter(
        booking => new Date(booking.checkInDate) > new Date()
      );
      
      const totalSpent = successfulBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
      
      setStats({
        activeBookings: successfulBookings.length,
        totalSpent,
        reviewsGiven: reviewsResponse.data.reviews?.length || 0,
        upcomingTrips: upcomingBookings.length
      });
      
      setRecentBookings(bookingsResponse.data.bookings || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { className: styles.statusSuccess, icon: <FaCheckCircle />, label: 'Confirmed' },
      pending: { className: styles.statusPending, icon: <FaClock />, label: 'Pending' },
      failed: { className: styles.statusFailed, icon: <FaClock />, label: 'Failed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <FaSpinner className={styles.loadingSpinner} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.title}>Welcome back, {user.name}!</h1>
            <p className={styles.subtitle}>
              Track your bookings, find new hostels, and manage your student accommodation
            </p>
          </div>
          
          <div className={styles.headerActions}>
            <button className={styles.notificationButton}>
              <FaBell className={styles.notificationIcon} />
              <span className={styles.notificationBadge}>2</span>
            </button>
            <Link to="/hostels" className={styles.findHostelButton}>
              <FaSearch className={styles.buttonIcon} />
              Find Hostels
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Your Overview</h2>
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.bookingsCard}`}>
            <div className={styles.statIcon}>
              <FaCalendar />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.activeBookings}</span>
              <h3 className={styles.statTitle}>Active Bookings</h3>
              <p className={styles.statSubtitle}>
                {stats.upcomingTrips} upcoming trip{stats.upcomingTrips !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.spendingCard}`}>
            <div className={styles.statIcon}>
              <FaMoneyBill />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{formatCurrency(stats.totalSpent)}</span>
              <h3 className={styles.statTitle}>Total Spent</h3>
              <p className={styles.statSubtitle}>
                <FaChartLine className={styles.trendIcon} />
                <span className={styles.trendText}>Savings of 15% this month</span>
              </p>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.reviewsCard}`}>
            <div className={styles.statIcon}>
              <FaStar />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.reviewsGiven}</span>
              <h3 className={styles.statTitle}>Reviews Given</h3>
              <p className={styles.statSubtitle}>
                Help other students find great hostels
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Bookings</h2>
          <Link to="/bookings" className={styles.viewAllLink}>
            View All <FaArrowRight className={styles.viewIcon} />
          </Link>
        </div>
        
        {recentBookings.length > 0 ? (
          <div className={styles.bookingsList}>
            {recentBookings.slice(0, 3).map(booking => (
              <div key={booking._id} className={styles.bookingCard}>
                <div className={styles.bookingInfo}>
                  <div className={styles.bookingHeader}>
                    <div className={styles.hostelName}>
                      <FaHome className={styles.hostelIcon} />
                      <span>{booking.hostel?.name || 'Hostel'}</span>
                    </div>
                    {getStatusBadge(booking.paymentStatus)}
                  </div>
                  
                  <div className={styles.bookingDetails}>
                    <div className={styles.bookingDate}>
                      <FaCalendar className={styles.detailIcon} />
                      <span>{new Date(booking.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    
                    <div className={styles.bookingLocation}>
                      <FaMapMarkerAlt className={styles.detailIcon} />
                      <span>{booking.hostel?.location?.address?.split(',')[0] || 'Location'}</span>
                    </div>
                    
                    <div className={styles.bookingAmount}>
                      <FaReceipt className={styles.detailIcon} />
                      <span>{formatCurrency(booking.amount || 0)}</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.bookingActions}>
                  <Link to={`/bookings/${booking._id}`} className={styles.viewButton}>
                    View Details
                  </Link>
                  <button className={styles.reviewButton}>
                    <FaStar className={styles.reviewIcon} />
                    Write Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FaCalendar />
            </div>
            <h3>No Bookings Yet</h3>
            <p>Start your journey by finding your perfect student accommodation</p>
            <Link to="/hostels" className={styles.primaryButton}>
              <FaSearch className={styles.buttonIcon} />
              Browse Hostels
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className={styles.actionsSection}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link to="/hostels" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <FaSearch />
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>Find Hostels</h3>
              <p className={styles.actionDescription}>
                Discover new accommodations near your campus
              </p>
            </div>
            <FaArrowRight className={styles.actionArrow} />
          </Link>
          
          <Link to="/bookings" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <FaBookOpen />
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>My Bookings</h3>
              <p className={styles.actionDescription}>
                View and manage all your reservations
              </p>
            </div>
            <FaArrowRight className={styles.actionArrow} />
          </Link>
          
          <Link to="/messages" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <FaComments />
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>Messages</h3>
              <p className={styles.actionDescription}>
                Chat with hostel owners
              </p>
            </div>
            <FaArrowRight className={styles.actionArrow} />
          </Link>
          
          <Link to="/profile" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <FaUserFriends />
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>Student Community</h3>
              <p className={styles.actionDescription}>
                Connect with other students
              </p>
            </div>
            <FaArrowRight className={styles.actionArrow} />
          </Link>
        </div>
      </div>

      {/* Recommended Hostels Section */}
      <div className={styles.recommendedSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recommended for You</h2>
          <Link to="/hostels" className={styles.viewAllLink}>
            See All <FaArrowRight className={styles.viewIcon} />
          </Link>
        </div>
        
        <div className={styles.hostelsGrid}>
          {recommendedHostels.map(hostel => (
            <div key={hostel.id} className={styles.hostelCard}>
              <div className={styles.hostelImage}>
                <div className={styles.hostelRating}>
                  <FaStar className={styles.ratingIcon} />
                  <span>{hostel.rating}</span>
                </div>
                <button className={styles.favoriteButton}>
                  <FaHeart className={styles.favoriteIcon} />
                </button>
              </div>
              
              <div className={styles.hostelInfo}>
                <h3 className={styles.hostelName}>{hostel.name}</h3>
                <div className={styles.hostelLocation}>
                  <FaMapMarkerAlt className={styles.locationIcon} />
                  <span>Near University Campus</span>
                </div>
                
                <div className={styles.hostelFooter}>
                  <div className={styles.hostelPrice}>
                    <span className={styles.priceAmount}>{formatCurrency(hostel.price)}</span>
                    <span className={styles.pricePeriod}>/month</span>
                  </div>
                  <Link to={`/hostels/${hostel.id}`} className={styles.viewButton}>
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className={styles.tipsSection}>
        <h2 className={styles.sectionTitle}>Student Tips</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <FaMoneyBill className={styles.tipIcon} />
            <h3 className={styles.tipTitle}>Save on Rent</h3>
            <p className={styles.tipDescription}>
              Book during off-peak seasons for better rates
            </p>
          </div>
          
          <div className={styles.tipCard}>
            <FaStar className={styles.tipIcon} />
            <h3 className={styles.tipTitle}>Leave Reviews</h3>
            <p className={styles.tipDescription}>
              Help other students find quality accommodations
            </p>
          </div>
          
          <div className={styles.tipCard}>
            <FaBell className={styles.tipIcon} />
            <h3 className={styles.tipTitle}>Enable Notifications</h3>
            <p className={styles.tipDescription}>
              Get alerts for new hostels and booking confirmations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;