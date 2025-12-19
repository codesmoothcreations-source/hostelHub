import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, children, title }) => {
  // Close on Escape key press
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when open
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Close when clicking the dark background (overlay)
  const handleOverlayClick = (e) => {
    if (e.target.className === styles.overlay) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modalCard}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.titleUnderline}></div>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;