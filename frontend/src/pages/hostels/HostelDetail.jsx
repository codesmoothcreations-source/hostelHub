// src/pages/hostels/HostelDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hostelsAPI, reviewsAPI } from '../../api';
import { usePaystack } from '../../hooks/usePaystack';
import { bookingsAPI } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AMENITIES } from '../../utils/constants';
import { FaStar, FaMapMarkerAlt, FaBed, FaPhone, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import "./HostelDetail.css"

const HostelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { processPayment } = usePaystack();
  
  const [hostel, setHostel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  useEffect(() => {
    fetchHostelDetails();
  }, [id]);

  const fetchHostelDetails = async () => {
    setLoading(true);
    try {
      const [hostelResponse, reviewsResponse] = await Promise.all([
        hostelsAPI.getHostel(id),
        reviewsAPI.getHostelReviews(id, { limit: 5 })
      ]);
      
      setHostel(hostelResponse.data.hostel);
      setReviews(reviewsResponse.data.reviews || []);
    } catch (error) {
      console.error('Error fetching hostel details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      alert('Only students can book hostels');
      return;
    }

    if (hostel.availableRooms <= 0) {
      alert('Sorry, no rooms available');
      return;
    }

    setBookingLoading(true);
    try {
      // Initiate booking
      const bookingResponse = await bookingsAPI.initiateBooking(hostel._id);
      const { booking, paymentAuthorizationUrl, paystackPublicKey } = bookingResponse.data;

      // Process payment
      const paymentResult = await processPayment({
        email: user.email,
        amount: booking.amount,
        reference: booking.reference,
        currency: booking.currency
      });

      if (paymentResult.success) {
        // Verify booking
        await bookingsAPI.verifyBooking(booking.reference);
        navigate(`/payment-success/${booking._id}`);
      } else {
        navigate(`/payment-failed/${booking._id}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactOwner = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/messages/new/${hostel.owner._id}`);
  };

  if (loading) {
    return (
      <div className="hostelhub-loading-state">
        <div className="hostelhub-loading-spinner"></div>
        <p>Loading hostel details...</p>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="hostelhub-not-found">
        <h2>Hostel not found</h2>
        <Link to="/hostels" className="hostelhub-back-button">
          <FaArrowLeft /> Back to Hostels
        </Link>
      </div>
    );
  }

  const visibleAmenities = showAllAmenities 
    ? hostel.amenities 
    : hostel.amenities?.slice(0, 6);

  return (
    <div className="hostelhub-hostel-detail">
      <div className="hostelhub-detail-header">
        <Link to="/hostels" className="hostelhub-back-link">
          <FaArrowLeft className="hostelhub-back-icon" />
          Back to Hostels
        </Link>
      </div>

      <div className="hostelhub-detail-main">
        <div className="hostelhub-detail-images">
          {hostel.images && hostel.images.length > 0 ? (
            <>
              <img 
                src={hostel.images[0]} 
                alt={hostel.name}
                className="hostelhub-main-image"
              />
              {hostel.images.length > 1 && (
                <div className="hostelhub-image-gallery">
                  {hostel.images.slice(1, 5).map((image, index) => (
                    <img 
                      key={index}
                      src={image}
                      alt={`${hostel.name} - ${index + 2}`}
                      className="hostelhub-gallery-image"
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="hostelhub-no-image">
              <FaBed className="hostelhub-no-image-icon" />
              <p>No images available</p>
            </div>
          )}
        </div>

        <div className="hostelhub-detail-info">
          <div className="hostelhub-info-header">
            <h1 className="hostelhub-hostel-name">{hostel.name}</h1>
            <div className="hostelhub-price-rating">
              <div className="hostelhub-price">
                <span className="hostelhub-price-amount">
                  {formatCurrency(hostel.price)}
                </span>
                <span className="hostelhub-price-period">/{hostel.rentDuration}</span>
              </div>
              <div className="hostelhub-rating">
                <FaStar className="hostelhub-star-icon" />
                <span className="hostelhub-rating-value">{hostel.rating || 'N/A'}</span>
                <span className="hostelhub-rating-count">
                  ({hostel.numberOfRatings || 0} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="hostelhub-location">
            <FaMapMarkerAlt className="hostelhub-location-icon" />
            <span className="hostelhub-location-text">{hostel.location?.address}</span>
          </div>

          <div className="hostelhub-description">
            <h3 className="hostelhub-section-title">Description</h3>
            <p className="hostelhub-description-text">{hostel.description}</p>
          </div>

          <div className="hostelhub-amenities">
            <h3 className="hostelhub-section-title">Amenities</h3>
            <div className="hostelhub-amenities-list">
              {visibleAmenities?.map((amenity, index) => (
                <span key={index} className="hostelhub-amenity-tag">
                  {amenity}
                </span>
              ))}
            </div>
            {hostel.amenities?.length > 6 && !showAllAmenities && (
              <button
                onClick={() => setShowAllAmenities(true)}
                className="hostelhub-show-more-button"
              >
                Show all {hostel.amenities.length} amenities
              </button>
            )}
          </div>

          <div className="hostelhub-availability">
            <h3 className="hostelhub-section-title">Availability</h3>
            <div className="hostelhub-availability-info">
              <div className="hostelhub-rooms-available">
                <FaBed className="hostelhub-rooms-icon" />
                <span className="hostelhub-rooms-count">
                  {hostel.availableRooms} rooms available
                </span>
              </div>
              <div className="hostelhub-occupancy-rate">
                <span>Occupancy: {hostel.occupancyRate || 0}%</span>
              </div>
            </div>
          </div>

          <div className="hostelhub-owner-info">
            <h3 className="hostelhub-section-title">Hostel Owner</h3>
            <div className="hostelhub-owner-details">
              <div className="hostelhub-owner-avatar">
                {hostel.owner?.avatar ? (
                  <img src={hostel.owner.avatar} alt={hostel.owner.name} />
                ) : (
                  <div className="hostelhub-owner-avatar-placeholder">
                    {hostel.owner?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="hostelhub-owner-text">
                <h4 className="hostelhub-owner-name">{hostel.owner?.name}</h4>
                {hostel.owner?.phone && (
                  <p className="hostelhub-owner-phone">
                    <FaPhone className="hostelhub-owner-icon" />
                    {hostel.owner.phone}
                  </p>
                )}
                <p className="hostelhub-owner-email">
                  <FaEnvelope className="hostelhub-owner-icon" />
                  {hostel.owner?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleContactOwner}
              className="hostelhub-contact-owner-button"
            >
              Contact Owner
            </button>
          </div>

          <div className="hostelhub-booking-section">
            <div className="hostelhub-booking-summary">
              <h3 className="hostelhub-section-title">Booking Summary</h3>
              <div className="hostelhub-booking-details">
                <div className="hostelhub-booking-row">
                  <span>Price per {hostel.rentDuration}</span>
                  <span>{formatCurrency(hostel.price)}</span>
                </div>
                <div className="hostelhub-booking-total">
                  <span>Total Amount</span>
                  <span>{formatCurrency(hostel.price)}</span>
                </div>
              </div>
            </div>

            <div className="hostelhub-booking-actions">
              {user?.role === 'student' ? (
                <button
                  onClick={handleBookNow}
                  disabled={bookingLoading || hostel.availableRooms <= 0}
                  className="hostelhub-book-now-button"
                >
                  {bookingLoading ? 'Processing...' : 'Book Now'}
                </button>
              ) : user?.role === 'owner' && user._id === hostel.owner._id ? (
                <Link to={`/edit-hostel/${hostel._id}`} className="hostelhub-edit-hostel-button">
                  Edit Hostel
                </Link>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="hostelhub-login-to-book-button"
                >
                  Login as Student to Book
                </button>
              )}
              
              {hostel.availableRooms <= 0 && (
                <p className="hostelhub-no-rooms-message">
                  Sorry, no rooms available at the moment
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hostelhub-reviews-section">
        <h3 className="hostelhub-section-title">Reviews</h3>
        {reviews.length > 0 ? (
          <div className="hostelhub-reviews-list">
            {reviews.map(review => (
              <div key={review._id} className="hostelhub-review-item">
                <div className="hostelhub-review-header">
                  <div className="hostelhub-reviewer-avatar">
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} alt={review.user.name} />
                    ) : (
                      <div className="hostelhub-reviewer-avatar-placeholder">
                        {review.user?.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="hostelhub-reviewer-info">
                    <h4 className="hostelhub-reviewer-name">{review.user?.name}</h4>
                    <div className="hostelhub-review-rating">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`hostelhub-review-star ${i < review.rating ? 'hostelhub-star-filled' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="hostelhub-review-date">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className="hostelhub-review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="hostelhub-no-reviews">No reviews yet</p>
        )}
        
        <Link to={`/hostels/${id}/reviews`} className="hostelhub-view-all-reviews">
          View all reviews
        </Link>
      </div>
    </div>
  );
};

export default HostelDetail;