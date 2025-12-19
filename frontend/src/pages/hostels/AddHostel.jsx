// src/pages/hostels/AddHostel.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Context, API, Hooks, Utilities
import { useAuth } from "../../context/AuthContext";
import { hostelsAPI } from "../../api";
import { useGeolocation } from "../../hooks/useGeolocation";
import { hostelSchema } from "../../utils/validators";
import { AMENITIES, RENT_DURATIONS } from "../../utils/constants";

// Components
import InteractiveMap from "../../components/maps/InteractiveMap";
import ImageUpload from "../../components/uploads/ImageUpload";

// Icons
import {
  FaMapMarkerAlt,
  FaSpinner,
  FaCrosshairs,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaHome,
  FaMoneyBill,
  FaBed,
  FaCalendar,
  FaWifi,
  FaSnowflake,
  FaBath,
  FaTv,
  FaUtensils,
  FaCar,
  FaLeaf,
  FaUpload,
  FaImages,
  FaMap,
  FaInfoCircle,
  FaListAlt,
} from "react-icons/fa";

// Component Styles - CSS MODULES
import styles from './AddHostel.module.css';

// Amenity Icons Mapping
const useAmenityIcons = () =>
  useMemo(
    () => ({
      WiFi: <FaWifi className={styles.amenityIcon} />,
      AC: <FaSnowflake className={styles.amenityIcon} />,
      "Air Conditioning": <FaSnowflake className={styles.amenityIcon} />,
      "Private Bathroom": <FaBath className={styles.amenityIcon} />,
      TV: <FaTv className={styles.amenityIcon} />,
      Meals: <FaUtensils className={styles.amenityIcon} />,
      Parking: <FaCar className={styles.amenityIcon} />,
      Garden: <FaLeaf className={styles.amenityIcon} />,
    }),
    []
  );

