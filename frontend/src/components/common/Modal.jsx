// src/components/common/Modal.jsx
import React from 'react';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="hostelhub-modal-overlay">
      <div className="hostelhub-modal">
        <div className="hostelhub-modal-header">
          <h3 className="hostelhub-modal-title">{title}</h3>
          <button onClick={onClose} className="hostelhub-modal-close">×</button>
        </div>
        <div className="hostelhub-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;