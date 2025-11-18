import React from "react";
import XIcon from "./icons/XIcon";
import "./Modal.css";

interface ConfirmDeleteModalProps {
	title?: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
	title = "Confirm Delete",
	message,
	confirmLabel: confirmDeleteLabel = "Delete",
	cancelLabel: cancelDeleteLabel = "Keep",
	onConfirm,
	onCancel,
}) => {
	const handleOverlayClick = () => {
		onCancel();
	};

	const handleContentClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
		e.stopPropagation();
	};

	return (
		<div className="modal-overlay" onClick={handleOverlayClick}>
			<div className="modal-content" onClick={handleContentClick}>
				<button
					className="modal-close"
					onClick={onCancel}
					aria-label="Close confirm delete modal"
				>
					<XIcon color="#000" />
				</button>
				<h2>{title}</h2>
				<p>{message}</p>
				<div className="license-actions">
					<button onClick={onCancel} className="btn">
						{cancelDeleteLabel}
					</button>
					<button onClick={onConfirm} className="btn">
						{confirmDeleteLabel}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmDeleteModal;
