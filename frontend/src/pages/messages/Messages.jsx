// src/pages/messages/Messages.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messagesAPI } from '../../api';
import ChatWindow from '../../components/messaging/ChatWindow';
import ConversationList from '../../components/messaging/ConversationList';
import { FaComments, FaSearch, FaUserPlus } from 'react-icons/fa';
import "./Messages.css"

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

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (userId) {
      const conversation = conversations.find(c => c.user._id === userId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [userId, conversations]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new messages
    socket.on('new_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
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
    // Update conversations with new message
    setConversations(prev => {
      const updated = [...prev];
      const index = updated.findIndex(c => c.user._id === message.from._id);
      
      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: (updated[index].unreadCount || 0) + 1
        };
        // Move to top
        const [moved] = updated.splice(index, 1);
        updated.unshift(moved);
      }
      
      return updated;
    });

    // Update unread count
    setUnreadCount(prev => prev + 1);
  };

  const handleMessageRead = (data) => {
    // Update unread count for conversation
    setConversations(prev => 
      prev.map(conv => 
        conv.user._id === data.userId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    navigate(`/messages/${conversation.user._id}`);
  };

  const handleStartNewChat = () => {
    navigate('/messages/new');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="hostelhub-messages-page">
      <div className="hostelhub-messages-header">
        <div className="hostelhub-messages-title-section">
          <h1 className="hostelhub-messages-title">
            <FaComments className="hostelhub-title-icon" />
            Messages
          </h1>
          {unreadCount > 0 && (
            <span className="hostelhub-unread-badge">{unreadCount}</span>
          )}
        </div>
        
        <button
          onClick={handleStartNewChat}
          className="hostelhub-new-chat-button"
        >
          <FaUserPlus className="hostelhub-button-icon" />
          New Chat
        </button>
      </div>

      <div className="hostelhub-messages-container">
        <div className="hostelhub-conversations-sidebar">
          <div className="hostelhub-conversations-search">
            <FaSearch className="hostelhub-search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hostelhub-search-input"
            />
          </div>

          {loading ? (
            <div className="hostelhub-loading-conversations">
              <div className="hostelhub-loading-spinner"></div>
              <p>Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="hostelhub-empty-conversations">
              <FaComments className="hostelhub-empty-icon" />
              <p>No conversations yet</p>
              <button
                onClick={handleStartNewChat}
                className="hostelhub-start-chat-button"
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

        <div className="hostelhub-chat-main">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUser={user}
              socket={socket}
            />
          ) : (
            <div className="hostelhub-no-chat-selected">
              <FaComments className="hostelhub-no-chat-icon" />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start chatting</p>
              <button
                onClick={handleStartNewChat}
                className="hostelhub-start-chat-button"
              >
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;