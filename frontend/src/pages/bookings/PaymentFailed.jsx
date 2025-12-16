// src/pages/bookings/PaymentFailed.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../../api';
import { FaTimesCircle, FaRedo, FaHome } from 'react-icons/fa';

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
      // Re-initiate booking payment
      const response = await bookingsAPI.initiateBooking(booking.hostel._id);
      // Redirect to payment page or handle payment
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
      <div className="hostelhub-loading-state">
        <div className="hostelhub-loading-spinner"></div>
        <p>Loading payment status...</p>
      </div>
    );
  }

  return (
    <div className="hostelhub-payment-failed">
      <div className="hostelhub-failed-container">
        <div className="hostelhub-failed-icon">
          <FaTimesCircle />
        </div>
        
        <h1 className="hostelhub-failed-title">Payment Failed</h1>
        
        <p className="hostelhub-failed-message">
          Your payment was not successful. This could be due to insufficient funds,
          incorrect payment details, or a network issue.
        </p>
        
        <div className="hostelhub-booking-details">
          <div className="hostelhub-detail-item">
            <span className="hostelhub-detail-label">Booking Reference:</span>
            <span className="hostelhub-detail-value">{booking?.reference}</span>
          </div>
          
          <div className="hostelhub-detail-item">
            <span className="hostelhub-detail-label">Hostel:</span>
            <span className="hostelhub-detail-value">{booking?.hostel?.name}</span>
          </div>
          
          <div className="hostelhub-detail-item">
            <span className="hostelhub-detail-label">Amount:</span>
            <span className="hostelhub-detail-value">
              {booking?.currency} {booking?.amount}
            </span>
          </div>
        </div>
        
        <div className="hostelhub-failed-actions">
          <button
            onClick={handleRetryPayment}
            disabled={retrying}
            className="hostelhub-retry-button"
          >
            <FaRedo className="hostelhub-action-icon" />
            {retrying ? 'Processing...' : 'Retry Payment'}
          </button>
          
          <Link to="/hostels" className="hostelhub-browse-hostels-button">
            <FaHome className="hostelhub-action-icon" />
            Browse Hostels
          </Link>
          
          <Link to="/bookings" className="hostelhub-view-bookings-button">
            View My Bookings
          </Link>
        </div>
        
        <div className="hostelhub-troubleshooting">
          <h3 className="hostelhub-troubleshooting-title">Troubleshooting Tips:</h3>
          <ul className="hostelhub-tips-list">
            <li>Ensure you have sufficient funds in your account</li>
            <li>Check your payment details are correct</li>
            <li>Try using a different payment method</li>
            <li>Contact your bank if the issue persists</li>
            <li>Make sure you have a stable internet connection</li>
          </ul>
        </div>
        
        <div className="hostelhub-support-info">
          <p className="hostelhub-support-text">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@hostelhub.com" className="hostelhub-support-link">
              support@hostelhub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;