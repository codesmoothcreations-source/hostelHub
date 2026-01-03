// src/pages/messages/Messages.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messagesAPI } from '../../api';
import ChatWindow from '../../components/messaging/ChatWindow';
import ConversationList from '../../components/messaging/ConversationList';
import { FaComments, FaSearch, FaUserPlus } from 'react-icons/fa';
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

  // 1. Memoized message handler to prevent logic bugs
  const handleNewMessage = useCallback((message) => {
    setConversations(prev => {
      const updated = [...prev];
      // Check if conversation exists
      const index = updated.findIndex(c => c.user._id === message.sender._id || c.user._id === message.recipient._id);
      
      if (index !== -1) {
        // Update existing conversation
        const conversation = { ...updated[index] };
        conversation.lastMessage = message.content;
        conversation.lastMessageTime = message.createdAt;
        
        // Only increment unread if we aren't currently looking at this chat
        if (!userId || userId !== message.sender._id) {
            conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        updated.splice(index, 1);
        updated.unshift(conversation);
      } else {
        // If it's a brand new person messaging us, we should re-fetch or add them
        fetchConversations();
      }
      return updated;
    });
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle URL changes (when user clicks a chat)
  useEffect(() => {
    if (userId && conversations.length > 0) {
      const found = conversations.find(c => c.user._id === userId);
      if (found) setSelectedConversation(found);
    }
  }, [userId, conversations]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message');
  }, [socket, isConnected, handleNewMessage]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    navigate(`/messages/${conversation.user._id}`);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.messagesPage}>
      <div className={styles.messagesContainer}>
        {/* Sidebar */}
        <div className={styles.conversationsSidebar}>
            <div className={styles.sidebarHeader}>
                <h2>Chats</h2>
                <button onClick={() => navigate('/messages/new')} className={styles.iconBtn}>
                    <FaUserPlus />
                </button>
            </div>
          
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

          <ConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            currentUser={user}
          />
        </div>

        {/* Chat Area */}
        <div className={styles.chatMain}>
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUser={user}
              socket={socket}
            />
          ) : (
            <div className={styles.noChatSelected}>
                <div className={styles.emptyStateCircle}>
                    <FaComments />
                </div>
                <h3>WhatsApp for Web</h3>
                <p>Send and receive messages without keeping your phone online.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;