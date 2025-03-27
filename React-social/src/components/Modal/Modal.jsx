import React from 'react';
import './modal.css';

export default function Modal({ show, onClose, children }) {
  if (!show) return null;

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2 className="modalTitle">Edit Profile Information</h2>
        <button className="closeButton" onClick={onClose}>
          &times;
        </button>
        <div className="modalDescription">
          Update your profile information below
        </div>
        {children}
      </div>
    </div>
  );
}