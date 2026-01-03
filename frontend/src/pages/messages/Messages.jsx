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

  // 1. Fetch Conversations on Mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await messagesAPI.getConversations();
        setConversations(response.data.conversations || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // 2. WhatsApp Logic: Update sidebar order when ANY message arrives
  const handleNewMessageGlobal = useCallback((message) => {
    setConversations(prev => {
      const updated = [...prev];
      // Logic: Find if the conversation exists for this message
      const senderId = message.sender?._id || message.sender;
      const recipientId = message.recipient?._id || message.recipient;
      const otherId = senderId === user._id ? recipientId : senderId;

      const index = updated.findIndex(c => c.user._id === otherId);
      
      if (index !== -1) {
        const conversation = { ...updated[index] };
        conversation.lastMessage = message.content;
        conversation.lastMessageTime = message.createdAt;
        
        // Only increment unread if we aren't currently in this chat
        if (userId !== otherId) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        // Move to top of the list
        updated.splice(index, 1);
        updated.unshift(conversation);
      }
      return updated;
    });
  }, [user._id, userId]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.on('new_message', handleNewMessageGlobal);
    return () => socket.off('new_message', handleNewMessageGlobal);
  }, [socket, isConnected, handleNewMessageGlobal]);

  const selectedConversation = conversations.find(c => c.user._id === userId);

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.messagesPage}>
      <div className={styles.messagesContainer}>
        <div className={styles.conversationsSidebar}>
          <div className={styles.search}>
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
            onSelectConversation={(c) => navigate(`/messages/${c.user._id}`)}
            currentUser={user}
          />
        </div>

        <div className={styles.chatMain}>
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUser={user}
              socket={socket}
            />
          ) : (
            <div className={styles.noChatSelected}>
              <h3>Select a chat to start messaging</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;