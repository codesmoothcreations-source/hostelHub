// src/pages/hostels/EditHostel.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../context/AuthContext';
import { hostelsAPI } from '../../api';
import { useUpload } from '../../hooks/useUpload';
import { hostelSchema } from '../../utils/validators';
import { AMENITIES, RENT_DURATIONS } from '../../utils/constants';
import { FaUpload, FaTrash, FaSpinner, FaArrowLeft, FaHome, FaMoneyBill, FaBed, FaCalendar, FaMapMarkerAlt, FaWifi } from 'react-icons/fa';
import styles from './EditHostel.module.css';

const EditHostel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadFiles, uploading } = useUpload();
  
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    resolver: yupResolver(hostelSchema)
  });

  useEffect(() => {
    fetchHostel();
  }, [id]);

  useEffect(() => {
    if (hostel) {
      reset({
        name: hostel.name,
        description: hostel.description,
        price: hostel.price,
        address: hostel.location?.address,
        availableRooms: hostel.availableRooms,
        rentDuration: hostel.rentDuration
      });
      
      setSelectedAmenities(hostel.amenities || []);
      setImages(hostel.images || []);
      setValue('amenities', hostel.amenities || []);
      setValue('images', hostel.images || []);
      setValue('lat', hostel.location?.coordinates[1]);
      setValue('lng', hostel.location?.coordinates[0]);
    }
  }, [hostel, reset, setValue]);

  const fetchHostel = async () => {
    setLoading(true);
    try {
      const response = await hostelsAPI.getHostel(id);
      setHostel(response.data.hostel);
    } catch (error) {
      console.error('Error fetching hostel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmenityToggle = (amenity) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    
    setSelectedAmenities(newAmenities);
    setValue('amenities', newAmenities);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const result = await uploadFiles(files);
    if (result.success) {
      const newImages = [...images, ...result.images];
      setImages(newImages);
      setValue('images', newImages);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue('images', newImages);
  };

  const onSubmit = async (data) => {
    if (!hostel) return;

    setSaving(true);
    try {
      const updateData = {
        ...data,
        amenities: selectedAmenities,
        images: images,
        address: data.address || hostel.location?.address
      };

      await hostelsAPI.updateHostel(id, updateData);
      navigate(`/hostels/${id}`);
    } catch (error) {
      console.error('Error updating hostel:', error);
    } finally {
      setSaving(false);
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
        <h2>Hostel not found</h2>
        <button onClick={() => navigate('/my-hostels')} className={styles.backButton}>
          <FaArrowLeft /> Back to My Hostels
        </button>
      </div>
    );
  }

  // Check if user is owner or admin
  if (user.role !== 'admin' && user._id !== hostel.owner._id) {
    return (
      <div className={styles.unauthorized}>
        <h2>Unauthorized</h2>
        <p>You don't have permission to edit this hostel.</p>
        <button onClick={() => navigate('/hostels')} className={styles.backButton}>
          <FaArrowLeft /> Back to Hostels
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <br />
      <div className={styles.header}>
        <button
          onClick={() => navigate(`/hostels/${id}`)}
          className={styles.backButton}
        >
          <FaArrowLeft className={styles.backIcon} />
          Back to Hostel
        </button>
        
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <FaHome />
          </div>
          <div>
            <h1 className={styles.title}>Edit Hostel</h1>
            <p className={styles.subtitle}>
              Update the details of your hostel listing
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* SECTION 1: Basic Information */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <FaHome />
            </div>
            <div>
              <h3 className={styles.sectionTitle}>Basic Information</h3>
              <p className={styles.sectionSubtitle}>Update hostel name, description, and pricing</p>
            </div>
          </div>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                <FaHome /> Hostel Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder="Enter hostel name"
              />
              {errors.name && (
                <p className={styles.error}>{errors.name.message}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Description *
              </label>
              <textarea
                id="description"
                {...register('description')}
                className={`${styles.input} ${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                placeholder="Describe your hostel, facilities, rules, etc."
                rows="4"
              />
              {errors.description && (
                <p className={styles.error}>{errors.description.message}</p>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="price" className={styles.label}>
                  <FaMoneyBill /> Price (GH₵) *
                </label>
                <div className={styles.priceInput}>
                  <span className={styles.currency}>GH₵</span>
                  <input
                    type="number"
                    id="price"
                    {...register('price')}
                    className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                    placeholder="Monthly price"
                    min="0"
                    step="0.01"
                  />
                  <span className={styles.priceSuffix}>/Year</span>
                </div>
                {errors.price && (
                  <p className={styles.error}>{errors.price.message}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="availableRooms" className={styles.label}>
                  <FaBed /> Available Rooms *
                </label>
                <div className={styles.roomsInput}>
                  <input
                    type="number"
                    id="availableRooms"
                    {...register('availableRooms')}
                    className={`${styles.input} ${errors.availableRooms ? styles.inputError : ''}`}
                    placeholder="Number of rooms"
                    min="0"
                  />
                  <span className={styles.roomsSuffix}>rooms</span>
                </div>
                {errors.availableRooms && (
                  <p className={styles.error}>{errors.availableRooms.message}</p>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="rentDuration" className={styles.label}>
                <FaCalendar /> Rent Duration *
              </label>
              <select
                id="rentDuration"
                {...register('rentDuration')}
                className={`${styles.input} ${styles.select} ${errors.rentDuration ? styles.inputError : ''}`}
              >
                <option value="">Select duration</option>
                {RENT_DURATIONS.map((duration) => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
              {errors.rentDuration && (
                <p className={styles.error}>{errors.rentDuration.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Location */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <FaMapMarkerAlt />
            </div>
            <div>
              <h3 className={styles.sectionTitle}>Location</h3>
              <p className={styles.sectionSubtitle}>Update address and location details</p>
            </div>
          </div>
          
          <div className={styles.formCard}>
            <div className={styles.formGroup}>
              <label htmlFor="address" className={styles.label}>
                <FaMapMarkerAlt /> Address *
              </label>
              <textarea
                id="address"
                {...register('address')}
                className={`${styles.input} ${styles.textarea} ${errors.address ? styles.inputError : ''}`}
                placeholder="Enter full address"
                rows="2"
              />
              {errors.address && (
                <p className={styles.error}>{errors.address.message}</p>
              )}
            </div>

            <div className={styles.locationInfo}>
              <div className={styles.coordinates}>
                <span className={styles.coordinatesLabel}>Current coordinates:</span>
                <span className={styles.coordinatesValue}>
                  {hostel.location?.coordinates[1]?.toFixed(6)}, {hostel.location?.coordinates[0]?.toFixed(6)}
                </span>
              </div>
              <div className={styles.locationNote}>
                <span className={styles.noteIcon}>⚠️</span>
                <span className={styles.noteText}>Note: Location coordinates cannot be changed once set.</span>
              </div>
            </div>

            <input type="hidden" {...register('lat')} />
            <input type="hidden" {...register('lng')} />
          </div>
        </div>

        {/* SECTION 3: Amenities */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <FaWifi />
            </div>
            <div>
              <h3 className={styles.sectionTitle}>Amenities</h3>
              <p className={styles.sectionSubtitle}>Select all amenities available in your hostel</p>
            </div>
          </div>
          
          <div className={`${styles.amenitiesSection} ${styles.formCard}`}>
            {/* Selected Amenities */}
            {selectedAmenities.length > 0 && (
              <div className={styles.selectedAmenities}>
                <div className={styles.selectedHeader}>
                  <span>✅ Selected ({selectedAmenities.length})</span>
                </div>
                <br />
                {/* <div className={styles.selectedTags}>
                  {selectedAmenities.map((amenity) => (
                    <span
                      key={amenity}
                      className={styles.selectedTag}
                      onClick={() => handleAmenityToggle(amenity)}
                      title="Click to remove"
                    >
                      {amenity}
                      <span className={styles.removeTag}>×</span>
                    </span>
                  ))}
                </div> */}
              </div>
            )}

            {/* Amenities Grid */}
            <div className={styles.amenitiesGrid}>
              {AMENITIES.map((amenity) => (
                <div key={amenity} className={styles.amenityItem}>
                  <input
                    type="checkbox"
                    id={`edit-amenity-${amenity}`}
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className={styles.amenityCheckbox}
                  />
                  <label 
                    htmlFor={`edit-amenity-${amenity}`} 
                    className={`${styles.amenityLabel} ${selectedAmenities.includes(amenity) ? styles.amenityLabelActive : ''}`}
                  >
                    <span className={styles.amenityCheck}></span>
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: Images */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <FaUpload />
            </div>
            <div>
              <h3 className={styles.sectionTitle}>Images</h3>
              <p className={styles.sectionSubtitle}>Update hostel photos</p>
            </div>
          </div>
          
          <div className={styles.imagesSection}>
            <div className={styles.uploadArea}>
              <input
                type="file"
                id="edit-images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
              <label htmlFor="edit-images" className={styles.uploadLabel}>
                <div className={styles.uploadIconWrapper}>
                  <FaUpload className={styles.uploadIcon} />
                </div>
                <div className={styles.uploadContent}>
                  <span className={styles.uploadTitle}>Add more images</span>
                  <span className={styles.uploadHint}>
                    Click or drag to upload (max 5MB each)
                  </span>
                </div>
              </label>
              {uploading && (
                <div className={styles.uploading}>
                  <FaSpinner className={styles.uploadSpinner} />
                  <span>Uploading...</span>
                </div>
              )}
            </div>

            {images.length > 0 && (
              <div className={styles.imagesPreview}>
                <div className={styles.imagesHeader}>
                  <h4>Current Images ({images.length})</h4>
                  <p className={styles.imagesHint}>Click the trash icon to remove an image</p>
                </div>
                <div className={styles.imagesGrid}>
                  {images.map((image, index) => (
                    <div key={index} className={styles.imageCard}>
                      <div className={styles.imageContainer}>
                        <img src={image} alt={`Hostel image ${index + 1}`} />
                        <div className={styles.imageOverlay}>
                          <span className={styles.imageNumber}>#{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className={styles.removeImageButton}
                            title="Remove image"
                          >
                            <FaTrash className={styles.removeIcon} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length === 0 && (
              <div className={styles.noImages}>
                <div className={styles.noImagesIcon}>🖼️</div>
                <p>No images uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate(`/hostels/${id}`)}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className={`${styles.saveButton} ${saving || uploading ? styles.saveButtonDisabled : ''}`}
          >
            {saving ? (
              <>
                <FaSpinner className={styles.spinner} />
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditHostel;