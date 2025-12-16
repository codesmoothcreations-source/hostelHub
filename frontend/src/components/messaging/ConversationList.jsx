// src/components/messaging/ConversationList.jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaUser, FaCircle } from 'react-icons/fa';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, currentUser }) => {
  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="hostelhub-conversation-list">
      {conversations.map((conversation) => {
        const isSelected = selectedConversation?.user?._id === conversation.user._id;
        const isOnline = conversation.user.isOnline;

        return (
          <div
            key={conversation.user._id}
            onClick={() => onSelectConversation(conversation)}
            className={`hostelhub-conversation-item ${isSelected ? 'hostelhub-conversation-selected' : ''}`}
          >
            <div className="hostelhub-conversation-avatar">
              {conversation.user.avatar ? (
                <img src={conversation.user.avatar} alt={conversation.user.name} />
              ) : (
                <div className="hostelhub-avatar-placeholder">
                  <FaUser />
                </div>
              )}
              {isOnline && (
                <span className="hostelhub-online-indicator">
                  <FaCircle />
                </span>
              )}
            </div>

            <div className="hostelhub-conversation-info">
              <div className="hostelhub-conversation-header">
                <h4 className="hostelhub-conversation-name">
                  {conversation.user.name}
                </h4>
                <span className="hostelhub-conversation-time">
                  {formatTime(conversation.lastMessageTime)}
                </span>
              </div>

              <p className="hostelhub-conversation-preview">
                {conversation.lastMessage}
              </p>
            </div>

            {conversation.unreadCount > 0 && (
              <span className="hostelhub-unread-count">
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