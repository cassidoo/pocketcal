import React, { useState } from "react";
import XIcon from "./icons/XIcon";
import "./Modal.css";

interface NameCalendarModalProps {
  onClose: () => void;
}

const NameCalendarModal: React.FC<NameCalendarModalProps> = ({ onClose }) => {
  const [name, setName] = useState("");

  const handleSave = () => {
    // Stub behavior: just acknowledge and close for now
    window.alert(name ? `Saved calendar name: ${name}` : "No name entered");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-calendar-title"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close name calendar modal">
          <XIcon color="#000" />
        </button>
        <h2 id="name-calendar-title">Name Calendar</h2>
        <p>Choose a friendly name for this calendar (stub feature).</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="calendar-name-input">Calendar name</label>
          <input
            id="calendar-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Team PTO 2025"
            className="license-input"
          />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default NameCalendarModal;
