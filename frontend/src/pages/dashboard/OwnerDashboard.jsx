// src/pages/dashboard/OwnerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI } from '../../api';
import RevenueChart from '../../components/analytics/RevenueChart';
import OccupancyChart from '../../components/analytics/OccupancyChart';
import { 
  FaChartBar, 
  FaMoneyBill, 
  FaBed, 
  FaUsers, 
  FaCalendar, 
  FaHome,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaSpinner,
  FaChartLine,
  FaStar,
  FaCheckCircle,
  FaPercentage,
  FaEye,
  FaDownload
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';
import styles from './OwnerDashboard.module.css';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedHostel, setSelectedHostel] = useState('all');

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

  const getTimeRangeLabel = () => {
    switch(timeRange) {
      case 'week': return 'Last 7 days';
      case 'month': return 'Last 30 days';
      case 'year': return 'Last 12 months';
      default: return 'Last 7 days';
    }
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <FaArrowUp className={styles.trendUp} />;
    if (value < 0) return <FaArrowDown className={styles.trendDown} />;
    return null;
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <FaSpinner className={styles.loadingSpinner} />
        <p>Loading analytics dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <br />
      <br />
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <FaChartBar />
          </div>
          <div>
            <h1 className={styles.title}>Owner Analytics Dashboard</h1>
            <p className={styles.subtitle}>
              Track your hostel performance and revenue metrics
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.timeSelector}>
            <FaFilter className={styles.filterIcon} />
            <span className={styles.timeLabel}>Time Range:</span>
            <div className={styles.timeButtons}>
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`${styles.timeButton} ${timeRange === range ? styles.timeActive : ''}`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button className={styles.exportButton}>
            <FaDownload className={styles.exportIcon} />
            Export Report
          </button>
        </div>
      </div>

      {/* Time Range Indicator */}
      <div className={styles.timeRangeIndicator}>
        <span className={styles.indicatorLabel}>Showing data for:</span>
        <span className={styles.indicatorValue}>{getTimeRangeLabel()}</span>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Key Performance Indicators</h2>
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.revenueCard}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <FaMoneyBill />
              </div>
              <div className={styles.statTrend}>
                {getTrendIcon(15)}
                <span className={styles.trendValue}>15%</span>
              </div>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>
                {formatCurrency(analytics?.totals?.revenue || 0)}
              </span>
              <h3 className={styles.statTitle}>Total Revenue</h3>
              <p className={styles.statSubtitle}>Across all hostels</p>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.bookingsCard}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <FaCalendar />
              </div>
              <div className={styles.statTrend}>
                {getTrendIcon(8)}
                <span className={styles.trendValue}>8%</span>
              </div>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{analytics?.totals?.bookings || 0}</span>
              <h3 className={styles.statTitle}>Total Bookings</h3>
              <p className={styles.statSubtitle}>Completed reservations</p>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.hostelsCard}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <FaBed />
              </div>
              <div className={styles.statTrend}>
                {getTrendIcon(3)}
                <span className={styles.trendValue}>3%</span>
              </div>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{analytics?.totals?.hostels || 0}</span>
              <h3 className={styles.statTitle}>Active Hostels</h3>
              <p className={styles.statSubtitle}>Listed properties</p>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.occupancyCard}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <FaPercentage />
              </div>
              <div className={styles.statTrend}>
                {getTrendIcon(5)}
                <span className={styles.trendValue}>5%</span>
              </div>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{analytics?.totals?.occupancyRate || 0}%</span>
              <h3 className={styles.statTitle}>Occupancy Rate</h3>
              <p className={styles.statSubtitle}>Average across all hostels</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <div className={styles.chartGrid}>
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>
                <FaChartLine className={styles.chartIcon} />
                Revenue Over Time
              </h3>
              <select 
                value={selectedHostel} 
                onChange={(e) => setSelectedHostel(e.target.value)}
                className={styles.hostelSelect}
              >
                <option value="all">All Hostels</option>
                {analytics?.hostelPerformance?.map((hostel) => (
                  <option key={hostel.name} value={hostel.name}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.chartWrapper}>
              <RevenueChart data={analytics?.charts?.revenuePerDay || []} />
            </div>
            <div className={styles.chartFooter}>
              <span className={styles.chartLabel}>Total: {formatCurrency(analytics?.totals?.revenue || 0)}</span>
              <span className={styles.chartTrend}>
                <FaArrowUp className={styles.trendUp} />
                9% from last period
              </span>
            </div>
          </div>

          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>
                <FaChartBar className={styles.chartIcon} />
                Occupancy Rate
              </h3>
            </div>
            <div className={styles.chartWrapper}>
              <OccupancyChart data={analytics?.hostelPerformance || []} />
            </div>
            <div className={styles.chartFooter}>
              <span className={styles.chartLabel}>Average: {analytics?.totals?.occupancyRate || 0}%</span>
              <span className={styles.chartTrend}>
                <FaArrowUp className={styles.trendUp} />
                5% from last period
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className={styles.recentSection}>

        {analytics?.recentBookings?.length > 0 ? (
          <div className={styles.bookingsList}>
            {analytics.recentBookings.slice(0, 5).map((booking) => (
              <div key={booking._id} className={styles.bookingCard}>
                <div className={styles.bookingInfo}>
                  <div className={styles.bookingHeader}>
                    <h4 className={styles.bookingHostel}>
                      <FaHome className={styles.bookingIcon} />
                      {booking.hostel?.name}
                    </h4>
                    <span className={styles.bookingAmount}>
                      {formatCurrency(booking.amount || 0)}
                    </span>
                  </div>
                  <div className={styles.bookingDetails}>
                    <div className={styles.bookingStudent}>
                      <FaUsers className={styles.detailIcon} />
                      <span>{booking.student?.name || 'Guest'}</span>
                    </div>
                    <div className={styles.bookingDate}>
                      <FaCalendar className={styles.detailIcon} />
                      <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.bookingActions}>
                  <button className={styles.viewButton}>
                    <FaEye className={styles.viewIcon} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyBookings}>
            <div className={styles.emptyIcon}>
              <FaCalendar />
            </div>
            <p>No recent bookings to display</p>
          </div>
        )}
      </div>

      {/* Summary Section */}
      <br />
      {/* <div className={styles.summarySection}>
        <div className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>Performance Summary</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Best Performing Hostel</span>
              <span className={styles.summaryValue}>
                {analytics?.hostelPerformance?.[0]?.name || 'N/A'}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Highest Occupancy</span>
              <span className={styles.summaryValue}>
                {Math.max(...(analytics?.hostelPerformance?.map(h => 
                  Math.round((h.availableRooms / h.initialRooms) * 100)
                ) || [0]))}%
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Avg. Booking Value</span>
              <span className={styles.summaryValue}>
                {formatCurrency((analytics?.totals?.revenue || 0) / (analytics?.totals?.bookings || 1))}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Booking Growth</span>
              <span className={`${styles.summaryValue} ${styles.growthPositive}`}>
                <FaArrowUp className={styles.trendUp} />
                8% this month
              </span>
            </div>
          </div>
        </div>
      </div> */}
      <br />
      <br />
    </div>
  );
};

export default OwnerDashboard;