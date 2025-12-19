// src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, usersAPI, hostelsAPI } from '../../api';
import RevenueChart from '../../components/analytics/RevenueChart';
import OccupancyChart from '../../components/analytics/OccupancyChart';
import StatsCard from '../../components/analytics/StatsCard';
import { 
  FaChartBar, FaUsers, FaHome, FaMoneyBill, FaCalendar, 
  FaCog, FaBell, FaStar, FaSpinner, FaChevronRight, FaPlus, FaSearch
} from 'react-icons/fa';
import styles from './AdminDashboard.module.css';

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
        usersAPI.getUsers({ limit: 5, sort: '-createdAt' }),
        hostelsAPI.getHostels({ limit: 4, sort: '-createdAt' })
      ]);

      setAnalytics(analyticsResponse.data);
      setRecentUsers(usersResponse.data.users || []);
      setRecentHostels(hostelsResponse.data.hostels || []);
      
      if (hostelsResponse.data.hostels) {
        const occupancyStats = hostelsResponse.data.hostels.map(hostel => ({
          name: hostel.name,
          availableRooms: hostel.availableRooms || 0,
          initialRooms: hostel.totalRooms || 10
        }));
        setOccupancyData(occupancyStats.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loaderOverlay}>
        <div className={styles.loaderContent}>
          <div className={styles.glitchContainer}>
             <FaSpinner className={styles.spin} />
          </div>
          <p>AUTHENTICATING SYSTEMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <br />
      <br />
      {/* 01. HEADER */}
      <header className={styles.header}>
        <div className={styles.brandSection}>
          <div className={styles.logoBadge}>A</div>
          <div className={styles.brandText}>
            <h1>COMMAND <span>CENTER</span></h1>
            <p>System Status: <span className={styles.statusLive}>Operational</span></p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input type="text" placeholder="Scan database..." />
          </div>
          <div className={styles.actionButtons}>
             <button className={styles.iconBtn}><FaBell /><span className={styles.dot} /></button>
             <button className={styles.iconBtn}><FaCog /></button>
             <button className={styles.createBtn}><FaPlus /> NEW LISTING</button>
          </div>
        </div>
      </header>

      <main className={styles.dashboardGrid}>
        
        {/* 02. FILTERS */}
        <div className={styles.filterSection}>
          <div className={styles.filterBar}>
            {['week', 'month', 'year'].map(r => (
              <button 
                key={r} 
                className={timeRange === r ? styles.activeFilter : ''} 
                onClick={() => setTimeRange(r)}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          <div className={styles.userStamp}>ADMIN: {user?.name.toUpperCase()}</div>
        </div>

        {/* 03. STATS STRIP (Internal Grid) */}
        <section className={styles.statsStrip}>
          <div className={styles.statsGrid}>
            <StatsCard title="ACTIVE USERS" value={analytics?.totals?.users} icon={<FaUsers />} color="#00e5ff" />
            <StatsCard title="TOTAL HOSTELS" value={analytics?.totals?.hostels} icon={<FaHome />} color="#ff3b30" />
            <StatsCard title="GROSS REVENUE" value={analytics?.totals?.revenue} icon={<FaMoneyBill />} color="#4cd964" />
            <StatsCard title="PENDING BOOKINGS" value={analytics?.totals?.bookings} icon={<FaCalendar />} color="#ffcc00" />
          </div>
        </section>

        {/* 04. MAIN CHARTS */}
        <div className={styles.mainChartCard}>
          <div className={styles.cardHeader}>
            <h3>REVENUE ANALYTICS</h3>
          </div>
          <div className={styles.chartContainer}>
            <RevenueChart data={analytics?.charts?.revenuePerDay} />
          </div>
        </div>

        {/* <div className={styles.secondaryChartCard}>
          <div className={styles.cardHeader}>
             <h3>OCCUPANCY</h3>
          </div>
          <OccupancyChart data={occupancyData} />
        </div> */}

        {/* 05. DATA CARDS */}
        <div className={styles.dataCard}>
          {/* <div className={styles.list}>
            {recentUsers.map(u => (
              <div key={u._id} className={styles.listItem}>
                <div className={styles.avatar}>{u.name.charAt(0)}</div>
                <div className={styles.itemInfo}>
                  <strong>{u.name}</strong>
                  <span>{u.email}</span>
                </div>
                <span className={styles.roleTag} data-admin={u.role === 'admin'}>{u.role}</span>
              </div>
            ))}
          </div> */}
        </div>

        <div className={styles.dataCard}>
          <div className={styles.cardHeader}>
            <h3>PROPERTY ASSETS</h3>
            <button className={styles.textBtn}>INVENTORY</button>
          </div>
          <div className={styles.propertyGrid}>
            {recentHostels.map(h => (
              <div key={h._id} className={styles.propertyItem}>
                <img src={h.images?.[0] || 'https://via.placeholder.com/100'} alt="" />
                <div className={styles.propOverlay}>
                  <h4>{h.name}</h4>
                  <p><FaStar /> {h.rating || '5.0'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.quickLinksCard}>
           <div className={styles.cardHeader}>
              <h3>OPERATIONAL SHORTCUTS</h3>
           </div>
           <div className={styles.linkGrid}>
              {['Audit Logs', 'Billing', 'Verification', 'Support'].map(item => (
                <button key={item} className={styles.linkItem}>
                  <span>{item}</span>
                  <FaChevronRight />
                </button>
              ))}
           </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;