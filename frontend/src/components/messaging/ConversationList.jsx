// src/components/messaging/ConversationList.jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaUser, FaCircle } from 'react-icons/fa';
import styles from './ConversationList.module.css';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, currentUser }) => {
  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className={styles.conversationList}>
      {conversations.map((conversation) => {
        const isSelected = selectedConversation?.user?._id === conversation.user._id;
        const isOnline = conversation.user.isOnline;

        return (
          <div
            key={conversation.user._id}
            onClick={() => onSelectConversation(conversation)}
            className={`${styles.conversationItem} ${isSelected ? styles.conversationSelected : ''}`}
          >
            <div className={styles.conversationAvatar}>
              {conversation.user.avatar ? (
                <img src={conversation.user.avatar} alt={conversation.user.name} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <FaUser />
                </div>
              )}
              {isOnline && (
                <span className={styles.onlineIndicator}>
                  <FaCircle />
                </span>
              )}
            </div>

            <div className={styles.conversationInfo}>
              <div className={styles.conversationHeader}>
                <h4 className={styles.conversationName}>
                  {conversation.user.name}
                </h4>
                <span className={styles.conversationTime}>
                  {formatTime(conversation.lastMessageTime)}
                </span>
              </div>

              <p className={styles.conversationPreview}>
                {conversation.lastMessage}
              </p>
            </div>

            {conversation.unreadCount > 0 && (
              <span className={styles.unreadCount}>
                {conversation.unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;