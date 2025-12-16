// src/pages/profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUpload } from '../../hooks/useUpload';
import { formatDate } from '../../utils/formatters';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaKey, FaCalendar } from 'react-icons/fa';
import "./Profile.css"

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { uploadFiles, uploading } = useUpload();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    address: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        address: user.location?.address || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        avatar: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
        let finalAvatarUrl = formData.avatar; 
        
        // 1. Upload new avatar if selected
        if (avatarFile) {
            const uploadResult = await uploadFiles([avatarFile]);
            
            // 🔥 The Fix: Safely attempt to find the URL array on the result object.
            // Check for 'images', 'data', or 'urls' in that order.
            const uploadedUrls = uploadResult?.images 
                                 || uploadResult?.data 
                                 || uploadResult?.urls 
                                 || []; 
            
            // Ensure we are working with an array before trying to access [0]
            if (uploadResult.success && Array.isArray(uploadedUrls) && uploadedUrls.length > 0) {
                // This line should now work because uploadedUrls is guaranteed to be an array
                finalAvatarUrl = uploadedUrls[0]; 
            } else {
                console.error('Avatar file upload failed or returned invalid format.');
                // Re-throw the original API Error from the upload step if possible
                // For now, we stop the process:
                setLoading(false);
                return; 
            }
        }

        // 2. Prepare data for the profile update (remains unchanged)
        const updateData = {
            name: formData.name,
            phone: formData.phone,
            avatar: finalAvatarUrl, 
            address: formData.address
        };

        // 3. Call the update profile API
        const result = await updateProfile(updateData);
        
        if (result.success) {
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            setAvatarFile(null);
        } else {
            console.error('Profile update failed:', result.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error in profile update process:', error);
    } finally {
        setLoading(false);
    }
};

  if (!user) {
    return (
      <div className="hostelhub-loading-state">
        <div className="hostelhub-loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="hostelhub-profile-page">
      <div className="hostelhub-profile-header">
        <h1 className="hostelhub-profile-title">My Profile</h1>
        <p className="hostelhub-profile-subtitle">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="hostelhub-profile-container">
        <div className="hostelhub-profile-sidebar">
          <div className="hostelhub-avatar-section">
            <div className="hostelhub-avatar-container">
              {formData.avatar ? (
                <img src={formData.avatar} alt={user.name} className="hostelhub-avatar" />
              ) : (
                <div className="hostelhub-avatar-placeholder">
                  <FaUser className="hostelhub-avatar-icon" />
                </div>
              )}
              
              {isEditing && (
                <label className="hostelhub-avatar-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hostelhub-avatar-input"
                  />
                  Change Photo
                </label>
              )}
            </div>
            
            <div className="hostelhub-user-basic-info">
              <h2 className="hostelhub-user-name">{user.name}</h2>
              <span className="hostelhub-user-role">{user.role}</span>
              <div className="hostelhub-member-since">
                <FaCalendar className="hostelhub-calendar-icon" />
                <span>Member since {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="hostelhub-profile-menu">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="hostelhub-menubutton"
            >
              <FaEdit className="hostelhub-menu-icon" />
              Edit Profile
            </button>
            
            <Link to="/change-password" className="hostelhub-menubutton">
              <FaKey className="hostelhub-menu-icon" />
              Change Password
            </Link>
          </div>
        </div>

        <div className="hostelhub-profile-main">
          {success && (
            <div className="hostelhub-success-message">
              {success}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="hostelhub-edit-form">
              <div className="hostelhub-form-section">
                <h3 className="hostelhub-section-title">Personal Information</h3>
                
                <div className="hostelhub-form-group">
                  <label htmlFor="name" className="hostelhub-form-label">
                    <FaUser className="hostelhub-label-icon" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="hostelhub-form-input"
                    required
                  />
                </div>

                <div className="hostelhub-form-group">
                  <label htmlFor="email" className="hostelhub-form-label">
                    <FaEnvelope className="hostelhub-label-icon" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    className="hostelhub-form-input"
                    disabled
                  />
                  <p className="hostelhub-form-help">
                    Email cannot be changed. Contact support for assistance.
                  </p>
                </div>

                <div className="hostelhub-form-group">
                  <label htmlFor="phone" className="hostelhub-form-label">
                    <FaPhone className="hostelhub-label-icon" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="hostelhub-form-input"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="hostelhub-form-group">
                  <label htmlFor="address" className="hostelhub-form-label">
                    <FaMapMarkerAlt className="hostelhub-label-icon" />
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="hostelhub-form-textarea"
                    rows="3"
                    placeholder="Enter your current address"
                  />
                </div>
              </div>

              <div className="hostelhub-form-actions">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="hostelhub-cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="hostelhub-save-button"
                >
                  {loading || uploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="hostelhub-profile-details">
              <div className="hostelhub-detail-section">
                <h3 className="hostelhub-section-title">Contact Information</h3>
                
                <div className="hostelhub-detail-grid">
                  <div className="hostelhub-detail-item">
                    <FaUser className="hostelhub-detail-icon" />
                    <div className="hostelhub-detail-content">
                      <span className="hostelhub-detail-label">Full Name</span>
                      <span className="hostelhub-detail-value">{user.name}</span>
                    </div>
                  </div>

                  <div className="hostelhub-detail-item">
                    <FaEnvelope className="hostelhub-detail-icon" />
                    <div className="hostelhub-detail-content">
                      <span className="hostelhub-detail-label">Email Address</span>
                      <span className="hostelhub-detail-value">{user.email}</span>
                    </div>
                  </div>

                  <div className="hostelhub-detail-item">
                    <FaPhone className="hostelhub-detail-icon" />
                    <div className="hostelhub-detail-content">
                      <span className="hostelhub-detail-label">Phone Number</span>
                      <span className="hostelhub-detail-value">{user.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="hostelhub-detail-item">
                    <FaMapMarkerAlt className="hostelhub-detail-icon" />
                    <div className="hostelhub-detail-content">
                      <span className="hostelhub-detail-label">Address</span>
                      <span className="hostelhub-detail-value">
                        {user.location?.address || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hostelhub-detail-section">
                <h3 className="hostelhub-section-title">Account Information</h3>
                
                <div className="hostelhub-detail-grid">
                  <div className="hostelhub-detail-item">
                    <div className="hostelhub-detail-content">
                      <span className="hostelhub-detail-label">Account Type</span>
                      <span className="hostelhub-detail-value hostelhub-role-badge">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="hostelhub-detail-item">
                    <div className="hostelhub-detail-content">
                      <span className="hostelhub-detail-label">Account Status</span>
                      <span className="hostelhub-detail-value hostelhub-status-active">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="hostelhub-detail-item">
                    <div className="hostelhub-detail-content">
                      <span className="hostelhub-detail-label">Member Since</span>
                      <span className="hostelhub-detail-value">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {user.role === 'owner' && (
                <div className="hostelhub-detail-section">
                  <h3 className="hostelhub-section-title">Hostel Owner Stats</h3>
                  <div className="hostelhub-owner-stats">
                    <p className="hostelhub-stat-info">
                      As a hostel owner, you can manage your hostels, view bookings,
                      and track your earnings through the owner dashboard.
                    </p>
                    <Link to="/my-hostels" className="hostelhub-manage-hostels-button">
                      Manage My Hostels
                    </Link>
                  </div>
                </div>
              )}

              {user.role === 'student' && (
                <div className="hostelhub-detail-section">
                  <h3 className="hostelhub-section-title">Student Information</h3>
                  <div className="hostelhub-student-info">
                    <p className="hostelhub-student-text">
                      Browse hostels, make bookings, and communicate with hostel owners
                      directly through our platform.
                    </p>
                    <Link to="/hostels" className="hostelhub-browse-hostels-button">
                      Browse Hostels
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;