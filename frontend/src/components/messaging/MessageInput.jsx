// src/components/messaging/MessageInput.jsx
import React, { useState } from 'react';
import { FaPaperPlane, FaSmile } from 'react-icons/fa';
import styles from './MessageInput.module.css';

const MessageInput = ({ onSendMessage, sending }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !sending) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.messageInput}>
      <div className={styles.inputContainer}>
        <button type="button" className={styles.emojiButton}>
          <FaSmile className={styles.emojiIcon} />
        </button>
        
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className={styles.messageTextarea}
          rows="1"
          disabled={sending}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className={styles.sendButton}
        >
          <FaPaperPlane className={styles.sendIcon} />
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
      
      <div className={styles.inputActions}>
        <p className={styles.inputHint}>
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </form>
  );
};

export default MessageInput;