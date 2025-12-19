// src/pages/bookings/PaymentFailed.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../../api';
import { FaTimesCircle, FaRedo, FaHome } from 'react-icons/fa';
import styles from './PaymentFailed.module.css';

const PaymentFailed = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await bookingsAPI.getBooking(id);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    setRetrying(true);
    try {
      const response = await bookingsAPI.initiateBooking(booking.hostel._id);
      window.location.href = response.data.paymentAuthorizationUrl;
    } catch (error) {
      console.error('Error retrying payment:', error);
      alert('Failed to retry payment. Please try again.');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading payment status...</p>
      </div>
    );
  }

  return (
    <div className={styles.paymentFailed}>
      <div className={styles.failedContainer}>
        <div className={styles.failedIcon}>
          <FaTimesCircle />
        </div>
        
        <h1 className={styles.failedTitle}>Payment Failed</h1>
        
        <p className={styles.failedMessage}>
          Your payment was not successful. This could be due to insufficient funds,
          incorrect payment details, or a network issue.
        </p>
        
        <div className={styles.bookingDetails}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Booking Reference:</span>
            <span className={styles.detailValue}>{booking?.reference}</span>
          </div>
          
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Hostel:</span>
            <span className={styles.detailValue}>{booking?.hostel?.name}</span>
          </div>
          
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Amount:</span>
            <span className={styles.detailValue}>
              {booking?.currency} {booking?.amount}
            </span>
          </div>
        </div>
        
        <div className={styles.failedActions}>
          <button
            onClick={handleRetryPayment}
            disabled={retrying}
            className={styles.retryButton}
          >
            <FaRedo className={styles.actionIcon} />
            {retrying ? 'Processing...' : 'Retry Payment'}
          </button>
          
          <Link to="/hostels" className={styles.browseHostelsButton}>
            <FaHome className={styles.actionIcon} />
            Browse Hostels
          </Link>
          
          <Link to="/bookings" className={styles.viewBookingsButton}>
            View My Bookings
          </Link>
        </div>
        
        <div className={styles.troubleshooting}>
          <h3 className={styles.troubleshootingTitle}>Troubleshooting Tips:</h3>
          <ul className={styles.tipsList}>
            <li>Ensure you have sufficient funds in your account</li>
            <li>Check your payment details are correct</li>
            <li>Try using a different payment method</li>
            <li>Contact your bank if the issue persists</li>
            <li>Make sure you have a stable internet connection</li>
          </ul>
        </div>
        
        <div className={styles.supportInfo}>
          <p className={styles.supportText}>
            Need help? Contact our support team at{' '}
            <a href="mailto:support@hostelhub.com" className={styles.supportLink}>
              support@hostelhub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;