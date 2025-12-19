// src/pages/hostels/MyHostels.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hostelsAPI } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaPlus, 
  FaFilter, 
  FaHome, 
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaChartLine,
  FaExclamationTriangle,
  FaSearch
} from 'react-icons/fa';
import styles from './MyHostels.module.css';

const MyHostels = () => {
  const { user } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchMyHostels();
  }, []);

  const fetchMyHostels = async () => {
    setLoading(true);
    try {
      const response = await hostelsAPI.getHostels(); 

      // Filter hostels by owner
      const myHostels = response.data.hostels.filter(hostel => {
        const ownerId = hostel.owner 
          ? (hostel.owner._id || hostel.owner)
          : null;

        return ownerId && ownerId.toString() === user._id.toString();
      });
      
      setHostels(myHostels);
      
      // Calculate stats
      const approved = myHostels.filter(h => h.status === 'approved').length;
      const pending = myHostels.filter(h => h.status === 'pending').length;
      const rejected = myHostels.filter(h => h.status === 'rejected').length;
      const totalRevenue = myHostels.reduce((sum, hostel) => sum + (hostel.revenue || 0), 0);
      
      setStats({
        total: myHostels.length,
        approved,
        pending,
        rejected,
        totalRevenue
      });
      
    } catch (error) {
      console.error('Error fetching hostels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHostel = async (hostelId) => {
    if (!window.confirm('Are you sure you want to delete this hostel? This action cannot be undone.')) {
      return;
    }

    try {
      await hostelsAPI.deleteHostel(hostelId);
      setHostels(hostels.filter(h => h._id !== hostelId));
      setStats(prev => ({
        ...prev,
        total: prev.total - 1
      }));
    } catch (error) {
      console.error('Error deleting hostel:', error);
      alert('Failed to delete hostel');
    }
  };

  const filteredHostels = filter === 'all' 
    ? hostels.filter(hostel => 
        hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hostel.location?.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : hostels.filter(hostel => 
        hostel.status === filter && (
          hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (hostel.location?.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        )
      );

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <FaCheckCircle className={styles.statusIconApproved} />;
      case 'pending': return <FaClock className={styles.statusIconPending} />;
      case 'rejected': return <FaTimes className={styles.statusIconRejected} />;
      default: return <FaExclamationTriangle className={styles.statusIconDefault} />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'approved': return styles.statusBadgeApproved;
      case 'pending': return styles.statusBadgePending;
      case 'rejected': return styles.statusBadgeRejected;
      default: return styles.statusBadgeDefault;
    }
  };

  return (
    <div className={styles.container}>
      <br />
      <br />
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <FaHome />
          </div>
          <div>
            <h1 className={styles.title}>My Hostels</h1>
            <p className={styles.subtitle}>Manage all your hostel listings in one place</p>
          </div>
        </div>
        
        <Link to="/add-hostel" className={styles.addButton}>
          <FaPlus className={styles.buttonIcon} />
          Add New Hostel
        </Link>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statTotal}`}>
          <div className={styles.statIcon}>
            <FaHome />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total Hostels</span>
          </div>
        </div>
        
        <div className={`${styles.statCard} ${styles.statApproved}`}>
          <div className={styles.statIcon}>
            <FaCheckCircle />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.approved}</span>
            <span className={styles.statLabel}>Approved</span>
          </div>
        </div>
        
        <div className={`${styles.statCard} ${styles.statPending}`}>
          <div className={styles.statIcon}>
            <FaClock />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.pending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </div>
        
        <div className={`${styles.statCard} ${styles.statRevenue}`}>
          <div className={styles.statIcon}>
            <FaChartLine />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{formatCurrency(stats.totalRevenue)}</span>
            <span className={styles.statLabel}>Total Revenue</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search hostels by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterButtons}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
          >
            <FaFilter className={styles.filterIcon} />
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`${styles.filterButton} ${filter === 'approved' ? styles.filterActive : ''}`}
          >
            <FaCheckCircle className={styles.filterIcon} />
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`${styles.filterButton} ${filter === 'pending' ? styles.filterActive : ''}`}
          >
            <FaClock className={styles.filterIcon} />
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`${styles.filterButton} ${filter === 'rejected' ? styles.filterActive : ''}`}
          >
            <FaTimes className={styles.filterIcon} />
            Rejected ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingState}>
          <FaSpinner className={styles.loadingSpinner} />
          <p>Loading your hostels...</p>
        </div>
      ) : (
        /* Content */
        <>
          {filteredHostels.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FaHome />
              </div>
              <h3>No hostels found</h3>
              <p>
                {filter === 'all' 
                  ? "You haven't listed any hostels yet."
                  : `No ${filter} hostels found.`}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={styles.clearSearchButton}
                >
                  Clear search
                </button>
              )}
              {filter !== 'all'}
              <Link to="/add-hostel" className={styles.addFirstButton}>
                Add Your First Hostel
              </Link>
            </div>
          ) : (
            /* Hostels Table */
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>Image</th>
                    <th>Hostel Name</th>
                    <th>Location</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th>Rooms</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {filteredHostels.map((hostel) => (
                    <tr key={hostel._id} className={styles.tableRow}>
                      <td className={styles.imageCell}>
                        {hostel.images && hostel.images.length > 0 ? (
                          <img 
                            src={hostel.images[0]} 
                            alt={hostel.name} 
                            className={styles.tableImage} 
                          />
                        ) : (
                          <div className={styles.noImage}>
                            <FaHome className={styles.noImageIcon} />
                          </div>
                        )}
                      </td>
                      <td className={styles.nameCell}>
                        <Link to={`/hostels/${hostel._id}`} className={styles.hostelLink}>
                          {hostel.name}
                        </Link>
                      </td>
                      <td className={styles.locationCell}>
                        {hostel.location?.address ? (
                          <span className={styles.locationText}>
                            {hostel.location.address.split(',').slice(0, 2).join(',')}
                          </span>
                        ) : (
                          <span className={styles.locationEmpty}>No address</span>
                        )}
                      </td>
                      <td className={styles.priceCell}>
                        <span className={styles.priceAmount}>
                          {formatCurrency(hostel.price)}
                        </span>
                        <span className={styles.pricePeriod}>/{hostel.rentDuration}</span>
                      </td>
                      <td className={styles.statusCell}>
                        <div className={`${styles.statusBadge} ${getStatusBadgeClass(hostel.status)}`}>
                          {getStatusIcon(hostel.status)}
                          <span className={styles.statusText}>{hostel.status}</span>
                        </div>
                      </td>
                      <td className={styles.ratingCell}>
                        <div className={styles.rating}>
                          <span className={styles.ratingStars}>⭐</span>
                          <span className={styles.ratingValue}>{hostel.rating || 'N/A'}</span>
                          <span className={styles.ratingCount}>({hostel.numberOfRatings || 0})</span>
                        </div>
                      </td>
                      <td className={styles.roomsCell}>
                        <div className={styles.roomsInfo}>
                          <span className={styles.roomsAvailable}>{hostel.availableRooms}</span>
                          <span className={styles.roomsSeparator}>/</span>
                          <span className={styles.roomsTotal}>{hostel.initialRooms || hostel.availableRooms}</span>
                          <span className={styles.roomsLabel}> rooms</span>
                        </div>
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actions}>
                          <Link 
                            to={`/hostels/${hostel._id}`} 
                            className={`${styles.actionButton} ${styles.viewButton}`}
                            title="View hostel"
                          >
                            <FaEye className={styles.actionIcon} />
                          </Link>
                          <Link 
                            to={`/edit-hostel/${hostel._id}`} 
                            className={`${styles.actionButton} ${styles.editButton}`}
                            title="Edit hostel"
                          >
                            <FaEdit className={styles.actionIcon} />
                          </Link>
                          <button 
                            onClick={() => handleDeleteHostel(hostel._id)} 
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            title="Delete hostel"
                          >
                            <FaTrash className={styles.actionIcon} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Summary */}
              <div className={styles.tableSummary}>
                <span className={styles.summaryText}>
                  Showing {filteredHostels.length} of {hostels.length} hostels
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={styles.clearTableSearch}
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
      <br />
      <br />
    </div>
  );
};

export default MyHostels;