const AddHostel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const amenityIcons = useAmenityIcons();

  const {
    location: userLocation,
    error: locationError,
    loading: locationLoading,
  } = useGeolocation();

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "",
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(hostelSchema),
    defaultValues: {
      rentDuration: "monthly",
      availableRooms: 1,
      price: "",
      lat: null,
      lng: null,
      address: "",
      amenities: [],
      images: [],
    },
  });

  const reverseGeocode = useCallback(
    async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`
        );
        const data = await response.json();
        if (data.display_name) {
          const address = data.display_name.split(",").slice(0, 3).join(",");
          setValue("address", address, { shouldValidate: true });
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        setValue("address", `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`, {
          shouldValidate: true,
        });
      }
    },
    [setValue]
  );

  const handleMapLocationSelect = useCallback(
    (selectedLocation) => {
      const { lat, lng } = selectedLocation;
      setLocation({ lat, lng, address: "Selected on map" });
      setValue("lat", lat, { shouldValidate: true });
      setValue("lng", lng, { shouldValidate: true });
      reverseGeocode(lat, lng);
      toast.success("📍 Location selected!");
    },
    [setValue, reverseGeocode]
  );

  const handleAmenityToggle = useCallback(
    (amenity) => {
      setSelectedAmenities((prevAmenities) => {
        const isSelected = prevAmenities.includes(amenity);
        const newAmenities = isSelected
          ? prevAmenities.filter((a) => a !== amenity)
          : [...prevAmenities, amenity];

        setValue("amenities", newAmenities, { shouldValidate: true });
        return newAmenities;
      });
    },
    [setValue]
  );

  const handleImageUpload = useCallback(
    (newImageUrls) => {
      const validUrls = newImageUrls.filter((url) => {
        try {
          new URL(url);
          return url.startsWith("http");
        } catch {
          return false;
        }
      });

      if (validUrls.length === 0) {
        toast.error("No valid image URLs received");
        return;
      }

      setImages((prevImages) => {
        const allImages = [...prevImages, ...validUrls].slice(0, 10);
        setValue("images", allImages, { shouldValidate: true });
        toast.success(`🎉 Added ${validUrls.length} image(s)`);
        return allImages;
      });
    },
    [setValue]
  );

  const handleRemoveImage = useCallback(
    (index) => {
      setImages((prevImages) => {
        const newImages = prevImages.filter((_, i) => i !== index);
        setValue("images", newImages, { shouldValidate: true });
        toast.info("Image removed");
        return newImages;
      });
    },
    [setValue]
  );

  const handleSetMainImage = useCallback(
    (index) => {
      setImages((prevImages) => {
        if (index === 0) return prevImages;
        const newImages = [
          prevImages[index],
          ...prevImages.filter((_, i) => i !== index),
        ];
        setValue("images", newImages);
        toast.success("Set as main photo! ⭐");
        return newImages;
      });
    },
    [setValue]
  );

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }

    toast.loading("📍 Finding your location...", { id: "location-toast" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss("location-toast");
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        handleMapLocationSelect({ lat, lng });
        toast.success("Location found! 🎯");
      },
      (error) => {
        toast.dismiss("location-toast");
        toast.error(`📍 Location error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSubmit = async (data) => {
    if (!location.lat || !location.lng) {
      toast.error("📍 Please select a location on the map");
      return;
    }
    if (images.length === 0) {
      toast.error("📸 Please upload at least one image");
      return;
    }

    setSubmitting(true);
    toast.loading("✨ Creating your beautiful hostel...", { id: "submit-toast" });

    try {
      const hostelData = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng),
        address: data.address || location.address,
        availableRooms: parseInt(data.availableRooms),
        rentDuration: data.rentDuration,
        amenities: selectedAmenities,
        images: images,
      };

      const response = await hostelsAPI.createHostel(hostelData);
      toast.dismiss("submit-toast");

      if (response.success) {
        toast.success("🎉 Hostel created successfully!");
        navigate(`/hostels/${response.data.hostel._id}`);
      } else {
        toast.error(response.message || "Failed to create hostel");
      }
    } catch (error) {
      toast.dismiss("submit-toast");
      console.error("Hostel creation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create hostel";
      toast.error(`❌ Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      handleMapLocationSelect(userLocation);
    }
  }, [userLocation, handleMapLocationSelect]);

  const renderStepHeader = (icon, title, subtitle) => (
    <div className={styles.stepHeader}>
      <div className={styles.stepIcon}>{icon}</div>
      <div>
        <h3 className={styles.stepTitle}>{title}</h3>
        <p className={styles.stepDescription}>{subtitle}</p>
      </div>
    </div>
  );

  const canSubmit = useMemo(
    () => !submitting && !!location.lat && images.length > 0,
    [submitting, location.lat, images.length]
  );

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <button
            onClick={() => navigate("/my-hostels")}
            className={styles.backButton}
          >
            <FaArrowLeft /> Back to Hostels
          </button>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <FaHome />
            </div>
            <div>
              <h1 className={styles.title}>List Your Hostel</h1>
              <p className={styles.subtitle}>
                Share your space with students. Fill in all details below and click
                Publish. 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          
          {/* SECTION 1: Location (Map) */}
          <div className={styles.formStep}>
            {renderStepHeader(
              <FaMapMarkerAlt />,
              "📍 1. Set Your Location",
              "Help students find your hostel by setting the exact location on the map."
            )}

            <div className={styles.locationCard}>
              <div className={styles.locationControls}>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={locationLoading}
                  className={styles.locationButton}
                >
                  {locationLoading ? (
                    <FaSpinner className={styles.spinner} />
                  ) : (
                    <FaCrosshairs />
                  )}
                  Use My Current Location
                </button>
                <div className={styles.locationHint}>
                  <FaInfoCircle />
                  <span>Click on the map to select your hostel's location</span>
                </div>
              </div>

              {location.lat && location.lng ? (
                <div className={styles.locationSuccess}>
                  <FaCheckCircle />
                  <div>
                    <span className={styles.locationSuccessTitle}>
                      Location Set! 🎯
                    </span>
                    <span className={styles.locationSuccessText}>
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={styles.locationWarning}>
                  <FaExclamationTriangle />
                  <span>Please select a location on the map to continue</span>
                </div>
              )}

              {/* Interactive Map */}
              <div className={styles.mapContainer}>
                <InteractiveMap
                  userLocation={location.lat ? location : null}
                  onLocationSelect={handleMapLocationSelect}
                  interactive={true}
                />
              </div>

              {/* Address Field */}
              <div className={styles.formGroup}>
                <label>
                  <FaMap /> Address *
                  <span className={styles.labelHint}>
                    (will be auto-filled from map)
                  </span>
                </label>
                <textarea
                  {...register("address")}
                  placeholder="🎯 Click on the map to set address..."
                  rows="2"
                  className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                />
                {errors.address && (
                  <span className={styles.formError}>
                    {errors.address.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Basic Info */}
          <div className={styles.formStep}>
            {renderStepHeader(
              <FaListAlt />,
              "📝 2. Hostel Details",
              "Tell students about your hostel. Make it descriptive and inviting!"
            )}
            <div className={styles.detailsGrid}>
              {/* Left Card: Name & Description */}
              <div className={styles.formCard}>
                <div className={styles.formGroup}>
                  <label>
                    <FaHome /> Hostel Name *
                  </label>
                  <input
                    {...register("name")}
                    placeholder="e.g., Sunshine Student Hostel"
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  />
                  {errors.name && (
                    <span className={styles.formError}>
                      {errors.name.message}
                    </span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>Description *</label>
                  <textarea
                    {...register("description")}
                    placeholder="✨ Describe your hostel... What makes it special? What facilities are available? What's nearby?"
                    rows="4"
                    className={`${styles.input} ${errors.description ? styles.inputError : ''}`}
                  />
                  {errors.description && (
                    <span className={styles.formError}>
                      {errors.description.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Card: Price, Rooms, Duration */}
              <div className={styles.formCard}>
                <div className={styles.detailsRow}>
                  <div className={styles.formGroup}>
                    <label>
                      <FaMoneyBill /> Price (GH₵) *
                    </label>
                    <div className={styles.priceInput}>
                      <span className={styles.currency}>GH₵</span>
                      <input
                        type="number"
                        {...register("price")}
                        placeholder="Yearly rent"
                        min="0"
                        step="10"
                        className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                      />
                      <span className={styles.priceSuffix}>/year</span>
                    </div>
                    {errors.price && (
                      <span className={styles.formError}>
                        {errors.price.message}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      <FaBed /> Available Rooms *
                    </label>
                    <div className={styles.roomsInput}>
                      <input
                        type="number"
                        {...register("availableRooms")}
                        placeholder="Number of rooms"
                        min="1"
                        className={`${styles.input} ${errors.availableRooms ? styles.inputError : ''}`}
                      />
                      {/* <span className={styles.roomsSuffix}>rooms</span> */}
                    </div>
                    {errors.availableRooms && (
                      <span className={styles.formError}>
                        {errors.availableRooms.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <FaCalendar /> Rent Duration *
                  </label>
                  <div className={styles.rentOptions}>
                    {RENT_DURATIONS.map((duration) => (
                      <label
                        key={duration.value}
                        className={styles.rentOption}
                      >
                        <input
                          type="radio"
                          {...register("rentDuration")}
                          value={duration.value}
                          checked={watch("rentDuration") === duration.value}
                        />
                        <span className={styles.rentLabel}>
                          {duration.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Amenities */}
          <div className={styles.formStep}>
            {renderStepHeader(
              <FaWifi />,
              "⭐ 3. Select Amenities",
              "What does your hostel offer? Select all that apply to attract more students."
            )}

            <div className={`${styles.amenitiesSection} ${styles.formCard}`}>
              {/* Selected Amenities Display */}
              {selectedAmenities.length > 0 && (
                <div className={styles.selectedAmenities}>
                  <div className={styles.selectedHeader}>
                    <span>
                      ✅ Your selected amenities ({selectedAmenities.length})
                    </span>
                  </div>
                  <div className={styles.selectedTags}>
                    {selectedAmenities.map((amenity) => (
                      <span
                        key={amenity}
                        className={styles.selectedTag}
                        onClick={() => handleAmenityToggle(amenity)}
                        title="Click to remove"
                      >
                        {amenityIcons[amenity] || <FaWifi />}
                        {amenity}
                        <span className={styles.removeTag}>×</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenity Selection Grid */}
              <div className={styles.amenitiesGrid}>
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`${styles.amenityButton} ${
                      selectedAmenities.includes(amenity)
                        ? styles.amenityButtonActive
                        : ''
                    }`}
                  >
                    <div className={styles.amenityIconWrapper}>
                      {amenityIcons[amenity] || (
                        <FaWifi className={styles.amenityIcon} />
                      )}
                    </div>
                    <span className={styles.amenityText}>{amenity}</span>
                    {selectedAmenities.includes(amenity) && (
                      <div className={styles.amenityCheck}>✓</div>
                    )}
                  </button>
                ))}
              </div>

              <div className={styles.amenitiesNote}>
                <FaInfoCircle />
                <span>
                  Select amenities that best describe your hostel. Students love
                  seeing what's included!
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Images */}
          <div className={styles.formStep}>
            {renderStepHeader(
              <FaImages />,
              "📸 4. Upload Photos",
              "Showcase your hostel with beautiful photos. First image will be the main thumbnail! (Minimum 1 image required)"
            )}

            <div className={styles.imagesSection}>
              <div className={styles.uploadCard}>
                <div className={styles.uploadIcon}>
                  <FaUpload />
                </div>
                <h4>Drag & Drop or Click to Upload</h4>
                <p className={styles.uploadHint}>
                  Upload clear photos of rooms, common areas, exterior, and
                  amenities
                </p>
                <ImageUpload onUploadComplete={handleImageUpload} maxFiles={10} />
                <div className={styles.uploadTips}>
                  <FaInfoCircle />
                  <span>
                    Tips: Use bright, clear photos. Show different angles. Include
                    amenities!
                  </span>
                </div>
              </div>

              {images.length > 0 && (
                <div className={styles.imagesPreview}>
                  <div className={styles.imagesHeader}>
                    <h4>
                      <FaImages /> Selected Photos ({images.length}/10)
                    </h4>
                    <span className={styles.imagesHint}>
                      Click "Set as Main" to choose the thumbnail
                    </span>
                  </div>
                  <div className={styles.imagesGrid}>
                    {images.map((url, index) => (
                      <div key={index} className={styles.imageCard}>
                        <div className={styles.imageContainer}>
                          <img
                            src={url}
                            alt={`Hostel ${index + 1}`}
                            loading="lazy"
                          />
                          <div className={styles.imageOverlay}>
                            <span className={styles.imageNumber}>
                              #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className={styles.removeImage}
                              title="Remove image"
                            >
                              ×
                            </button>
                          </div>
                          {index === 0 && (
                            <div className={styles.mainImageBadge}>
                              ⭐ Main Photo
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(index)}
                          className={styles.setMainButton}
                          disabled={index === 0}
                        >
                          {index === 0 ? "★ Main" : "Set as Main"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.images && (
                <div className={styles.imagesError}>
                  <FaExclamationTriangle />
                  <span>{errors.images.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Hidden inputs for React Hook Form */}
          <input type="hidden" {...register("lat")} />
          <input type="hidden" {...register("lng")} />
          <input type="hidden" {...register("amenities")} />
          <input type="hidden" {...register("images")} />

          {/* Final Submission Footer */}
          <div className={styles.formSubmissionFooter}>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`${styles.submitButton} ${
                canSubmit ? styles.submitButtonReady : styles.submitButtonDisabled
              }`}
            >
              {submitting ? (
                <>
                  <FaSpinner className={styles.spinner} /> Creating Hostel...
                </>
              ) : (
                "✨ Publish Hostel"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHostel;