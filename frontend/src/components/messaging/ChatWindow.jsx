// src/components/messaging/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { messagesAPI } from '../../api';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import { FaUser, FaArrowLeft, FaPhone, FaEnvelope } from 'react-icons/fa';

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
    <div className="hostelhub-chat-window">
      <div className="hostelhub-chat-header">
        <div className="hostelhub-chat-user-info">
          <div className="hostelhub-chat-avatar">
            {conversation.user.avatar ? (
              <img src={conversation.user.avatar} alt={conversation.user.name} />
            ) : (
              <div className="hostelhub-avatar-placeholder">
                <FaUser />
              </div>
            )}
          </div>
          <div className="hostelhub-chat-user-details">
            <h3 className="hostelhub-chat-user-name">{conversation.user.name}</h3>
            <span className="hostelhub-chat-user-role">{conversation.user.role}</span>
            <div className="hostelhub-chat-user-contact">
              {conversation.user.phone && (
                <span className="hostelhub-contact-item">
                  <FaPhone /> {conversation.user.phone}
                </span>
              )}
              <span className="hostelhub-contact-item">
                <FaEnvelope /> {conversation.user.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hostelhub-messages-container">
        {loading ? (
          <div className="hostelhub-loading-messages">
            <div className="hostelhub-loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="hostelhub-no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="hostelhub-messages-list">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="hostelhub-date-group">
                <div className="hostelhub-date-separator">
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