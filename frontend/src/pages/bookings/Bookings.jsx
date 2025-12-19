// src/pages/bookings/Bookings.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PAYMENT_STATUS } from '../../utils/constants';
import { FaCalendar, FaCheckCircle, FaTimesCircle, FaSpinner, FaEye } from 'react-icons/fa';
import Pagination from '../../components/common/Pagination';
import styles from './Bookings.module.css'; // Changed to CSS Modules

const Bookings = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status') || 'all';

  useEffect(() => {
    fetchBookings();
  }, [searchParams]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (status !== 'all') {
        params.paymentStatus = status;
      }

      const response = await bookingsAPI.getBookings(params);
      setBookings(response.data.bookings || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('status', newFilter);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className={styles.statusSuccessIcon} />;
      case 'failed':
        return <FaTimesCircle className={styles.statusFailedIcon} />;
      case 'pending':
        return <FaSpinner className={styles.statusPendingIcon} />;
      default:
        return <FaSpinner className={styles.statusProcessingIcon} />;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Bookings</h1>
        <p className={styles.subtitle}>
          Manage and track all your hostel bookings
        </p>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterButtons}>
          {['all', 'success', 'pending', 'failed'].map((statusType) => (
            <button
              key={statusType}
              onClick={() => handleFilterChange(statusType)}
              className={`${styles.filterButton} ${filter === statusType ? styles.filterActive : ''}`}
            >
              {statusType.charAt(0).toUpperCase() + statusType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <FaCalendar className={styles.emptyIcon} />
          <h3>No bookings found</h3>
          <p>
            {filter === 'all'
              ? "You haven't made any bookings yet."
              : `No ${filter} bookings found.`}
          </p>
          {user?.role === 'student' && (
            <Link to="/hostels" className={styles.findHostelsButton}>
              Find Hostels
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className={styles.bookingsList}>
            {bookings.map((booking) => (
              <div key={booking._id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.bookingReference}>
                    <span className={styles.referenceLabel}>Reference:</span>
                    <span className={styles.referenceValue}>{booking.reference}</span>
                  </div>
                  <div className={styles.bookingStatus}>
                    {getStatusIcon(booking.paymentStatus)}
                    <span className={`${styles.statusBadge} ${styles[`status${booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}`]}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className={styles.bookingContent}>
                  <div className={styles.bookingHostelInfo}>
                    <div className={styles.bookingHostelImage}>
                      {booking.hostel?.images?.[0] ? (
                        <img 
                          src={booking.hostel.images[0]} 
                          alt={booking.hostel.name} 
                          className={styles.hostelImage}
                        />
                      ) : (
                        <div className={styles.bookingImagePlaceholder}>
                          <FaCalendar />
                        </div>
                      )}
                    </div>
                    <div className={styles.bookingHostelDetails}>
                      <h3 className={styles.bookingHostelName}>
                        {booking.hostel?.name}
                      </h3>
                      <p className={styles.bookingHostelAddress}>
                        {booking.hostel?.location?.address}
                      </p>
                      <p className={styles.bookingOwner}>
                        Owner: {booking.hostel?.owner?.name}
                      </p>
                    </div>
                  </div>

                  <div className={styles.bookingDetails}>
                    <div className={styles.bookingDetailRow}>
                      <span className={styles.detailLabel}>Amount:</span>
                      <span className={styles.detailValue}>
                        {formatCurrency(booking.amount, booking.currency)}
                      </span>
                    </div>
                    <div className={styles.bookingDetailRow}>
                      <span className={styles.detailLabel}>Date:</span>
                      <span className={styles.detailValue}>
                        {formatDate(booking.createdAt)}
                      </span>
                    </div>
                    <div className={styles.bookingDetailRow}>
                      <span className={styles.detailLabel}>Duration:</span>
                      <span className={styles.detailValue}>
                        {booking.duration || 'Monthly'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.bookingActions}>
                  <Link
                    to={`/bookings/${booking._id}`}
                    className={styles.viewDetailsButton}
                  >
                    <FaEye className={styles.actionIcon} />
                    View Details
                  </Link>
                  {booking.paymentStatus === 'pending' && (
                    <button className={styles.retryPaymentButton}>
                      Retry Payment
                    </button>
                  )}
                  {booking.paymentStatus === 'success' && (
                    <Link
                      to={`/messages/new/${booking.hostel?.owner?._id}`}
                      className={styles.contactOwnerButton}
                    >
                      Contact Owner
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Bookings;