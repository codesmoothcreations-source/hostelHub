// src/components/messaging/MessageBubble.jsx
import React from 'react';
import { format } from 'date-fns';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import styles from './MessageBubble.module.css';

const MessageBubble = ({ message, isOwnMessage }) => {
  // Safe date check
  const date = message.createdAt ? new Date(message.createdAt) : new Date();
  const time = format(date, 'HH:mm');
  
  return (
    <div className={`${styles.messageBubble} ${isOwnMessage ? styles.messageOwn : styles.messageOther}`}>
      <div className={styles.messageAvatar}>
        {message.user?.avatar ? (
          <img src={message.user.avatar} alt="" className={styles.avatarImage} />
        ) : (
          <div className={styles.avatarPlaceholder}>{message.user?.name?.charAt(0)}</div>
        )}
      </div>
      
      <div className={styles.messageContent}>
        {!isOwnMessage && <div className={styles.messageSender}>{message.user?.name}</div>}
        <div className={styles.messageText}>{message.content}</div>
        <div className={styles.messageFooter}>
          <span className={styles.messageTime}>{time}</span>
          {isOwnMessage && (
            <span className={styles.messageStatus}>
              {message.read ? <FaCheckDouble className={styles.statusRead} /> : <FaCheck />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;