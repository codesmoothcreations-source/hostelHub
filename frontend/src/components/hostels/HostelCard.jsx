// src/components/hostels/HostelCard.jsx - ENHANCED WITH SLIDER
import React, { useState } from 'react'; // Import useState
import { Link } from 'react-router-dom';
import { 
    FaStar, 
    FaMapMarkerAlt, 
    FaBed, 
    FaWifi, 
    FaSnowflake, 
    FaBath, 
    FaTv, 
    FaUtensils,
    FaCar,
    FaLeaf,
    FaChevronLeft, // Import left arrow icon
    FaChevronRight  // Import right arrow icon
} from 'react-icons/fa';
import "./HostelCard.css";

const HostelCard = ({ hostel, user }) => {
    // New State for Image Slider
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = hostel.images || [];
    const hasMultipleImages = images.length > 1;

    // Functions to handle slider navigation
    const nextImage = (e) => {
        // Prevent clicking the button from triggering the Link click (card navigation)
        e.preventDefault(); 
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => 
            (prevIndex + 1) % images.length
        );
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => 
            (prevIndex - 1 + images.length) % images.length
        );
    };

    const amenities = hostel.amenities || [];
    // Amenity icons mapping (rest of the logic remains the same)
    const amenityIcons = {
        'WiFi': <FaWifi className="hostelhub-amenity-icon" />,
        'AC': <FaSnowflake className="hostelhub-amenity-icon" />,
        'Private Bathroom': <FaBath className="hostelhub-amenity-icon" />,
        'TV': <FaTv className="hostelhub-amenity-icon" />,
        'Meals': <FaUtensils className="hostelhub-amenity-icon" />,
        'Parking': <FaCar className="hostelhub-amenity-icon" />,
        'Garden': <FaLeaf className="hostelhub-amenity-icon" />
    };

    const displayedAmenities = amenities.slice(0, 3);
    const hasMoreAmenities = amenities.length > 3;

    const occupancyRate = hostel.initialRooms && hostel.availableRooms 
        ? Math.round(100 - ((hostel.availableRooms / hostel.initialRooms) * 100))
        : 0;

    const getPopularityTag = () => {
        if (occupancyRate >= 90) return { text: 'Fully Booked', color: '#ef4444' };
        if (occupancyRate >= 70) return { text: 'Highly Popular', color: '#10b981' };
        if (occupancyRate >= 50) return { text: 'Trending', color: '#f59e0b' };
        return null;
    };

    const popularityTag = getPopularityTag();

    return (
        <div className="hostelhub-hostel-card">
            <Link to={`/hostels/${hostel._id}`} className="hostelhub-hostel-link">
                <div className="hostelhub-hostel-image">
                    {/* Image Display Logic */}
                    {images.length > 0 ? (
                        <img 
                            src={images[currentImageIndex]} // Display current image
                            alt={`${hostel.name} image ${currentImageIndex + 1}`} 
                            loading="lazy"
                        />
                    ) : (
                        <div className="hostelhub-no-image-placeholder">
                            <FaBed className="hostelhub-placeholder-icon" />
                        </div>
                    )}

                    {/* Slider Controls */}
                    {hasMultipleImages && (
                        <>
                            <button 
                                className="hostelhub-slider-control hostelhub-slider-prev"
                                onClick={prevImage}
                                aria-label="Previous image"
                            >
                                <FaChevronLeft />
                            </button>
                            <button 
                                className="hostelhub-slider-control hostelhub-slider-next"
                                onClick={nextImage}
                                aria-label="Next image"
                            >
                                <FaChevronRight />
                            </button>
                            {/* Dots/Indicators */}
                            <div className="hostelhub-slider-dots">
                                {images.map((_, index) => (
                                    <span
                                        key={index}
                                        className={`hostelhub-slider-dot ${index === currentImageIndex ? 'active' : ''}`}
                                        onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation();
                                            setCurrentImageIndex(index);
                                        }}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    
                    {/* Badges */}
                    {popularityTag && (
                        <div 
                            className="hostelhub-popularity-tag"
                            style={{ background: popularityTag.color }}
                        >
                            {popularityTag.text}
                        </div>
                    )}
                    
                    <div className="hostelhub-occupancy-badge">
                        {occupancyRate}% Occupied
                    </div>
                </div>

                <div className="hostelhub-hostel-info">
                    {/* Rest of the info section remains the same */}
                    <div className="hostelhub-hostel-header">
                        <div>
                            <h3 className="hostelhub-hostel-name">{hostel.name}</h3>
                            <div className="hostelhub-hostel-category">
                                {hostel.category || 'Standard Hostel'}
                            </div>
                        </div>
                        <div className="hostelhub-hostel-price">
                            GH₵{hostel.price}<span>/{hostel.rentDuration}</span>
                        </div>
                    </div>

                    <div className="hostelhub-hostel-location">
                        <FaMapMarkerAlt className="hostelhub-location-icon" />
                        <span className="hostelhub-location-text">
                            {hostel.location?.address || 'Location not specified'}
                        </span>
                    </div>

                    <div className="hostelhub-hostel-rating">
                        <div className="hostelhub-stars">
                            {[...Array(5)].map((_, i) => (
                                <FaStar 
                                    key={i} 
                                    className={`hostelhub-star-icon ${i < Math.floor(hostel.rating || 0) ? 'hostelhub-star-filled' : 'hostelhub-star-empty'}`}
                                />
                            ))}
                        </div>
                        <div className="hostelhub-rating-numbers">
                            <span className="hostelhub-rating-value">
                                {hostel.rating || 'N/A'}
                            </span>
                            <span className="hostelhub-rating-count">
                                ({hostel.numberOfRatings || 0})
                            </span>
                        </div>
                    </div>

                    <div className="hostelhub-hostel-amenities">
                        {displayedAmenities.map((amenity, index) => (
                            <span key={index} className="hostelhub-amenity-tag">
                                {amenityIcons[amenity] || <FaWifi className="hostelhub-amenity-icon" />}
                                {amenity}
                            </span>
                        ))}
                        {hasMoreAmenities && (
                            <span className="hostelhub-amenity-more">
                                +{amenities.length - 3} more
                            </span>
                        )}
                    </div>

                    <div className="hostelhub-hostel-meta">
                        <div className="hostelhub-hostel-rooms">
                            <FaBed className="hostelhub-rooms-icon" />
                            <span>{hostel.availableRooms || 0} rooms available</span>
                        </div>
                        
                        <div className="hostelhub-hostel-occupancy">
                            <div className="hostelhub-occupancy-bar">
                                <div 
                                    className="hostelhub-occupancy-fill"
                                    style={{ width: `${occupancyRate}%` }}
                                ></div>
                            </div>
                            <div className="hostelhub-occupancy-text">
                                {hostel.availableRooms || 0} of {hostel.initialRooms || hostel.availableRooms || 0} rooms
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default HostelCard;