// src/pages/hostels/HostelDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hostelsAPI, reviewsAPI } from '../../api';
import { usePaystack } from '../../hooks/usePaystack';
import { bookingsAPI } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AMENITIES } from '../../utils/constants';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaBed, 
  FaPhone, 
  FaEnvelope, 
  FaArrowLeft,
  FaHome,
  FaCalendar,
  FaWifi,
  FaSnowflake,
  FaBath,
  FaTv,
  FaUtensils,
  FaCar,
  FaLeaf,
  FaUser,
  FaHeart,
  FaShare,
  FaCheckCircle,
  FaImages,
  FaWhatsapp,
  FaSpinner
} from 'react-icons/fa';
import styles from './HostelDetail.module.css';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would typically make an API call to save favorite
  };

  const shareHostel = () => {
    if (navigator.share) {
      navigator.share({
        title: hostel.name,
        text: `Check out ${hostel.name} on HostelHub!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading hostel details...</p>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundContent}>
          <div className={styles.notFoundIcon}>🏠</div>
          <h2>Hostel not found</h2>
          <p>We couldn't find the hostel you're looking for.</p>
          <Link to="/hostels" className={styles.backButton}>
            <FaArrowLeft /> Back to Hostels
          </Link>
        </div>
      </div>
    );
  }

  const visibleAmenities = showAllAmenities 
    ? hostel.amenities 
    : hostel.amenities?.slice(0, 6);

  // Amenity icons mapping
  const amenityIcons = {
    'WiFi': <FaWifi />,
    'AC': <FaSnowflake />,
    'Air Conditioning': <FaSnowflake />,
    'Private Bathroom': <FaBath />,
    'TV': <FaTv />,
    'Meals': <FaUtensils />,
    'Parking': <FaCar />,
    'Garden': <FaLeaf />
  };

  return (
    <div className={styles.container}>
      <br />
      <br />
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/hostels" className={styles.backLink}>
            <FaArrowLeft className={styles.backIcon} />
            <span>Back to Hostels</span>
          </Link>
          
          <div className={styles.headerActions}>
            <button 
              onClick={toggleFavorite} 
              className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ''}`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FaHeart className={styles.favoriteIcon} />
            </button>
            <button 
              onClick={shareHostel} 
              className={styles.shareButton}
              title="Share hostel"
            >
              <FaShare className={styles.shareIcon} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Column - Images & Basic Info */}
        <div className={styles.leftColumn}>
          {/* Image Gallery */}
          <div className={styles.imageGallery}>
            {hostel.images && hostel.images.length > 0 ? (
              <>
                <div className={styles.mainImageContainer}>
                  <img 
                    src={hostel.images[currentImageIndex]} 
                    alt={hostel.name}
                    className={styles.mainImage}
                  />
                  <div className={styles.imageBadges}>
                    <span className={styles.imageCount}>
                      <FaImages /> {currentImageIndex + 1} / {hostel.images.length}
                    </span>
                    <span className={styles.verifiedBadge}>
                      <FaCheckCircle /> Verified
                    </span>
                  </div>
                </div>
                
                {hostel.images.length > 1 && (
                  <div className={styles.thumbnailGrid}>
                    {hostel.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`${styles.thumbnailButton} ${index === currentImageIndex ? styles.thumbnailActive : ''}`}
                      >
                        <img 
                          src={image}
                          alt={`${hostel.name} - ${index + 1}`}
                          className={styles.thumbnail}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noImage}>
                <FaHome className={styles.noImageIcon} />
                <p>No images available</p>
              </div>
            )}
          </div>

          {/* Quick Facts */}
          <div className={styles.quickFacts}>
            <div className={styles.fact}>
              <FaBed className={styles.factIcon} />
              <div className={styles.factContent}>
                <span className={styles.factLabel}>Rooms Available</span>
                <span className={styles.factValue}>{hostel.availableRooms}</span>
              </div>
            </div>
            <div className={styles.fact}>
              <FaCalendar className={styles.factIcon} />
              <div className={styles.factContent}>
                <span className={styles.factLabel}>Rent Duration</span>
                <span className={styles.factValue}>{hostel.rentDuration}</span>
              </div>
            </div>
            <div className={styles.fact}>
              <FaUser className={styles.factIcon} />
              <div className={styles.factContent}>
                <span className={styles.factLabel}>Owner</span>
                <span className={styles.factValue}>{hostel.owner?.name?.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className={styles.locationCard}>
            <div className={styles.locationHeader}>
              <FaMapMarkerAlt className={styles.locationIcon} />
              <h3 className={styles.locationTitle}>Location</h3>
            </div>
            <p className={styles.address}>{hostel.location?.address}</p>
          </div>
        </div>

        {/* Right Column - Details & Booking */}
        <div className={styles.rightColumn}>
          {/* Hostel Header */}
          <div className={styles.hostelHeader}>
            <div>
              <h1 className={styles.hostelName}>{hostel.name}</h1>
              <div className={styles.ratingSection}>
                <div className={styles.rating}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`${styles.starIcon} ${i < (hostel.rating || 0) ? styles.starFilled : styles.starEmpty}`}
                    />
                  ))}
                  <span className={styles.ratingValue}>{hostel.rating || 'N/A'}</span>
                  <span className={styles.ratingCount}>
                    ({hostel.numberOfRatings || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.priceBadge}>
              <span className={styles.priceAmount}>
                {formatCurrency(hostel.price)}
              </span>
              <span className={styles.pricePeriod}>/{hostel.rentDuration}</span>
            </div>
          </div>

          {/* Description */}
          <div className={styles.descriptionCard}>
            <h3 className={styles.sectionTitle}>Description</h3>
            <p className={styles.descriptionText}>{hostel.description}</p>
          </div>

          {/* Amenities */}
          <div className={styles.amenitiesCard}>
            <h3 className={styles.sectionTitle}>
              <FaWifi className={styles.sectionIcon} />
              Amenities & Facilities
            </h3>
            <div className={styles.amenitiesGrid}>
              {visibleAmenities?.map((amenity, index) => (
                <div key={index} className={styles.amenityItem}>
                  <div className={styles.amenityIcon}>
                    {amenityIcons[amenity] || <FaWifi />}
                  </div>
                  <span className={styles.amenityText}>{amenity}</span>
                </div>
              ))}
            </div>
            <br />
            {hostel.amenities?.length > 6 && !showAllAmenities && (
              <button
                onClick={() => setShowAllAmenities(true)}
                className={styles.showMoreButton}
              >
                Show all {hostel.amenities.length} amenities
              </button>
            )}
          </div>

          {/* Owner Info */}
          <div className={styles.ownerCard}>
            <div className={styles.ownerHeader}>
              <div className={styles.ownerAvatar}>
                {hostel.owner?.avatar ? (
                  <img src={hostel.owner.avatar} alt={hostel.owner.name} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {hostel.owner?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h4 className={styles.ownerName}>{hostel.owner?.name}</h4>
                <p className={styles.ownerRole}>Hostel Owner</p>
              </div>
            </div>
            <div className={styles.ownerContact}>
              {hostel.owner?.phone && (
                <a 
                  href={`https://wa.me/${hostel.owner.phone.replace(/\D/g, '')}`} 
                  className={styles.contactButton}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp className={styles.contactIcon} />
                  WhatsApp Owner
                </a>
              )}
              <button
                onClick={handleContactOwner}
                className={styles.messageButton}
              >
                <FaEnvelope className={styles.contactIcon} />
                Message Owner
              </button>
            </div>
          </div>

          {/* Booking Section */}
          <div className={styles.bookingCard}>
            <div className={styles.bookingHeader}>
              <h3 className={styles.sectionTitle}>Book This Hostel</h3>
              <div className={styles.availability}>
                <FaCheckCircle className={styles.availabilityIcon} />
                <span>{hostel.availableRooms > 0 ? `${hostel.availableRooms} rooms available` : 'Fully Booked'}</span>
              </div>
            </div>
            
            <div className={styles.bookingSummary}>
              <div className={styles.summaryRow}>
                <span>Price per {hostel.rentDuration}</span>
                <span>{formatCurrency(hostel.price)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Service fee</span>
                <span>{formatCurrency(hostel.price * 0.05)}</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total Amount</span>
                <span className={styles.totalAmount}>{formatCurrency(hostel.price * 1.05)}</span>
              </div>
            </div>

            <div className={styles.bookingActions}>
              {user?.role === 'student' ? (
                <button
                  onClick={handleBookNow}
                  disabled={bookingLoading || hostel.availableRooms <= 0}
                  className={`${styles.bookButton} ${hostel.availableRooms <= 0 ? styles.bookButtonDisabled : ''}`}
                >
                  {bookingLoading ? (
                    <>
                      <FaSpinner className={styles.spinner} />
                      Processing...
                    </>
                  ) : hostel.availableRooms > 0 ? (
                    'Book Now'
                  ) : (
                    'No Rooms Available'
                  )}
                </button>
              ) : user?.role === 'owner' && user._id === hostel.owner._id ? (
                <Link to={`/edit-hostel/${hostel._id}`} className={styles.messageButton}>
                  Edit Hostel
                </Link>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className={styles.loginButton}
                >
                  Login as Student to Book
                </button>
              )}
              
              <p className={styles.bookingNote}>
                📍 Free cancellation up to 7 days before check-in
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className={styles.reviewsSection}>
        {/* <div className={styles.reviewsHeader}>
          <h3 className={styles.sectionTitle}>Student Reviews</h3>
          <Link to={`/hostels/${id}/reviews`} className={styles.viewAllLink}>
            View all reviews
          </Link>
        </div> */}

        {reviews.length > 0 ? (
          <div className={styles.reviewsGrid}>
            {reviews.slice(0, 3).map(review => (
              <div key={review._id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerAvatar}>
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} alt={review.user.name} />
                    ) : (
                      <div className={styles.reviewerAvatarPlaceholder}>
                        {review.user?.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className={styles.reviewerInfo}>
                    <h4 className={styles.reviewerName}>{review.user?.name}</h4>
                    <div className={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`${styles.reviewStar} ${i < review.rating ? styles.reviewStarFilled : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className={styles.reviewDate}>
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noReviews}>
            <div className={styles.noReviewsIcon}>💬</div>
            <p>No reviews yet. Be the first to review!</p>
            {user && (
              <Link to={`/hostels/${id}/add-review`} className={styles.addReviewButton}>
                Write a Review
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelDetail;