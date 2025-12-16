// src/pages/messages/NewMessage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messagesAPI, usersAPI } from '../../api';
import { FaArrowLeft, FaSearch, FaUser } from 'react-icons/fa';
import "./NewMessage.css"

const NewMessage = () => {
  const { recipientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  
  const [recipient, setRecipient] = useState(null);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (recipientId) {
      fetchRecipient();
    }
  }, [recipientId]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const fetchRecipient = async () => {
    try {
      // This would normally be an API call to get user by ID
      // For now, we'll use a placeholder
      setRecipient({ _id: recipientId, name: 'User', role: 'student' });
    } catch (error) {
      console.error('Error fetching recipient:', error);
    }
  };

  const searchUsers = async () => {
    setLoading(true);
    try {
      // This would normally be an API call to search users
      // For now, we'll use mock data
      const mockUsers = [
        { _id: '1', name: 'John Doe', role: 'student' },
        { _id: '2', name: 'Jane Smith', role: 'owner' },
        { _id: '3', name: 'Hostel Owner', role: 'owner' },
      ];
      setUsers(mockUsers.filter(u => 
        u._id !== user._id && 
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !recipient) return;

    setSending(true);
    try {
      // Send via API
      await messagesAPI.sendMessage({
        to: recipient._id,
        content: message
      });

      // Send via socket if connected
      if (socket && isConnected) {
        socket.emit('send_message', {
          to: recipient._id,
          content: message,
          from: user._id
        });
      }

      // Navigate to conversation
      navigate(`/messages/${recipient._id}`);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSelectUser = (selectedUser) => {
    setRecipient(selectedUser);
    setSearchQuery('');
    setUsers([]);
  };

  return (
    <div className="hostelhub-new-message-page">
      <div className="hostelhub-new-message-header">
        <button
          onClick={() => navigate('/messages')}
          className="hostelhub-back-button"
        >
          <FaArrowLeft className="hostelhub-back-icon" />
          Back to Messages
        </button>
        
        <h1 className="hostelhub-new-message-title">New Message</h1>
      </div>

      <div className="hostelhub-new-message-container">
        <div className="hostelhub-recipient-section">
          <h3 className="hostelhub-section-title">Recipient</h3>
          
          <div className="hostelhub-user-search">
            <div className="hostelhub-search-input-wrapper">
              <FaSearch className="hostelhub-search-icon" />
              <input
                type="text"
                placeholder="Search users by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hostelhub-search-input"
              />
            </div>

            {loading && (
              <div className="hostelhub-search-loading">
                <div className="hostelhub-loading-spinner"></div>
              </div>
            )}

            {users.length > 0 && (
              <div className="hostelhub-search-results">
                {users.map((userResult) => (
                  <div
                    key={userResult._id}
                    onClick={() => handleSelectUser(userResult)}
                    className="hostelhub-user-result"
                  >
                    <div className="hostelhub-user-avatar">
                      <FaUser className="hostelhub-avatar-icon" />
                    </div>
                    <div className="hostelhub-user-info">
                      <h4 className="hostelhub-user-name">{userResult.name}</h4>
                      <span className="hostelhub-user-role">{userResult.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recipient && (
            <div className="hostelhub-selected-recipient">
              <div className="hostelhub-recipient-card">
                <div className="hostelhub-recipient-avatar">
                  <FaUser className="hostelhub-avatar-icon" />
                </div>
                <div className="hostelhub-recipient-info">
                  <h4 className="hostelhub-recipient-name">{recipient.name}</h4>
                  <span className="hostelhub-recipient-role">{recipient.role}</span>
                </div>
                <button
                  onClick={() => setRecipient(null)}
                  className="hostelhub-remove-recipient"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hostelhub-message-section">
          <h3 className="hostelhub-section-title">Message</h3>
          
          <div className="hostelhub-message-editor">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="hostelhub-message-textarea"
              rows="6"
              disabled={!recipient}
            />
            
            <div className="hostelhub-message-actions">
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || !recipient || sending}
                className="hostelhub-send-button"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>

        <div className="hostelhub-tips-section">
          <h3 className="hostelhub-section-title">Tips for Effective Communication</h3>
          <ul className="hostelhub-tips-list">
            <li>Be clear and specific about your inquiry</li>
            <li>Mention the hostel name if relevant</li>
            <li>Include your booking reference if you have one</li>
            <li>Be respectful and polite</li>
            <li>Check your message before sending</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewMessage;