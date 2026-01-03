// src/components/messaging/MessageInput.jsx
import React, { useState, useRef } from 'react';
import { FaPaperPlane, FaSmile, FaImage, FaMicrophone } from 'react-icons/fa';
import styles from './MessageInput.module.css';

const MessageInput = ({ onSendMessage, sending, onTyping }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !sending) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else {
      onTyping();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    adjustHeight();
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleEmojiClick = () => {
    // Emoji picker implementation can be added here
    console.log('Emoji picker');
  };

  const handleImageUpload = () => {
    // Image upload implementation can be added here
    console.log('Image upload');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.messageInput}>
      <div className={styles.inputContainer}>
        <button type="button" className={styles.actionButton} onClick={handleEmojiClick}>
          <FaSmile className={styles.actionIcon} />
        </button>
        
        <button type="button" className={styles.actionButton} onClick={handleImageUpload}>
          <FaImage className={styles.actionIcon} />
        </button>
        
        <div className={styles.textareaWrapper}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message"
            className={styles.messageTextarea}
            rows="1"
            disabled={sending}
          />
        </div>
        
        {message.trim() ? (
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className={styles.sendButton}
          >
            {sending ? (
              <div className={styles.sendingSpinner}></div>
            ) : (
              <FaPaperPlane className={styles.sendIcon} />
            )}
          </button>
        ) : (
          <button type="button" className={styles.voiceButton}>
            <FaMicrophone className={styles.voiceIcon} />
          </button>
        )}
      </div>
    </form>
  );
};

export default MessageInput;