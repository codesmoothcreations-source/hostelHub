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
import { FaUpload, FaTrash, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import "./EditHostel.css"

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
        <button onClick={() => navigate('/my-hostels')} className="hostelhub-back-button">
          <FaArrowLeft /> Back to My Hostels
        </button>
      </div>
    );
  }

  // Check if user is owner or admin
  if (user.role !== 'admin' && user._id !== hostel.owner._id) {
    return (
      <div className="hostelhub-unauthorized">
        <h2>Unauthorized</h2>
        <p>You don't have permission to edit this hostel.</p>
        <button onClick={() => navigate('/hostels')} className="hostelhub-back-button">
          <FaArrowLeft /> Back to Hostels
        </button>
      </div>
    );
  }

  return (
    <div className="hostelhub-edit-hostel">
      <div className="hostelhub-edit-hostel-header">
        <button
          onClick={() => navigate(`/hostels/${id}`)}
          className="hostelhub-back-button"
        >
          <FaArrowLeft className="hostelhub-back-icon" />
          Back to Hostel
        </button>
        
        <h1 className="hostelhub-edit-hostel-title">Edit Hostel</h1>
        <p className="hostelhub-edit-hostel-subtitle">
          Update the details of your hostel listing
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="hostelhub-edit-hostel-form">
        <div className="hostelhub-form-section">
          <h3 className="hostelhub-form-section-title">Basic Information</h3>
          
          <div className="hostelhub-form-group">
            <label htmlFor="name" className="hostelhub-form-label">
              Hostel Name *
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className="hostelhub-form-input"
              placeholder="Enter hostel name"
            />
            {errors.name && (
              <p className="hostelhub-form-error">{errors.name.message}</p>
            )}
          </div>

          <div className="hostelhub-form-group">
            <label htmlFor="description" className="hostelhub-form-label">
              Description *
            </label>
            <textarea
              id="description"
              {...register('description')}
              className="hostelhub-form-textarea"
              placeholder="Describe your hostel, facilities, rules, etc."
              rows="4"
            />
            {errors.description && (
              <p className="hostelhub-form-error">{errors.description.message}</p>
            )}
          </div>

          <div className="hostelhub-form-row">
            <div className="hostelhub-form-group">
              <label htmlFor="price" className="hostelhub-form-label">
                Price (GH₵) *
              </label>
              <input
                type="number"
                id="price"
                {...register('price')}
                className="hostelhub-form-input"
                placeholder="Monthly price"
                min="0"
                step="0.01"
              />
              {errors.price && (
                <p className="hostelhub-form-error">{errors.price.message}</p>
              )}
            </div>

            <div className="hostelhub-form-group">
              <label htmlFor="availableRooms" className="hostelhub-form-label">
                Available Rooms *
              </label>
              <input
                type="number"
                id="availableRooms"
                {...register('availableRooms')}
                className="hostelhub-form-input"
                placeholder="Number of rooms"
                min="0"
              />
              {errors.availableRooms && (
                <p className="hostelhub-form-error">{errors.availableRooms.message}</p>
              )}
            </div>
          </div>

          <div className="hostelhub-form-group">
            <label htmlFor="rentDuration" className="hostelhub-form-label">
              Rent Duration *
            </label>
            <select
              id="rentDuration"
              {...register('rentDuration')}
              className="hostelhub-form-select"
            >
              <option value="">Select duration</option>
              {RENT_DURATIONS.map((duration) => (
                <option key={duration.value} value={duration.value}>
                  {duration.label}
                </option>
              ))}
            </select>
            {errors.rentDuration && (
              <p className="hostelhub-form-error">{errors.rentDuration.message}</p>
            )}
          </div>
        </div>

        <div className="hostelhub-form-section">
          <h3 className="hostelhub-form-section-title">Location</h3>
          
          <div className="hostelhub-form-group">
            <label htmlFor="address" className="hostelhub-form-label">
              Address *
            </label>
            <input
              type="text"
              id="address"
              {...register('address')}
              className="hostelhub-form-input"
              placeholder="Enter full address"
            />
            {errors.address && (
              <p className="hostelhub-form-error">{errors.address.message}</p>
            )}
          </div>

          <div className="hostelhub-location-info">
            <p className="hostelhub-location-note">
              Current coordinates: {hostel.location?.coordinates[1]?.toFixed(6)}, {hostel.location?.coordinates[0]?.toFixed(6)}
            </p>
            <p className="hostelhub-location-warning">
              Note: Location coordinates cannot be changed once set.
            </p>
          </div>

          <input type="hidden" {...register('lat')} />
          <input type="hidden" {...register('lng')} />
        </div>

        <div className="hostelhub-form-section">
          <h3 className="hostelhub-form-section-title">Amenities</h3>
          
          <div className="hostelhub-amenities-grid">
            {AMENITIES.map((amenity) => (
              <div key={amenity} className="hostelhub-amenity-item">
                <input
                  type="checkbox"
                  id={`edit-amenity-${amenity}`}
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="hostelhub-amenity-checkbox"
                />
                <label htmlFor={`edit-amenity-${amenity}`} className="hostelhub-amenity-label">
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="hostelhub-form-section">
          <h3 className="hostelhub-form-section-title">Images</h3>
          
          <div className="hostelhub-image-upload-section">
            <div className="hostelhub-upload-area">
              <input
                type="file"
                id="edit-images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hostelhub-file-input"
              />
              <label htmlFor="edit-images" className="hostelhub-upload-label">
                <FaUpload className="hostelhub-upload-icon" />
                <span>Add more images</span>
                <span className="hostelhub-upload-hint">
                  Upload additional images (max 5MB each)
                </span>
              </label>
              {uploading && (
                <p className="hostelhub-uploading-text">Uploading...</p>
              )}
            </div>

            {images.length > 0 && (
              <div className="hostelhub-image-preview-grid">
                {images.map((image, index) => (
                  <div key={index} className="hostelhub-image-preview-item">
                    <img src={image} alt={`Hostel image ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="hostelhub-remove-image-button"
                    >
                      <FaTrash className="hostelhub-remove-icon" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <p className="hostelhub-no-images">No images uploaded yet</p>
            )}
          </div>
        </div>

        <div className="hostelhub-form-actions">
          <button
            type="button"
            onClick={() => navigate(`/hostels/${id}`)}
            className="hostelhub-cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="hostelhub-save-button"
          >
            {saving ? (
              <>
                <FaSpinner className="hostelhub-spinner" />
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