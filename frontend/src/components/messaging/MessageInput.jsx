// src/components/messaging/MessageInput.jsx
import React, { useState } from 'react';
import { FaPaperPlane, FaSmile } from 'react-icons/fa';

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
    <form onSubmit={handleSubmit} className="hostelhub-message-input">
      <div className="hostelhub-input-container">
        <button type="button" className="hostelhub-emoji-button">
          <FaSmile className="hostelhub-emoji-icon" />
        </button>
        
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="hostelhub-message-textarea"
          rows="1"
          disabled={sending}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="hostelhub-send-button"
        >
          <FaPaperPlane className="hostelhub-send-icon" />
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
      
      <div className="hostelhub-input-actions">
        <p className="hostelhub-input-hint">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </form>
  );
};

export default MessageInput;