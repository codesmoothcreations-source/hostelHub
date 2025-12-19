// src/pages/bookings/PaymentSuccess.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../../api';
import { FaCheckCircle, FaHome, FaBook, FaEnvelope } from 'react-icons/fa';
import styles from './PaymentSuccess.module.css';

const PaymentSuccess = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading payment confirmation...</p>
      </div>
    );
  }

  return (
    <div className={styles.paymentSuccess}>
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>
          <FaCheckCircle />
        </div>
        
        <h1 className={styles.successTitle}>Payment Successful!</h1>
        
        <p className={styles.successMessage}>
          Your booking has been confirmed. You can now proceed with the check-in process.
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
        
        <div className={styles.successActions}>
          <Link to={`/bookings/${id}`} className={styles.viewBookingButton}>
            <FaBook className={styles.actionIcon} />
            View Booking Details
          </Link>
          
          {booking?.hostel?.owner && (
            <Link
              to={`/messages/new/${booking.hostel.owner._id}`}
              className={styles.contactOwnerButton}
            >
              <FaEnvelope className={styles.actionIcon} />
              Contact Hostel Owner
            </Link>
          )}
          
          <Link to="/hostels" className={styles.browseHostelsButton}>
            <FaHome className={styles.actionIcon} />
            Browse More Hostels
          </Link>
        </div>
        
        <div className={styles.nextSteps}>
          <h3 className={styles.stepsTitle}>Next Steps:</h3>
          <ul className={styles.stepsList}>
            <li>Contact the hostel owner to arrange check-in</li>
            <li>Save your booking reference for future reference</li>
            <li>Check your email for the booking confirmation</li>
            <li>Prepare necessary documents for check-in</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;