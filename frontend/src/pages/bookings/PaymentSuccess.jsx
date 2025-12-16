// src/pages/bookings/PaymentSuccess.jsx - FIXED
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../../api';
import { FaCheckCircle, FaHome, FaBook, FaEnvelope } from 'react-icons/fa'; // CHANGED FaMessage to FaEnvelope

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
      <div className="hostelhub-loading-state">
        <div className="hostelhub-loading-spinner"></div>
        <p>Loading payment confirmation...</p>
      </div>
    );
  }

  return (
    <div className="hostelhub-payment-success">
      <div className="hostelhub-success-container">
        <div className="hostelhub-success-icon">
          <FaCheckCircle />
        </div>
        
        <h1 className="hostelhub-success-title">Payment Successful!</h1>
        
        <p className="hostelhub-success-message">
          Your booking has been confirmed. You can now proceed with the check-in process.
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
        
        <div className="hostelhub-success-actions">
          <Link to={`/bookings/${id}`} className="hostelhub-view-booking-button">
            <FaBook className="hostelhub-action-icon" />
            View Booking Details
          </Link>
          
          {booking?.hostel?.owner && (
            <Link
              to={`/messages/new/${booking.hostel.owner._id}`}
              className="hostelhub-contact-owner-button"
            >
              <FaEnvelope className="hostelhub-action-icon" /> {/* CHANGED */}
              Contact Hostel Owner
            </Link>
          )}
          
          <Link to="/hostels" className="hostelhub-browse-hostels-button">
            <FaHome className="hostelhub-action-icon" />
            Browse More Hostels
          </Link>
        </div>
        
        <div className="hostelhub-next-steps">
          <h3 className="hostelhub-steps-title">Next Steps:</h3>
          <ul className="hostelhub-steps-list">
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