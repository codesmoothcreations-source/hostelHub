// src/pages/bookings/Bookings.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PAYMENT_STATUS } from '../../utils/constants';
import { FaCalendar, FaCheckCircle, FaTimesCircle, FaSpinner, FaEye } from 'react-icons/fa';
import Pagination from '../../components/common/Pagination';

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
        return <FaCheckCircle className="hostelhub-status-success-icon" />;
      case 'failed':
        return <FaTimesCircle className="hostelhub-status-failed-icon" />;
      case 'pending':
        return <FaSpinner className="hostelhub-status-pending-icon" />;
      default:
        return <FaSpinner className="hostelhub-status-processing-icon" />;
    }
  };

  return (
    <div className="hostelhub-bookings-page">
      <div className="hostelhub-bookings-header">
        <h1 className="hostelhub-bookings-title">My Bookings</h1>
        <p className="hostelhub-bookings-subtitle">
          Manage and track all your hostel bookings
        </p>
      </div>

      <div className="hostelhub-bookings-filters">
        <div className="hostelhub-filter-buttons">
          {['all', 'success', 'pending', 'failed'].map((statusType) => (
            <button
              key={statusType}
              onClick={() => handleFilterChange(statusType)}
              className={`hostelhub-filter-button ${filter === statusType ? 'hostelhub-filter-active' : ''}`}
            >
              {statusType.charAt(0).toUpperCase() + statusType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="hostelhub-loading-state">
          <div className="hostelhub-loading-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="hostelhub-empty-state">
          <FaCalendar className="hostelhub-empty-icon" />
          <h3>No bookings found</h3>
          <p>
            {filter === 'all'
              ? "You haven't made any bookings yet."
              : `No ${filter} bookings found.`}
          </p>
          {user?.role === 'student' && (
            <Link to="/hostels" className="hostelhub-find-hostels-button">
              Find Hostels
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="hostelhub-bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="hostelhub-booking-card">
                <div className="hostelhub-booking-header">
                  <div className="hostelhub-booking-reference">
                    <span className="hostelhub-reference-label">Reference:</span>
                    <span className="hostelhub-reference-value">{booking.reference}</span>
                  </div>
                  <div className="hostelhub-booking-status">
                    {getStatusIcon(booking.paymentStatus)}
                    <span className={`hostelhub-status-badge hostelhub-status-${booking.paymentStatus}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="hostelhub-booking-content">
                  <div className="hostelhub-booking-hostel-info">
                    <div className="hostelhub-booking-hostel-image">
                      {booking.hostel?.images?.[0] ? (
                        <img src={booking.hostel.images[0]} alt={booking.hostel.name} />
                      ) : (
                        <div className="hostelhub-booking-image-placeholder">
                          <FaCalendar />
                        </div>
                      )}
                    </div>
                    <div className="hostelhub-booking-hostel-details">
                      <h3 className="hostelhub-booking-hostel-name">
                        {booking.hostel?.name}
                      </h3>
                      <p className="hostelhub-booking-hostel-address">
                        {booking.hostel?.location?.address}
                      </p>
                      <p className="hostelhub-booking-owner">
                        Owner: {booking.hostel?.owner?.name}
                      </p>
                    </div>
                  </div>

                  <div className="hostelhub-booking-details">
                    <div className="hostelhub-booking-detail-row">
                      <span className="hostelhub-detail-label">Amount:</span>
                      <span className="hostelhub-detail-value">
                        {formatCurrency(booking.amount, booking.currency)}
                      </span>
                    </div>
                    <div className="hostelhub-booking-detail-row">
                      <span className="hostelhub-detail-label">Date:</span>
                      <span className="hostelhub-detail-value">
                        {formatDate(booking.createdAt)}
                      </span>
                    </div>
                    <div className="hostelhub-booking-detail-row">
                      <span className="hostelhub-detail-label">Duration:</span>
                      <span className="hostelhub-detail-value">
                        {booking.duration || 'Monthly'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hostelhub-booking-actions">
                  <Link
                    to={`/bookings/${booking._id}`}
                    className="hostelhub-view-details-button"
                  >
                    <FaEye className="hostelhub-action-icon" />
                    View Details
                  </Link>
                  {booking.paymentStatus === 'pending' && (
                    <button className="hostelhub-retry-payment-button">
                      Retry Payment
                    </button>
                  )}
                  {booking.paymentStatus === 'success' && (
                    <Link
                      to={`/messages/new/${booking.hostel?.owner?._id}`}
                      className="hostelhub-contact-owner-button"
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