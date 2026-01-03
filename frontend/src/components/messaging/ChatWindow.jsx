// src/components/messaging/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { messagesAPI } from '../../api';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import { FaUser, FaArrowLeft, FaPhone, FaEnvelope, FaEllipsisV } from 'react-icons/fa';
import styles from './ChatWindow.module.css';

const ChatWindow = ({ conversation, currentUser, socket, onBackToList }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    if (socket) {
      socket.emit('join_room', conversation.user._id);
    }

    return () => {
      if (socket) {
        socket.emit('leave_room', conversation.user._id);
      }
    };
  }, [conversation.user._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.from === conversation.user._id || message.from === currentUser._id) {
        setMessages(prev => [...prev, message]);
        markAsRead(message);
      }
    };

    const handleTyping = (data) => {
      if (data.userId === conversation.user._id) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleStopTyping = (data) => {
      if (data.userId === conversation.user._id) {
        setIsTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, conversation.user._id, currentUser._id]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await messagesAPI.getConversation(conversation.user._id, {
        limit: 100
      });
      setMessages(response.data.messages || []);
      markAllAsRead();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (message) => {
    if (message.from === conversation.user._id && !message.read) {
      try {
        await messagesAPI.markAsRead(message._id);
        if (socket) {
          socket.emit('message_read', {
            messageId: message._id,
            userId: conversation.user._id
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await messagesAPI.markAllAsRead(conversation.user._id);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim()) return;

    setSending(true);
    try {
      // Send via API
      const response = await messagesAPI.sendMessage({
        to: conversation.user._id,
        content
      });

      const newMessage = response.data.message;

      // Send via socket
      if (socket) {
        socket.emit('send_message', {
          to: conversation.user._id,
          content,
          from: currentUser._id,
          messageId: newMessage._id
        });
      }

      // Add message to local state
      setMessages(prev => [...prev, {
        ...newMessage,
        user: {
          _id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar
        }
      }]);

      // Stop typing indicator
      if (typing) {
        socket.emit('stop_typing', { userId: conversation.user._id });
        setTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!typing && socket) {
      socket.emit('typing', { userId: conversation.user._id });
      setTyping(true);
    }
    
    // Reset typing state after 3 seconds
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (typing && socket) {
        socket.emit('stop_typing', { userId: conversation.user._id });
        setTyping(false);
      }
    }, 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const getLastSeen = () => {
    if (conversation.user.isOnline) {
      return 'Online';
    }
    if (conversation.user.lastSeen) {
      return `Last seen ${format(new Date(conversation.user.lastSeen), 'h:mm a')}`;
    }
    return 'Offline';
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          {onBackToList && (
            <button onClick={onBackToList} className={styles.backButton}>
              <FaArrowLeft />
            </button>
          )}
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {conversation.user.avatar ? (
                <img src={conversation.user.avatar} alt={conversation.user.name} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <FaUser />
                </div>
              )}
              {conversation.user.isOnline && (
                <span className={styles.onlineDot}></span>
              )}
            </div>
            <div className={styles.userDetails}>
              <h3 className={styles.userName}>{conversation.user.name}</h3>
              <span className={styles.userStatus}>
                {isTyping ? (
                  <span className={styles.typingIndicator}>
                    <span className={styles.typingDot}></span>
                    <span className={styles.typingDot}></span>
                    <span className={styles.typingDot}></span>
                    typing...
                  </span>
                ) : (
                  getLastSeen()
                )}
              </span>
            </div>
          </div>
        </div>
        <button className={styles.menuButton}>
          <FaEllipsisV />
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {loading ? (
          <div className={styles.loadingMessages}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.noMessages}>
            <div className={styles.welcomeMessage}>
              <p className={styles.welcomeText}>Say hello and start your conversation!</p>
              <p className={styles.welcomeHint}>Messages are end-to-end encrypted</p>
            </div>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className={styles.dateGroup}>
                <div className={styles.dateSeparator}>
                  {format(new Date(date), 'MMMM d, yyyy')}
                </div>
                {dateMessages.map((message) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isOwnMessage={message.from === currentUser._id}
                  />
                ))}
              </div>
            ))}
            {isTyping && (
              <div className={styles.typingBubble}>
                <div className={styles.typingAnimation}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className={styles.scrollAnchor} />
          </div>
        )}
      </div>

      <MessageInput 
        onSendMessage={sendMessage} 
        sending={sending}
        onTyping={handleTyping}
      />
    </div>
  );
};

export default ChatWindow;