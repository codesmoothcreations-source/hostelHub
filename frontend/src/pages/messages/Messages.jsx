// src/pages/messages/Messages.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messagesAPI } from '../../api';
import ChatWindow from '../../components/messaging/ChatWindow';
import ConversationList from '../../components/messaging/ConversationList';
import { FaComments, FaSearch, FaUserPlus, FaBars, FaTimes } from 'react-icons/fa';
import styles from './Messages.module.css';

const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);

  // Check screen size for mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 768);
      if (window.innerWidth <= 768 && selectedConversation) {
        setShowConversationList(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [selectedConversation]);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (userId) {
      const conversation = conversations.find(c => c.user._id === userId);
      if (conversation) {
        setSelectedConversation(conversation);
        if (isMobileView) {
          setShowConversationList(false);
        }
      }
    }
  }, [userId, conversations, isMobileView]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('new_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [socket, isConnected]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await messagesAPI.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNewMessage = (message) => {
    setConversations(prev => {
      const updated = [...prev];
      const index = updated.findIndex(c => c.user._id === message.from._id);
      
      if (index !== -1) {
        // Update existing conversation
        updated[index] = {
          ...updated[index],
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: message.read ? updated[index].unreadCount || 0 : (updated[index].unreadCount || 0) + 1
        };
        // Move to top
        const [moved] = updated.splice(index, 1);
        updated.unshift(moved);
      } else {
        // Add new conversation
        updated.unshift({
          user: message.from,
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: message.read ? 0 : 1
        });
      }
      
      return updated;
    });

    // Update unread count if message is not read
    if (!message.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleMessageRead = (data) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.user._id === data.userId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
    setUnreadCount(prev => Math.max(0, prev - data.count));
  };

  const handleUserOnline = (userId) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.user._id === userId 
          ? { ...conv, user: { ...conv.user, isOnline: true } }
          : conv
      )
    );
  };

  const handleUserOffline = (userId) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.user._id === userId 
          ? { ...conv, user: { ...conv.user, isOnline: false } }
          : conv
      )
    );
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    navigate(`/messages/${conversation.user._id}`);
    if (isMobileView) {
      setShowConversationList(false);
    }
  };

  const handleStartNewChat = () => {
    navigate('/messages/new');
  };

  const handleBackToList = () => {
    setShowConversationList(true);
    navigate('/messages');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.messagesPage}>
      <br />
      <br />
      <div className={styles.messagesHeader}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <FaComments className={styles.titleIcon} />
            Messages
          </h1>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </div>
        
        <button
          onClick={handleStartNewChat}
          className={styles.newChatButton}
        >
          <FaUserPlus className={styles.buttonIcon} />
          <span className={styles.buttonText}>New Chat</span>
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {/* Mobile Toggle Button */}
        {isMobileView && !showConversationList && (
          <button 
            className={styles.backToListButton}
            onClick={handleBackToList}
          >
            <FaTimes />
            Back to Chats
          </button>
        )}

        <div className={`${styles.conversationsSidebar} ${!showConversationList ? styles.hidden : ''}`}>
          <div className={styles.search}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className={styles.empty}>
              <FaComments className={styles.emptyIcon} />
              <p>No conversations yet</p>
              <button
                onClick={handleStartNewChat}
                className={styles.startChatButton}
              >
                Start a conversation
              </button>
            </div>
          ) : (
            <ConversationList
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              currentUser={user}
            />
          )}
        </div>

        <div className={`${styles.chatMain} ${showConversationList && isMobileView ? styles.hidden : ''}`}>
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUser={user}
              socket={socket}
              onBackToList={handleBackToList}
            />
          ) : (
            <div className={styles.noChatSelected}>
              <div className={styles.noChatContent}>
                <FaComments className={styles.noChatIcon} />
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to start chatting</p>
                <button
                  onClick={handleStartNewChat}
                  className={styles.startChatButton}
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;