// src/components/messaging/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { messagesAPI } from '../../api';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import { FaUser, FaArrowLeft, FaPhone, FaEnvelope } from 'react-icons/fa';
import styles from './ChatWindow.module.css';

const ChatWindow = ({ conversation, currentUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [conversation.user._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.from === conversation.user._id || message.from === currentUser._id) {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, conversation.user._id, currentUser._id]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await messagesAPI.getConversation(conversation.user._id, {
        limit: 50
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim()) return;

    setSending(true);
    try {
      // Send via API
      await messagesAPI.sendMessage({
        to: conversation.user._id,
        content
      });

      // Send via socket
      if (socket) {
        socket.emit('send_message', {
          to: conversation.user._id,
          content,
          from: currentUser._id
        });
      }

      // Add message to local state immediately
      const newMessage = {
        _id: Date.now().toString(),
        from: currentUser._id,
        to: conversation.user._id,
        content,
        read: false,
        createdAt: new Date().toISOString(),
        user: {
          _id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar
        }
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
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

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {conversation.user.avatar ? (
              <img src={conversation.user.avatar} alt={conversation.user.name} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <FaUser />
              </div>
            )}
          </div>
          <div className={styles.userDetails}>
            <h3 className={styles.userName}>{conversation.user.name}</h3>
            <span className={styles.userRole}>{conversation.user.role}</span>
            <div className={styles.userContact}>
              {conversation.user.phone && (
                <span className={styles.contactItem}>
                  <FaPhone /> {conversation.user.phone}
                </span>
              )}
              <span className={styles.contactItem}>
                <FaEnvelope /> {conversation.user.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {loading ? (
          <div className={styles.loadingMessages}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.noMessages}>
            <p>No messages yet. Start the conversation!</p>
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
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageInput onSendMessage={sendMessage} sending={sending} />
    </div>
  );
};

export default ChatWindow;