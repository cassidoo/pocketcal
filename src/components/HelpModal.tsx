import React from "react";
import XIcon from "./icons/XIcon";
import { MAX_GROUPS } from "../store";
import "./Modal.css";

interface HelpModalProps {
	onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<button
					className="modal-close"
					onClick={onClose}
					aria-label="Close instructions"
				>
					<XIcon color="var(--icon-color)" />
				</button>
				<h2>
					Pocket<span>Cal</span> Instructions
				</h2>
				<div className="instructions-content">
					<h3>Features</h3>
					<ul>
						<li>
							Create up to {MAX_GROUPS} event groups with different colors (or
							up to 10 with Pro)
						</li>
						<li>Your data is saved locally in the URL</li>
						<li>Share your calendar with others by sharing the URL</li>
					</ul>
					<h3>Navigation</h3>
					<ul>
						<li>
							<strong>Click</strong> on any date to add/edit events
						</li>
						<li>
							<strong>Arrow keys</strong> to move between dates when calendar is
							focused
						</li>
						<li>
							<strong>Enter</strong> or <strong>Space</strong> to toggle the
							selected date
						</li>
					</ul>
					<h3>About</h3>
					<p className="footer">
						PocketCal is built by <a href="https://cassidoo.co/">cassidoo</a>{" "}
						and is open source on{" "}
						<a href="https://github.com/cassidoo/pocketcal">GitHub</a>.
					</p>
				</div>
			</div>
		</div>
	);
};

export default HelpModal;
