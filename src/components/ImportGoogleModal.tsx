import React from "react";
import XIcon from "./icons/XIcon";
import "./Modal.css";

interface ImportGoogleModalProps {
  onClose: () => void;
}

const ImportGoogleModal: React.FC<ImportGoogleModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="import-google-title">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close import modal"
        >
          <XIcon color="#000" />
        </button>
        <h2 id="import-google-title">Import from Google Calendar</h2>
        <p>
          This feature is coming soon. You will be able to select a Google Calendar and import
          its events into a new event group here. The google calender will not be share, <b>ONLY the dates </b>
           will be read, encoded in the calendar's URL. For now, this is just a placeholder.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ImportGoogleModal;
