// src/pages/hostels/MyHostels.jsx (UPDATED)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hostelsAPI } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { FaEdit, FaTrash, FaEye, FaPlus, FaFilter } from 'react-icons/fa';
import "./MyHostels.css";

const MyHostels = () => {
  const { user } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyHostels();
  }, []);

  const fetchMyHostels = async () => {
    setLoading(true);
    try {
      // NOTE: If your backend has a /hostels/me endpoint, USE IT INSTEAD!
      const response = await hostelsAPI.getHostels(); 

      // --- 🛑 CORE FIX: Safer ID comparison 🛑 ---
      const myHostels = response.data.hostels.filter(hostel => {
        const ownerId = hostel.owner 
          ? (hostel.owner._id || hostel.owner) // Check if owner is object (populated) or string (unpopulated)
          : null; // If hostel.owner is missing completely

        // Ensure both IDs are compared as strings to avoid type mismatch
        return ownerId && ownerId.toString() === user._id.toString();
      });
      
      setHostels(myHostels);
    } catch (error) {
      console.error('Error fetching hostels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHostel = async (hostelId) => {
    // ... (rest of your handleDeleteHostel function remains the same)
    if (!window.confirm('Are you sure you want to delete this hostel?')) {
      return;
    }

    try {
      await hostelsAPI.deleteHostel(hostelId);
      setHostels(hostels.filter(h => h._id !== hostelId));
    } catch (error) {
      console.error('Error deleting hostel:', error);
      alert('Failed to delete hostel');
    }
  };

  const filteredHostels = filter === 'all' 
    ? hostels 
    : hostels.filter(hostel => hostel.status === filter);

  return (
    <div className="hostelhub-my-hostels">
      {/* ... (rest of your JSX structure remains the same) ... */}
      <div className="hostelhub-my-hostels-header">
        <div className="hostelhub-header-content">
          <h1 className="hostelhub-my-hostels-title">My Hostels</h1>
          <p className="hostelhub-my-hostels-subtitle">
            Manage all your hostel listings in one place
          </p>
        </div>
        
        <Link to="/add-hostel" className="hostelhub-add-hostel-button">
          <FaPlus className="hostelhub-button-icon" />
          Add New Hostel
        </Link>
      </div>

      <div className="hostelhub-hostels-filters">
        <div className="hostelhub-filter-buttons">
          <button
            onClick={() => setFilter('all')}
            className={`hostelhub-filter-button ${filter === 'all' ? 'hostelhub-filter-active' : ''}`}
          >
            All ({hostels.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`hostelhub-filter-button ${filter === 'approved' ? 'hostelhub-filter-active' : ''}`}
          >
            Approved ({hostels.filter(h => h.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`hostelhub-filter-button ${filter === 'pending' ? 'hostelhub-filter-active' : ''}`}
          >
            Pending ({hostels.filter(h => h.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`hostelhub-filter-button ${filter === 'rejected' ? 'hostelhub-filter-active' : ''}`}
          >
            Rejected ({hostels.filter(h => h.status === 'rejected').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="hostelhub-loading-state">
          <div className="hostelhub-loading-spinner"></div>
          <p>Loading your hostels...</p>
        </div>
      ) : filteredHostels.length === 0 ? (
        <div className="hostelhub-empty-state">
          <FaFilter className="hostelhub-empty-icon" />
          <h3>No hostels found</h3>
          <p>
            {filter === 'all' 
              ? "You haven't listed any hostels yet."
              : `No ${filter} hostels found.`}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="hostelhub-view-all-button"
            >
              View All Hostels
            </button>
          )}
          <Link to="/add-hostel" className="hostelhub-add-first-hostel">
            Add Your First Hostel
          </Link>
        </div>
      ) : (
  <div>
    <table className="hostelhub-hostels-table">
      <thead className="hostelhub-table-header">
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Location</th>
          <th>Price</th>
          <th>Status</th>
          <th>Rating</th>
          <th>Rooms</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody className="hostelhub-table-body">
        {filteredHostels.map((hostel) => (
          <tr key={hostel._id}>
            <td>
              {hostel.images && hostel.images.length > 0 ? (
                <img src={hostel.images[0]} alt={hostel.name} className="hostelhub-table-image" />
              ) : (
                <div className="hostelhub-no-image">
                  <FaEye />
                </div>
              )}
            </td>
            <td>{hostel.name}</td>
            <td>{hostel.location?.address}</td>
            <td className="hostelhub-table-price">
              {formatCurrency(hostel.price)}/{hostel.rentDuration}
            </td>
            <td>
              <span className={`hostelhub-table-status hostelhub-status-${hostel.status}`}>
                {hostel.status}
              </span>
            </td>
            <td className="hostelhub-table-rating">
              ⭐ {hostel.rating || 'N/A'} ({hostel.numberOfRatings || 0})
            </td>
            <td>{hostel.availableRooms}/{hostel.initialRooms}</td>
            <td>
              <div className="hostelhub-table-actions">
                <Link to={`/hostels/${hostel._id}`} className="hostelhub-table-action-button hostelhub-view-button">
                  <FaEye />
                </Link>
                <Link to={`/edit-hostel/${hostel._id}`} className="hostelhub-table-action-button hostelhub-edit-button">
                  <FaEdit />
                </Link>
                <button onClick={() => handleDeleteHostel(hostel._id)} className="hostelhub-table-action-button hostelhub-delete-button">
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
      )}
   </div>
  );
};

export default MyHostels;