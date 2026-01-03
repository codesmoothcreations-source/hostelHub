import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../../api';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import styles from './ChatWindow.module.css';

const ChatWindow = ({ conversation, currentUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef();

  // 1. Load history when chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await messagesAPI.getMessages(conversation.user._id);
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error('History fetch error:', error);
      }
    };
    fetchMessages();
  }, [conversation.user._id]);

  // 2. Logic: Listen for messages in this specific thread
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // Check if message belongs to this user
      const msgSenderId = msg.sender?._id || msg.sender;
      if (msgSenderId === conversation.user._id || msgSenderId === currentUser._id) {
        setMessages(prev => {
          // Deduplication: Stop double messages
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message');
  }, [socket, conversation.user._id, currentUser._id]);

  // 3. Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSendMessage = async (content) => {
    setSending(true);
    const tempId = Date.now().toString();

    // Optimistic Update (Right Side)
    const optimisticMsg = {
      _id: tempId,
      content,
      sender: currentUser._id,
      user: currentUser, // So bubble shows your avatar
      createdAt: new Date().toISOString(),
      read: false
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const response = await messagesAPI.sendMessage({ to: conversation.user._id, content });
      
      // Emit via socket
      socket.emit('send_message', { to: conversation.user._id, content });

      // Update the optimistic message with the real one from DB
      setMessages(prev => 
        prev.map(m => m._id === tempId ? response.data.message : m)
      );
    } catch (error) {
      setMessages(prev => prev.filter(m => m._id !== tempId));
      console.error('Send Error:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messageFeed}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            // LOGIC: Compare sender ID to currentUser ID
            isOwnMessage={(msg.sender?._id || msg.sender) === currentUser._id}
          />
        ))}
        <div ref={scrollRef} />
      </div>
      <MessageInput onSendMessage={onSendMessage} sending={sending} />
    </div>
  );
};

export default ChatWindow;