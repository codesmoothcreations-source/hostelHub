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

// Icons (using Fa for consistent naming)
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

// Component Styles (assumed to contain the 'hostelhub-' class styles)
import "./AddHostel.css";

// --- Amenity Icons Mapping (Optimized with useMemo for performance) ---
const useAmenityIcons = () =>
  useMemo(
    () => ({
      WiFi: <FaWifi className="hostelhub-amenity-icon" />,
      AC: <FaSnowflake className="hostelhub-amenity-icon" />,
      "Air Conditioning": <FaSnowflake className="hostelhub-amenity-icon" />,
      "Private Bathroom": <FaBath className="hostelhub-amenity-icon" />,
      TV: <FaTv className="hostelhub-amenity-icon" />,
      Meals: <FaUtensils className="hostelhub-amenity-icon" />,
      Parking: <FaCar className="hostelhub-amenity-icon" />,
      Garden: <FaLeaf className="hostelhub-amenity-icon" />,
    }),
    []
  );

// ====================================================================
// --- Main Component: AddHostel ---
// ====================================================================

const AddHostel = () => {
  // --- Hooks and State Initialization ---
  const navigate = useNavigate();
  const { user } = useAuth(); // Keeping for context access, though not directly used in the current render
  const amenityIcons = useAmenityIcons();

  const {
    location: userLocation,
    error: locationError,
    loading: locationLoading,
  } = useGeolocation();

  // Local State for non-form managed data
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "",
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // React Hook Form Configuration
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
      // Placeholder for location and images, managed outside form state but validated via schema
      lat: null,
      lng: null,
      address: "",
      amenities: [],
      images: [],
    },
  });

  // --- Utility Functions ---

  /**
   * Reverse geocodes coordinates to a human-readable address.
   * Uses OpenStreetMap's Nominatim service.
   */
  const reverseGeocode = useCallback(
    async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`
        );
        const data = await response.json();
        if (data.display_name) {
          // Truncate address for cleaner display (e.g., first 3 parts)
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

  // --- Handlers ---

  /**
   * Handles location selection from the map component.
   */
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

  /**
   * Toggles an amenity's selection state.
   */
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

  /**
   * Handles image URLs received from the ImageUpload component.
   */
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
        const allImages = [...prevImages, ...validUrls].slice(0, 10); // Limit to 10 images
        setValue("images", allImages, { shouldValidate: true });
        toast.success(`🎉 Added ${validUrls.length} image(s)`);
        return allImages;
      });
    },
    [setValue]
  );

  /**
   * Removes an image by its index from the preview list.
   */
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

  /**
   * Sets a specific image as the main/first photo.
   */
  const handleSetMainImage = useCallback(
    (index) => {
      setImages((prevImages) => {
        if (index === 0) return prevImages; // Already main
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

  /**
   * Tries to get the user's precise current location via native Geolocation API.
   */
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
        handleMapLocationSelect({ lat, lng }); // Use existing handler for consistency
        toast.success("Location found! 🎯");
      },
      (error) => {
        toast.dismiss("location-toast");
        toast.error(`📍 Location error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /**
   * Final submission logic for the form.
   */
  const onSubmit = async (data) => {
    // Client-side guard check for non-form-controlled fields
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
        // Use the geocoded address, fallback to location state address if needed
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

  // --- Effects ---

  // Auto-detect user location on load (using useGeolocation hook)
  useEffect(() => {
    if (userLocation) {
      handleMapLocationSelect(userLocation);
    }
    // Note: handleMapLocationSelect includes setValue and reverseGeocode
  }, [userLocation, handleMapLocationSelect]);

  // --- Render Functions ---

  /**
   * Render helper for form section headers.
   */
  const renderStepHeader = (icon, title, subtitle) => (
    <div className="hostelhub-step-header">
      <div className="hostelhub-step-icon">{icon}</div>
      <div>
        <h3 className="hostelhub-step-title">{title}</h3>
        <p className="hostelhub-step-description">{subtitle}</p>
      </div>
    </div>
  );

  const canSubmit = useMemo(
    () => !submitting && !!location.lat && images.length > 0,
    [submitting, location.lat, images.length]
  );

  // --- JSX Return ---
  return (
    <div className="hostelhub-add-hostel">
      {/* Header */}
      <div className="hostelhub-add-hostel-header">
        <button
          onClick={() => navigate("/my-hostels")}
          className="hostelhub-back-button"
        >
          <FaArrowLeft /> Back to Hostels
        </button>
        <div className="hostelhub-header-content">
          <div className="hostelhub-header-icon">
            <FaHome />
          </div>
          <div>
            <h1 className="hostelhub-add-hostel-title">List Your Hostel</h1>
            <p className="hostelhub-add-hostel-subtitle">
              Share your space with students. Fill in all details below and click
              Publish. 🚀
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="hostelhub-add-hostel-form">
        
        {/* SECTION 1: Location (Map) */}
        <div className="hostelhub-form-step">
          {renderStepHeader(
            <FaMapMarkerAlt />,
            "📍 1. Set Your Location",
            "Help students find your hostel by setting the exact location on the map."
          )}

          <div className="hostelhub-location-card">
            <div className="hostelhub-location-controls">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locationLoading}
                className="hostelhub-location-button"
              >
                {locationLoading ? (
                  <FaSpinner className="hostelhub-spinner" />
                ) : (
                  <FaCrosshairs />
                )}
                Use My Current Location
              </button>
              <div className="hostelhub-location-hint">
                <FaInfoCircle />
                <span>Click on the map to select your hostel's location</span>
              </div>
            </div>

            {location.lat && location.lng ? (
              <div className="hostelhub-location-success">
                <FaCheckCircle />
                <div>
                  <span className="hostelhub-location-success-title">
                    Location Set! 🎯
                  </span>
                  <span className="hostelhub-location-success-text">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="hostelhub-location-warning">
                <FaExclamationTriangle />
                <span>Please select a location on the map to continue</span>
              </div>
            )}

            {/* Interactive Map */}
            <div className="hostelhub-map-container">
              <InteractiveMap
                userLocation={location.lat ? location : null}
                onLocationSelect={handleMapLocationSelect}
                interactive={true}
              />
              {/* Optional: Trigger a diagram of the map component */}
              
            </div>

            {/* Address Field */}
            <div className="hostelhub-form-group">
              <label>
                <FaMap /> Address *
                <span className="hostelhub-label-hint">
                  (will be auto-filled from map)
                </span>
              </label>
              <textarea
                {...register("address")}
                placeholder="🎯 Click on the map to set address..."
                rows="2"
                className={errors.address ? "hostelhub-input-error" : ""}
              />
              {errors.address && (
                <span className="hostelhub-form-error">
                  {errors.address.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Basic Info */}
        <div className="hostelhub-form-step">
          {renderStepHeader(
            <FaListAlt />,
            "📝 2. Hostel Details",
            "Tell students about your hostel. Make it descriptive and inviting!"
          )}
          <div className="hostelhub-details-grid">
            {/* Left Card: Name & Description */}
            <div className="hostelhub-form-card">
              <div className="hostelhub-form-group">
                <label>
                  <FaHome /> Hostel Name *
                </label>
                <input
                  {...register("name")}
                  placeholder="e.g., Sunshine Student Hostel"
                  className={errors.name ? "hostelhub-input-error" : ""}
                />
                {errors.name && (
                  <span className="hostelhub-form-error">
                    {errors.name.message}
                  </span>
                )}
              </div>
              <div className="hostelhub-form-group">
                <label>Description *</label>
                <textarea
                  {...register("description")}
                  placeholder="✨ Describe your hostel... What makes it special? What facilities are available? What's nearby?"
                  rows="4"
                  className={errors.description ? "hostelhub-input-error" : ""}
                />
                {errors.description && (
                  <span className="hostelhub-form-error">
                    {errors.description.message}
                  </span>
                )}
              </div>
            </div>

            {/* Right Card: Price, Rooms, Duration */}
            <div className="hostelhub-form-card">
              <div className="hostelhub-details-row">
                <div className="hostelhub-form-group">
                  <label>
                    <FaMoneyBill /> Price (GH₵) *
                  </label>
                  <div className="hostelhub-price-input">
                    <span className="hostelhub-currency">GH₵</span>
                    <input
                      type="number"
                      {...register("price")}
                      placeholder="Monthly rent"
                      min="0"
                      step="10"
                      className={errors.price ? "hostelhub-input-error" : ""}
                    />
                    <span className="hostelhub-price-suffix">/month</span>
                  </div>
                  {errors.price && (
                    <span className="hostelhub-form-error">
                      {errors.price.message}
                    </span>
                  )}
                </div>

                <div className="hostelhub-form-group">
                  <label>
                    <FaBed /> Available Rooms *
                  </label>
                  <div className="hostelhub-rooms-input">
                    <input
                      type="number"
                      {...register("availableRooms")}
                      placeholder="Number of rooms"
                      min="1"
                      className={
                        errors.availableRooms ? "hostelhub-input-error" : ""
                      }
                    />
                    <span className="hostelhub-rooms-suffix">rooms</span>
                  </div>
                  {errors.availableRooms && (
                    <span className="hostelhub-form-error">
                      {errors.availableRooms.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="hostelhub-form-group">
                <label>
                  <FaCalendar /> Rent Duration *
                </label>
                <div className="hostelhub-rent-options">
                  {RENT_DURATIONS.map((duration) => (
                    <label
                      key={duration.value}
                      className="hostelhub-rent-option"
                    >
                      <input
                        type="radio"
                        {...register("rentDuration")}
                        value={duration.value}
                        checked={watch("rentDuration") === duration.value}
                      />
                      <span className="hostelhub-rent-label">
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
        <div className="hostelhub-form-step">
          {renderStepHeader(
            <FaWifi />,
            "⭐ 3. Select Amenities",
            "What does your hostel offer? Select all that apply to attract more students."
          )}

          <div className="hostelhub-amenities-section hostelhub-form-card">
            {/* Selected Amenities Display */}
            {selectedAmenities.length > 0 && (
              <div className="hostelhub-selected-amenities">
                <div className="hostelhub-selected-header">
                  <span>
                    ✅ Your selected amenities ({selectedAmenities.length})
                  </span>
                </div>
                <div className="hostelhub-selected-tags">
                  {selectedAmenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="hostelhub-selected-tag"
                      onClick={() => handleAmenityToggle(amenity)}
                      title="Click to remove"
                    >
                      {amenityIcons[amenity] || <FaWifi />}
                      {amenity}
                      <span className="hostelhub-remove-tag">×</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenity Selection Grid */}
            <div className="hostelhub-amenities-grid">
              {AMENITIES.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`hostelhub-amenity-button ${
                    selectedAmenities.includes(amenity)
                      ? "hostelhub-amenity-button-active"
                      : ""
                  }`}
                >
                  <div className="hostelhub-amenity-icon-wrapper">
                    {amenityIcons[amenity] || (
                      <FaWifi className="hostelhub-amenity-icon" />
                    )}
                  </div>
                  <span className="hostelhub-amenity-text">{amenity}</span>
                  {selectedAmenities.includes(amenity) && (
                    <div className="hostelhub-amenity-check">✓</div>
                  )}
                </button>
              ))}
            </div>

            <div className="hostelhub-amenities-note">
              <FaInfoCircle />
              <span>
                Select amenities that best describe your hostel. Students love
                seeing what's included!
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Images */}
        <div className="hostelhub-form-step">
          {renderStepHeader(
            <FaImages />,
            "📸 4. Upload Photos",
            "Showcase your hostel with beautiful photos. First image will be the main thumbnail! (Minimum 1 image required)"
          )}

          <div className="hostelhub-images-section">
            <div className="hostelhub-upload-card">
              <div className="hostelhub-upload-icon">
                <FaUpload />
              </div>
              <h4>Drag & Drop or Click to Upload</h4>
              <p className="hostelhub-upload-hint">
                Upload clear photos of rooms, common areas, exterior, and
                amenities
              </p>
              {/* ImageUpload component handles the file-to-URL/cloud logic */}
              <ImageUpload onUploadComplete={handleImageUpload} maxFiles={10} />
              <div className="hostelhub-upload-tips">
                <FaInfoCircle />
                <span>
                  Tips: Use bright, clear photos. Show different angles. Include
                  amenities!
                </span>
              </div>
              
            </div>

            {images.length > 0 && (
              <div className="hostelhub-images-preview">
                <div className="hostelhub-images-header">
                  <h4>
                    <FaImages /> Selected Photos ({images.length}/10)
                  </h4>
                  <span className="hostelhub-images-hint">
                    Click "Set as Main" to choose the thumbnail
                  </span>
                </div>
                <div className="hostelhub-images-grid">
                  {images.map((url, index) => (
                    <div key={index} className="hostelhub-image-card">
                      <div className="hostelhub-image-container">
                        <img
                          src={url}
                          alt={`Hostel ${index + 1}`}
                          loading="lazy"
                        />
                        <div className="hostelhub-image-overlay">
                          <span className="hostelhub-image-number">
                            #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="hostelhub-remove-image"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                        {index === 0 && (
                          <div className="hostelhub-main-image-badge">
                            ⭐ Main Photo
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(index)}
                        className="hostelhub-set-main-button"
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
              <div className="hostelhub-images-error">
                <FaExclamationTriangle />
                <span>{errors.images.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hidden inputs for React Hook Form (for validation/data passing) */}
        <input type="hidden" {...register("lat")} />
        <input type="hidden" {...register("lng")} />
        <input type="hidden" {...register("amenities")} />
        <input type="hidden" {...register("images")} />

        {/* Final Submission Footer */}
        <div className="hostelhub-form-submission-footer">
          <button
            type="submit"
            disabled={!canSubmit}
            className={`hostelhub-submit-button ${
              canSubmit ? "hostelhub-submit-button-ready" : "hostelhub-submit-button-disabled"
            }`}
          >
            {submitting ? (
              <>
                <FaSpinner className="hostelhub-spinner" /> Creating Hostel...
              </>
            ) : (
              "✨ Publish Hostel"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHostel;