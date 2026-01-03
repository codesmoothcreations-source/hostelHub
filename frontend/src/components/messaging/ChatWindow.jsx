import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatWindow.module.css';
import { format } from 'date-fns'; // Use: npm install date-fns

const ChatWindow = ({ conversation, currentUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef();

  // Auto-scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle incoming socket messages
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      // Logic: Only add if message belongs to THIS conversation and isn't a duplicate
      if (msg.sender === conversation.user._id || msg.sender === currentUser._id) {
        setMessages((prev) => {
            const exists = prev.find(m => m._id === msg._id);
            return exists ? prev : [...prev, msg];
        });
      }
    };

    socket.on('new_message', onMessage);
    return () => socket.off('new_message');
  }, [socket, conversation, currentUser]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      to: conversation.user._id,
      content: newMessage,
      sender: currentUser._id, // Attach sender for immediate UI update
      createdAt: new Date().toISOString(),
      _id: Date.now() // Temporary ID
    };

    socket.emit('send_message', messageData);
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
  };

  return (
    <div className={styles.window}>
      <header className={styles.chatHeader}>
        <img src={conversation.user.avatar || '/default-avatar.png'} alt="User" />
        <div className={styles.headerInfo}>
            <h4>{conversation.user.name}</h4>
            <span>online</span>
        </div>
      </header>

      <div className={styles.messageArea}>
        {messages.map((msg, index) => {
          // KEY LOGIC: Is this message from ME or THEM?
          const isMe = msg.sender === currentUser._id;
          
          return (
            <div 
                key={msg._id || index} 
                className={isMe ? styles.sentWrapper : styles.receivedWrapper}
            >
              <div className={isMe ? styles.sentBubble : styles.receivedBubble}>
                <p>{msg.content}</p>
                <span className={styles.timestamp}>
                    {format(new Date(msg.createdAt), 'HH:mm')}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form className={styles.inputArea} onSubmit={handleSend}>
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message" 
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;