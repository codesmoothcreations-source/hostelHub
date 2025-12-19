// src/pages/profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUpload } from '../../hooks/useUpload';
import { formatDate } from '../../utils/formatters';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaKey, FaCalendar, FaSpinner, FaHome, FaBook, FaArrowLeft, FaCheckCircle, FaCamera } from 'react-icons/fa';
import styles from './Profile.module.css';

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
      
      if (avatarFile) {
        const uploadResult = await uploadFiles([avatarFile]);
        
        const uploadedUrls = uploadResult?.images 
          || uploadResult?.data 
          || uploadResult?.urls 
          || []; 
        
        if (uploadResult.success && Array.isArray(uploadedUrls) && uploadedUrls.length > 0) {
          finalAvatarUrl = uploadedUrls[0]; 
        } else {
          console.error('Avatar file upload failed or returned invalid format.');
          setLoading(false);
          return; 
        }
      }

      const updateData = {
        name: formData.name,
        phone: formData.phone,
        avatar: finalAvatarUrl, 
        address: formData.address
      };

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
      <div className={styles.loadingState}>
        <FaSpinner className={styles.loadingSpinner} />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <FaUser />
          </div>
          <div>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>
              Manage your personal information and account settings
            </p>
          </div>
        </div>
        
        <Link to="/dashboard" className={styles.backButton}>
          <FaArrowLeft className={styles.backIcon} />
          Back to Dashboard
        </Link>
      </div>

      <div className={styles.content}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              {formData.avatar ? (
                <img src={formData.avatar} alt={user.name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <FaUser className={styles.avatarIcon} />
                </div>
              )}
              
              {isEditing && (
                <label className={styles.avatarUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className={styles.avatarInput}
                  />
                  <FaCamera className={styles.avatarCameraIcon} />
                  <span>Change Photo</span>
                </label>
              )}
            </div>
            
            <div className={styles.userInfo}>
              <h2 className={styles.userName}>{user.name}</h2>
              <div className={styles.userRole}>
                <span className={`${styles.roleBadge} ${user.role === 'owner' ? styles.roleOwner : styles.roleStudent}`}>
                  {user.role}
                </span>
              </div>
              <div className={styles.memberSince}>
                <FaCalendar className={styles.calendarIcon} />
                <span>Member since {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className={styles.menu}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`${styles.menuButton} ${isEditing ? styles.menuButtonActive : ''}`}
            >
              <FaEdit className={styles.menuIcon} />
              <span>Edit Profile</span>
            </button>
            
            <Link to="/change-password" className={styles.menuButton}>
              <FaKey className={styles.menuIcon} />
              <span>Change Password</span>
            </Link>

            {user.role === 'owner' && (
              <Link to="/my-hostels" className={styles.menuButton}>
                <FaHome className={styles.menuIcon} />
                <span>My Hostels</span>
              </Link>
            )}

            {user.role === 'student' && (
              <Link to="/bookings" className={styles.menuButton}>
                <FaBook className={styles.menuIcon} />
                <span>My Bookings</span>
              </Link>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.main}>
          {success && (
            <div className={styles.successMessage}>
              <FaCheckCircle className={styles.successIcon} />
              <span>{success}</span>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Personal Information</h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    <FaUser className={styles.labelIcon} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    <FaEnvelope className={styles.labelIcon} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    className={`${styles.input} ${styles.inputDisabled}`}
                    disabled
                  />
                  <p className={styles.helpText}>
                    Email cannot be changed. Contact support for assistance.
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    <FaPhone className={styles.labelIcon} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="address" className={styles.label}>
                    <FaMapMarkerAlt className={styles.labelIcon} />
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    rows="3"
                    placeholder="Enter your current address"
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className={styles.saveButton}
                >
                  {loading || uploading ? (
                    <>
                      <FaSpinner className={styles.spinner} />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.details}>
              <div className={styles.detailsSection}>
                <h3 className={styles.sectionTitle}>Contact Information</h3>
                
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>
                      <FaUser />
                    </div>
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Full Name</span>
                      <span className={styles.detailValue}>{user.name}</span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>
                      <FaEnvelope />
                    </div>
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Email Address</span>
                      <span className={styles.detailValue}>{user.email}</span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>
                      <FaPhone />
                    </div>
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Phone Number</span>
                      <span className={styles.detailValue}>{user.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>
                      <FaMapMarkerAlt />
                    </div>
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Address</span>
                      <span className={styles.detailValue}>
                        {user.location?.address || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.sectionTitle}>Account Information</h3>
                
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Account Type</span>
                      <span className={`${styles.roleBadge} ${user.role === 'owner' ? styles.roleOwner : styles.roleStudent}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Account Status</span>
                      <span className={styles.statusActive}>
                        Active
                      </span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Member Since</span>
                      <span className={styles.detailValue}>
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {user.role === 'owner' && (
                <div className={styles.detailsSection}>
                  <h3 className={styles.sectionTitle}>Hostel Owner</h3>
                  <div className={styles.ownerInfo}>
                    <p className={styles.infoText}>
                      As a hostel owner, you can manage your hostels, view bookings,
                      and track your earnings through the owner dashboard.
                    </p>
                    <Link to="/my-hostels" className={styles.manageButton}>
                      Manage My Hostels
                    </Link>
                  </div>
                </div>
              )}

              {user.role === 'student' && (
                <div className={styles.detailsSection}>
                  <h3 className={styles.sectionTitle}>Student</h3>
                  <div className={styles.studentInfo}>
                    <p className={styles.infoText}>
                      Browse hostels, make bookings, and communicate with hostel owners
                      directly through our platform.
                    </p>
                    <Link to="/hostels" className={styles.browseButton}>
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