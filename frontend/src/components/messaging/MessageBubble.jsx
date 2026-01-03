// src/components/messaging/MessageBubble.jsx
import React from 'react';
import { format } from 'date-fns';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import styles from './MessageBubble.module.css';

const MessageBubble = ({ message, isOwnMessage }) => {
  const time = format(new Date(message.createdAt), 'h:mm a');
  
  return (
    <div className={`${styles.messageContainer} ${isOwnMessage ? styles.messageRight : styles.messageLeft}`}>
      {!isOwnMessage && (
        <div className={styles.messageAvatar}>
          {message.user?.avatar ? (
            <img 
              src={message.user.avatar} 
              alt={message.user.name} 
              className={styles.avatarImage} 
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {message.user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      <div className={styles.messageWrapper}>
        {!isOwnMessage && (
          <div className={styles.messageSender}>
            {message.user?.name}
          </div>
        )}
        
        <div className={`${styles.messageBubble} ${isOwnMessage ? styles.ownBubble : styles.otherBubble}`}>
          <div className={styles.messageText}>
            {message.content}
          </div>
          
          <div className={styles.messageMeta}>
            <span className={styles.messageTime}>{time}</span>
            {isOwnMessage && (
              <span className={styles.messageStatus}>
                {message.read ? (
                  <FaCheckDouble className={`${styles.statusIcon} ${styles.statusRead}`} />
                ) : (
                  <FaCheck className={`${styles.statusIcon} ${styles.statusSent}`} />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {isOwnMessage && (
        <div className={styles.messageAvatar}>
          {message.user?.avatar ? (
            <img 
              src={message.user.avatar} 
              alt={message.user.name} 
              className={styles.avatarImage} 
            />
          ) : (
            <div className={`${styles.avatarPlaceholder} ${styles.ownAvatar}`}>
              {message.user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;