// src/pages/bookings/BookingDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI } from '../../api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { FaArrowLeft, FaPrint, FaDownload, FaCalendar, FaMoneyBill, FaCheckCircle, FaTimesCircle, FaBuilding, FaUser } from 'react-icons/fa';
import "./BookingDetail.css"

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showPaymentMeta, setShowPaymentMeta] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const response = await bookingsAPI.getBooking(id);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancelling(true);
    try {
      await bookingsAPI.cancelBooking(id);
      alert('Booking cancelled successfully');
      fetchBooking(); // Refresh booking data
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    // Simple receipt download
    const receiptContent = `
      HostelHub Booking Receipt
      ========================
      
      Booking Reference: ${booking?.reference}
      Date: ${formatDateTime(booking?.createdAt)}
      
      Hostel Details:
      ---------------
      Name: ${booking?.hostel?.name}
      Address: ${booking?.hostel?.location?.address}
      Owner: ${booking?.hostel?.owner?.name}
      
      Booking Details:
      ----------------
      Amount: ${formatCurrency(booking?.amount, booking?.currency)}
      Status: ${booking?.paymentStatus}
      Duration: ${booking?.duration}
      
      Student Details:
      ---------------
      Name: ${booking?.student?.name}
      Email: ${booking?.student?.email}
      
      Thank you for choosing HostelHub!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostelhub-receipt-${booking?.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return <FaCheckCircle />;
      case 'failed': return <FaTimesCircle />;
      default: return <FaCalendar />;
    }
  };

  if (loading) {
    return (
      <div className="booking-detail-loading">
        <div className="booking-detail-loading-spinner">
          <div className="booking-detail-spinner-circle"></div>
        </div>
        <p className="booking-detail-loading-text">Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-detail-not-found">
        <div className="booking-detail-not-found-content">
          <h2 className="booking-detail-not-found-title">Booking Not Found</h2>
          <p className="booking-detail-not-found-message">The booking you're looking for doesn't exist or has been removed.</p>
          <Link to="/bookings" className="booking-detail-back-button">
            <FaArrowLeft className="booking-detail-back-icon" />
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const canCancel = booking.paymentStatus === 'success' && 
                   user?._id === booking.student?._id;

  return (
    <div className="booking-detail-container">
      <div className="booking-detail-wrapper">
        {/* Header Section */}
        <div className="booking-detail-header">
          <div className="booking-detail-header-content">
            <Link to="/bookings" className="booking-detail-nav-back">
              <FaArrowLeft className="booking-detail-nav-icon" />
              Back to Bookings
            </Link>
            
            <div className="booking-detail-header-actions">
              <button
                onClick={handlePrintReceipt}
                className="booking-detail-action-btn booking-detail-action-print"
              >
                <FaPrint className="booking-detail-action-btn-icon" />
                Print Receipt
              </button>
              <button
                onClick={handleDownloadReceipt}
                className="booking-detail-action-btn booking-detail-action-download"
              >
                <FaDownload className="booking-detail-action-btn-icon" />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="booking-detail-card">
          {/* Booking Header */}
          <div className="booking-detail-card-header">
            <div className="booking-detail-title-section">
              <h1 className="booking-detail-title">Booking Details</h1>
              <div className="booking-detail-reference">
                Reference: <span className="booking-detail-ref-code">{booking.reference}</span>
              </div>
            </div>
            
            <div 
              className="booking-detail-status-badge"
              style={{ 
                backgroundColor: `${getStatusColor(booking.paymentStatus)}20`,
                color: getStatusColor(booking.paymentStatus),
                border: `1px solid ${getStatusColor(booking.paymentStatus)}40`
              }}
            >
              <span className="booking-detail-status-icon">
                {getStatusIcon(booking.paymentStatus)}
              </span>
              <span className="booking-detail-status-text">
                {booking.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Booking Information Grid */}
          <div className="booking-detail-grid">
            {/* Booking Info Section */}
            <div className="booking-detail-section">
              <div className="booking-detail-section-header">
                <FaCalendar className="booking-detail-section-icon" />
                <h3 className="booking-detail-section-title">Booking Information</h3>
              </div>
              
              <div className="booking-detail-info-grid">
                <div className="booking-detail-info-item">
                  <span className="booking-detail-info-label">Booking Date:</span>
                  <span className="booking-detail-info-value">
                    {formatDateTime(booking.createdAt)}
                  </span>
                </div>
                
                <div className="booking-detail-info-item">
                  <span className="booking-detail-info-label">Amount:</span>
                  <span className="booking-detail-info-value booking-detail-amount">
                    {formatCurrency(booking.amount, booking.currency)}
                  </span>
                </div>
                
                <div className="booking-detail-info-item">
                  <span className="booking-detail-info-label">Duration:</span>
                  <span className="booking-detail-info-value booking-detail-duration">
                    {booking.duration || 'Monthly'}
                  </span>
                </div>
                
                <div className="booking-detail-info-item">
                  <span className="booking-detail-info-label">Payment Method:</span>
                  <span className="booking-detail-info-value">
                    {booking.paymentMeta?.channel || 'Paystack'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="booking-detail-section">
              <div className="booking-detail-section-header">
                <FaMoneyBill className="booking-detail-section-icon" />
                <h3 className="booking-detail-section-title">Payment Details</h3>
              </div>
              
              <div className="booking-detail-payment-details">
                <div className="booking-detail-payment-item">
                  <span className="booking-detail-payment-label">Amount Paid:</span>
                  <span className="booking-detail-payment-value">
                    {formatCurrency(booking.amount, booking.currency)}
                  </span>
                </div>
                
                <div className="booking-detail-payment-item">
                  <span className="booking-detail-payment-label">Payment Reference:</span>
                  <span className="booking-detail-payment-reference">
                    {booking.paystackReference || 'N/A'}
                  </span>
                </div>
                
                <div className="booking-detail-payment-item">
                  <span className="booking-detail-payment-label">Payment Status:</span>
                  <span 
                    className="booking-detail-payment-status"
                    style={{ color: getStatusColor(booking.paymentStatus) }}
                  >
                    {booking.paymentStatus.toUpperCase()}
                  </span>
                </div>
                
                {booking.paymentMeta && (
                  <div className="booking-detail-payment-meta">
                    <button
                      onClick={() => setShowPaymentMeta(!showPaymentMeta)}
                      className="booking-detail-meta-toggle"
                    >
                      {showPaymentMeta ? 'Hide' : 'Show'} Payment Metadata
                    </button>
                    
                    {showPaymentMeta && (
                      <div className="booking-detail-meta-content">
                        <pre className="booking-detail-meta-pre">
                          {JSON.stringify(booking.paymentMeta, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hostel Information */}
          <div className="booking-detail-section booking-detail-hostel-section">
            <div className="booking-detail-section-header">
              <FaBuilding className="booking-detail-section-icon" />
              <h3 className="booking-detail-section-title">Hostel Information</h3>
            </div>
            
            <div className="booking-detail-hostel-card">
              <div className="booking-detail-hostel-image">
                {booking.hostel?.images?.[0] ? (
                  <img 
                    src={booking.hostel.images[0]} 
                    alt={booking.hostel.name}
                    className="booking-detail-hostel-img"
                  />
                ) : (
                  <div className="booking-detail-hostel-image-placeholder">
                    <FaBuilding className="booking-detail-placeholder-icon" />
                    <span>No Image Available</span>
                  </div>
                )}
              </div>
              
              <div className="booking-detail-hostel-info">
                <h4 className="booking-detail-hostel-name">{booking.hostel?.name}</h4>
                <p className="booking-detail-hostel-address">
                  {booking.hostel?.location?.address}
                </p>
                <div className="booking-detail-hostel-price">
                  <span className="booking-detail-price-label">Price:</span>
                  <span className="booking-detail-price-value">
                    {formatCurrency(booking.hostel?.price, booking.hostel?.currency)}/{booking.hostel?.rentDuration}
                  </span>
                </div>
                
                <div className="booking-detail-hostel-actions">
                  <Link
                    to={`/hostels/${booking.hostel?._id}`}
                    className="booking-detail-btn booking-detail-btn-secondary"
                  >
                    View Hostel Details
                  </Link>
                  {booking.paymentStatus === 'success' && (
                    <Link
                      to={`/messages/new/${booking.hostel?.owner?._id}`}
                      className="booking-detail-btn booking-detail-btn-primary"
                    >
                      Contact Owner
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="booking-detail-section booking-detail-owner-section">
            <div className="booking-detail-section-header">
              <FaUser className="booking-detail-section-icon" />
              <h3 className="booking-detail-section-title">Owner Information</h3>
            </div>
            
            <div className="booking-detail-owner-card">
              <div className="booking-detail-owner-avatar">
                {booking.hostel?.owner?.avatar ? (
                  <img 
                    src={booking.hostel.owner.avatar} 
                    alt={booking.hostel.owner.name}
                    className="booking-detail-owner-img"
                  />
                ) : (
                  <div className="booking-detail-owner-avatar-placeholder">
                    {booking.hostel?.owner?.name?.charAt(0) || 'O'}
                  </div>
                )}
              </div>
              
              <div className="booking-detail-owner-details">
                <h4 className="booking-detail-owner-name">{booking.hostel?.owner?.name}</h4>
                <p className="booking-detail-owner-email">{booking.hostel?.owner?.email}</p>
                {booking.hostel?.owner?.phone && (
                  <p className="booking-detail-owner-phone">{booking.hostel.owner.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="booking-detail-actions-footer">
            <div className="booking-detail-actions-group">
              {canCancel && (
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="booking-detail-btn booking-detail-btn-danger"
                >
                  {cancelling ? (
                    <>
                      <span className="booking-detail-btn-spinner"></span>
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Booking'
                  )}
                </button>
              )}
              
              <Link 
                to="/bookings" 
                className="booking-detail-btn booking-detail-btn-outline"
              >
                Back to Bookings List
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;