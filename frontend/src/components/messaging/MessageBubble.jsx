// src/components/messaging/MessageBubble.jsx
import React from 'react';
import { format } from 'date-fns';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';

const MessageBubble = ({ message, isOwnMessage }) => {
  const time = format(new Date(message.createdAt), 'HH:mm');
  
  return (
    <div className={`hostelhub-message-bubble ${isOwnMessage ? 'hostelhub-message-own' : 'hostelhub-message-other'}`}>
      {!isOwnMessage && (
        <div className="hostelhub-message-avatar">
          {message.user?.avatar ? (
            <img src={message.user.avatar} alt={message.user.name} />
          ) : (
            <div className="hostelhub-avatar-placeholder">
              {message.user?.name?.charAt(0)}
            </div>
          )}
        </div>
      )}
      
      <div className="hostelhub-message-content">
        {!isOwnMessage && (
          <div className="hostelhub-message-sender">
            {message.user?.name}
          </div>
        )}
        
        <div className="hostelhub-message-text">
          {message.content}
        </div>
        
        <div className="hostelhub-message-footer">
          <span className="hostelhub-message-time">{time}</span>
          {isOwnMessage && (
            <span className="hostelhub-message-status">
              {message.read ? (
                <FaCheckDouble className="hostelhub-status-read" />
              ) : (
                <FaCheck className="hostelhub-status-sent" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;