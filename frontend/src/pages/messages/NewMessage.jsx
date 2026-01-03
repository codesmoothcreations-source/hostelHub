// src/pages/messages/NewMessage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messagesAPI, usersAPI } from '../../api';
import { FaArrowLeft, FaSearch, FaUser } from 'react-icons/fa';
import styles from './NewMessage.module.css';

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
  const [recentContacts, setRecentContacts] = useState([]);

  useEffect(() => {
    if (recipientId) {
      fetchRecipient();
    }
    fetchRecentContacts();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const fetchRecipient = async () => {
    try {
      const response = await usersAPI.getUser(recipientId);
      setRecipient(response.data.user);
    } catch (error) {
      console.error('Error fetching recipient:', error);
    }
  };

  const fetchRecentContacts = async () => {
    try {
      const response = await messagesAPI.getConversations({ limit: 5 });
      setRecentContacts(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching recent contacts:', error);
    }
  };

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.searchUsers(searchQuery);
      setUsers(response.data.users.filter(u => u._id !== user._id));
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
      await messagesAPI.sendMessage({
        to: recipient._id,
        content: message
      });

      if (socket && isConnected) {
        socket.emit('send_message', {
          to: recipient._id,
          content: message,
          from: user._id
        });
      }

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
    <div className={styles.newMessagePage}>
      <br />
      <br />
      <div className={styles.header}>
        <button
          onClick={() => navigate('/messages')}
          className={styles.backButton}
        >
          <FaArrowLeft className={styles.backIcon} />
          Back to Messages
        </button>
        
        <h1 className={styles.title}>New Message</h1>
      </div>

      <div className={styles.container}>
        <div className={styles.recipientSection}>
          <h3 className={styles.sectionTitle}>Search or Select Recipient</h3>
          
          <div className={styles.userSearch}>
            <div className={styles.searchInputWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
            </div>

            {loading && (
              <div className={styles.searchLoading}>
                <div className={styles.loadingSpinner}></div>
              </div>
            )}

            {users.length > 0 && (
              <div className={styles.searchResults}>
                {users.map((userResult) => (
                  <div
                    key={userResult._id}
                    onClick={() => handleSelectUser(userResult)}
                    className={styles.userResult}
                  >
                    <div className={styles.userAvatar}>
                      {userResult.avatar ? (
                        <img src={userResult.avatar} alt={userResult.name} />
                      ) : (
                        <FaUser className={styles.avatarIcon} />
                      )}
                    </div>
                    <div className={styles.userInfo}>
                      <h4 className={styles.userName}>{userResult.name}</h4>
                      <span className={styles.userRole}>{userResult.role}</span>
                      <span className={styles.userEmail}>{userResult.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recentContacts.length > 0 && !recipient && (
            <div className={styles.recentContacts}>
              <h4 className={styles.subSectionTitle}>Recent Contacts</h4>
              <div className={styles.contactsGrid}>
                {recentContacts.map((contact) => (
                  <div
                    key={contact.user._id}
                    onClick={() => handleSelectUser(contact.user)}
                    className={styles.contactCard}
                  >
                    <div className={styles.contactAvatar}>
                      {contact.user.avatar ? (
                        <img src={contact.user.avatar} alt={contact.user.name} />
                      ) : (
                        <FaUser className={styles.avatarIcon} />
                      )}
                    </div>
                    <div className={styles.contactInfo}>
                      <h5 className={styles.contactName}>{contact.user.name}</h5>
                      <span className={styles.contactRole}>{contact.user.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recipient && (
            <div className={styles.selectedRecipient}>
              <div className={styles.recipientCard}>
                <div className={styles.recipientAvatar}>
                  {recipient.avatar ? (
                    <img src={recipient.avatar} alt={recipient.name} />
                  ) : (
                    <FaUser className={styles.avatarIcon} />
                  )}
                </div>
                <div className={styles.recipientInfo}>
                  <h4 className={styles.recipientName}>{recipient.name}</h4>
                  <div className={styles.recipientMeta}>
                    <span className={styles.recipientRole}>{recipient.role}</span>
                    {recipient.email && (
                      <span className={styles.recipientEmail}>{recipient.email}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setRecipient(null)}
                  className={styles.removeRecipient}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.messageSection}>
          <h3 className={styles.sectionTitle}>Message</h3>
          
          <div className={styles.messageEditor}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Type your message to ${recipient ? recipient.name : '...'}`}
              className={styles.messageTextarea}
              rows="6"
              disabled={!recipient}
            />
            
            <div className={styles.messageActions}>
              <div className={styles.characterCount}>
                {message.length}/1000
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || !recipient || sending}
                className={styles.sendButton}
              >
                {sending ? (
                  <>
                    <div className={styles.buttonSpinner}></div>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.tipsSection}>
          <h3 className={styles.sectionTitle}>Tips for Effective Communication</h3>
          <ul className={styles.tipsList}>
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