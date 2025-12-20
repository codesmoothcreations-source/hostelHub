// src/components/messaging/MessageBubble.jsx
import React from 'react';
import { format } from 'date-fns';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import styles from './MessageBubble.module.css';

const MessageBubble = ({ message, isOwnMessage }) => {
  const time = format(new Date(message.createdAt), 'HH:mm');
  
  return (
    <div className={`${styles.messageBubble} ${isOwnMessage ? styles.messageOwn : styles.messageOther}`}>
      {/* Avatar - Now visible on both sides */}
      <div className={styles.messageAvatar}>
        {message.user?.avatar ? (
          <img 
            src={message.user.avatar} 
            alt={message.user.name} 
            className={styles.avatarImage} 
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {message.user?.name?.charAt(0)}
          </div>
        )}
      </div>
      
      <div className={styles.messageContent}>
        {/* Name - Only shown for the recipient */}
        {!isOwnMessage && (
          <div className={styles.messageSender}>
            {message.user?.name}
          </div>
        )}
        
        <div className={styles.messageText}>
          {message.content}
        </div>
        
        <div className={styles.messageFooter}>
          <span className={styles.messageTime}>{time}</span>
          {isOwnMessage && (
            <span className={styles.messageStatus}>
              {message.read ? (
                <FaCheckDouble className={styles.statusRead} />
              ) : (
                <FaCheck className={styles.statusSent} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;