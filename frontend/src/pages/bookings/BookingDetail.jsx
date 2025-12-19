// src/pages/bookings/BookingDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI } from '../../api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { FaArrowLeft, FaPrint, FaDownload, FaCalendar, FaMoneyBill, FaCheckCircle, FaTimesCircle, FaBuilding, FaUser } from 'react-icons/fa';
import styles from './BookingDetail.module.css'; // Changed to CSS Modules import

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
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinnerCircle}></div>
        </div>
        <p className={styles.loadingText}>Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundContent}>
          <h2 className={styles.notFoundTitle}>Booking Not Found</h2>
          <p className={styles.notFoundMessage}>
            The booking you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/bookings" className={styles.backButton}>
            <FaArrowLeft className={styles.backIcon} />
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const canCancel = booking.paymentStatus === 'success' && 
                   user?._id === booking.student?._id;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Link to="/bookings" className={styles.navBack}>
              <FaArrowLeft className={styles.navIcon} />
              Back to Bookings
            </Link>
            
            <div className={styles.headerActions}>
              <button
                onClick={handlePrintReceipt}
                className={`${styles.actionBtn} ${styles.actionPrint}`}
              >
                <FaPrint className={styles.actionBtnIcon} />
                Print Receipt
              </button>
              <button
                onClick={handleDownloadReceipt}
                className={`${styles.actionBtn} ${styles.actionDownload}`}
              >
                <FaDownload className={styles.actionBtnIcon} />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className={styles.card}>
          {/* Booking Header */}
          <div className={styles.cardHeader}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>Booking Details</h1>
              <div className={styles.reference}>
                Reference: <span className={styles.refCode}>{booking.reference}</span>
              </div>
            </div>
            
            <div 
              className={styles.statusBadge}
              style={{ 
                backgroundColor: `${getStatusColor(booking.paymentStatus)}20`,
                color: getStatusColor(booking.paymentStatus),
                border: `1px solid ${getStatusColor(booking.paymentStatus)}40`
              }}
            >
              <span className={styles.statusIcon}>
                {getStatusIcon(booking.paymentStatus)}
              </span>
              <span className={styles.statusText}>
                {booking.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Booking Information Grid */}
          <div className={styles.grid}>
            {/* Booking Info Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <FaCalendar className={styles.sectionIcon} />
                <h3 className={styles.sectionTitle}>Booking Information</h3>
              </div>
              
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Booking Date:</span>
                  <span className={styles.infoValue}>
                    {formatDateTime(booking.createdAt)}
                  </span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Amount:</span>
                  <span className={`${styles.infoValue} ${styles.amount}`}>
                    {formatCurrency(booking.amount, booking.currency)}
                  </span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Duration:</span>
                  <span className={`${styles.infoValue} ${styles.duration}`}>
                    {booking.duration || 'Monthly'}
                  </span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Payment Method:</span>
                  <span className={styles.infoValue}>
                    {booking.paymentMeta?.channel || 'Paystack'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <FaMoneyBill className={styles.sectionIcon} />
                <h3 className={styles.sectionTitle}>Payment Details</h3>
              </div>
              
              <div className={styles.paymentDetails}>
                <div className={styles.paymentItem}>
                  <span className={styles.paymentLabel}>Amount Paid:</span>
                  <span className={styles.paymentValue}>
                    {formatCurrency(booking.amount, booking.currency)}
                  </span>
                </div>
                
                <div className={styles.paymentItem}>
                  <span className={styles.paymentLabel}>Payment Reference:</span>
                  <span className={styles.paymentReference}>
                    {booking.paystackReference || 'N/A'}
                  </span>
                </div>
                
                <div className={styles.paymentItem}>
                  <span className={styles.paymentLabel}>Payment Status:</span>
                  <span 
                    className={styles.paymentStatus}
                    style={{ color: getStatusColor(booking.paymentStatus) }}
                  >
                    {booking.paymentStatus.toUpperCase()}
                  </span>
                </div>
                
                {booking.paymentMeta && (
                  <div className={styles.paymentMeta}>
                    <button
                      onClick={() => setShowPaymentMeta(!showPaymentMeta)}
                      className={styles.metaToggle}
                    >
                      {showPaymentMeta ? 'Hide' : 'Show'} Payment Metadata
                    </button>
                    
                    {showPaymentMeta && (
                      <div className={styles.metaContent}>
                        <pre className={styles.metaPre}>
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
          <div className={`${styles.section} ${styles.hostelSection}`}>
            <div className={styles.sectionHeader}>
              <FaBuilding className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Hostel Information</h3>
            </div>
            
            <div className={styles.hostelCard}>
              <div className={styles.hostelImage}>
                {booking.hostel?.images?.[0] ? (
                  <img 
                    src={booking.hostel.images[0]} 
                    alt={booking.hostel.name}
                    className={styles.hostelImg}
                  />
                ) : (
                  <div className={styles.hostelImagePlaceholder}>
                    <FaBuilding className={styles.placeholderIcon} />
                    <span>No Image Available</span>
                  </div>
                )}
              </div>
              
              <div className={styles.hostelInfo}>
                <h4 className={styles.hostelName}>{booking.hostel?.name}</h4>
                <p className={styles.hostelAddress}>
                  {booking.hostel?.location?.address}
                </p>
                <div className={styles.hostelPrice}>
                  <span className={styles.priceLabel}>Price:</span>
                  <span className={styles.priceValue}>
                    {formatCurrency(booking.hostel?.price, booking.hostel?.currency)}/{booking.hostel?.rentDuration}
                  </span>
                </div>
                
                <div className={styles.hostelActions}>
                  <Link
                    to={`/hostels/${booking.hostel?._id}`}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    View Hostel Details
                  </Link>
                  {booking.paymentStatus === 'success' && (
                    <Link
                      to={`/messages/new/${booking.hostel?.owner?._id}`}
                      className={`${styles.btn} ${styles.btnPrimary}`}
                    >
                      Contact Owner
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className={`${styles.section} ${styles.ownerSection}`}>
            <div className={styles.sectionHeader}>
              <FaUser className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Owner Information</h3>
            </div>
            
            <div className={styles.ownerCard}>
              <div className={styles.ownerAvatar}>
                {booking.hostel?.owner?.avatar ? (
                  <img 
                    src={booking.hostel.owner.avatar} 
                    alt={booking.hostel.owner.name}
                    className={styles.ownerImg}
                  />
                ) : (
                  <div className={styles.ownerAvatarPlaceholder}>
                    {booking.hostel?.owner?.name?.charAt(0) || 'O'}
                  </div>
                )}
              </div>
              
              <div className={styles.ownerDetails}>
                <h4 className={styles.ownerName}>{booking.hostel?.owner?.name}</h4>
                <p className={styles.ownerEmail}>{booking.hostel?.owner?.email}</p>
                {booking.hostel?.owner?.phone && (
                  <p className={styles.ownerPhone}>{booking.hostel.owner.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className={styles.actionsFooter}>
            <div className={styles.actionsGroup}>
              {canCancel && (
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className={`${styles.btn} ${styles.btnDanger}`}
                >
                  {cancelling ? (
                    <>
                      <span className={styles.btnSpinner}></span>
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Booking'
                  )}
                </button>
              )}
              
              <Link 
                to="/bookings" 
                className={`${styles.btn} ${styles.btnOutline}`}
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