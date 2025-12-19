import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaStar, FaMapMarkerAlt, FaBed, FaWifi, FaSnowflake, 
    FaBath, FaTv, FaUtensils, FaCar, FaLeaf, 
    FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';
import styles from './HostelCard.module.css';

const HostelCard = ({ hostel }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = hostel.images || [];
    const hasMultipleImages = images.length > 1;

    const nextImage = (e) => {
        e.preventDefault(); 
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const amenityIcons = {
        'WiFi': <FaWifi />,
        'AC': <FaSnowflake />,
        'Private Bathroom': <FaBath />,
        'TV': <FaTv />,
        'Meals': <FaUtensils />,
        'Parking': <FaCar />,
        'Garden': <FaLeaf />
    };

    const occupancyRate = hostel.initialRooms && hostel.availableRooms 
        ? Math.round(100 - ((hostel.availableRooms / hostel.initialRooms) * 100))
        : 0;

    const getPopularityTag = () => {
        if (occupancyRate >= 90) return { text: 'Filling Fast', class: styles.danger };
        if (occupancyRate >= 70) return { text: 'Top Choice', class: styles.success };
        return null;
    };

    const popularityTag = getPopularityTag();

    return (
        <div className={styles.card}>
            <Link to={`/hostels/${hostel._id}`} className={styles.link}>
                {/* Image Section */}
                <div className={styles.imageContainer}>
                    {images.length > 0 ? (
                        <img 
                            src={images[currentImageIndex]} 
                            alt={hostel.name} 
                            className={styles.image}
                        />
                    ) : (
                        <div className={styles.placeholder}>
                            <FaBed />
                        </div>
                    )}

                    {hasMultipleImages && (
                        <>
                            <button className={`${styles.navBtn} ${styles.prev}`} onClick={prevImage}>
                                <FaChevronLeft />
                            </button>
                            <button className={`${styles.navBtn} ${styles.next}`} onClick={nextImage}>
                                <FaChevronRight />
                            </button>
                            <div className={styles.dots}>
                                {images.map((_, i) => (
                                    <span 
                                        key={i} 
                                        className={`${styles.dot} ${i === currentImageIndex ? styles.activeDot : ''}`} 
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {popularityTag && (
                        <div className={`${styles.tag} ${popularityTag.class}`}>
                            {popularityTag.text}
                        </div>
                    )}
                    <div className={styles.priceTag}>
                        GH₵{hostel.price}<small>/{hostel.rentDuration}</small>
                    </div>
                </div>

                {/* Info Section */}
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h3 className={styles.name}>{hostel.name}</h3>
                        <div className={styles.rating}>
                            <FaStar className={styles.starIcon} />
                            <span>{hostel.rating || 'New'}</span>
                        </div>
                    </div>

                    <div className={styles.location}>
                        <FaMapMarkerAlt />
                        <span>{hostel.location?.address || 'Address hidden'}</span>
                    </div>

                    <div className={styles.amenities}>
                        {hostel.amenities?.slice(0, 3).map((amt, i) => (
                            <span key={i} className={styles.amenityTag}>
                                {amenityIcons[amt] || <FaWifi />} {amt}
                            </span>
                        ))}
                    </div>

                    <div className={styles.footer}>
                        <div className={styles.roomsInfo}>
                            <strong>{hostel.availableRooms}</strong> rooms left
                        </div>
                        <div className={styles.progressBarWrapper}>
                            <div 
                                className={styles.progressBar} 
                                style={{ width: `${occupancyRate}%` }} 
                            />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default HostelCard;