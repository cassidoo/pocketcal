import React, { useState } from "react";
import XIcon from "./icons/XIcon";
import CopyIcon from "./icons/CopyIcon";
import { useStore } from "../store";
import "./Modal.css";

interface EmbedModalProps {
	onClose: () => void;
}

const EmbedModal: React.FC<EmbedModalProps> = ({ onClose }) => {
	const generateShareableUrl = useStore((state) => state.generateShareableUrl);
	const [copied, setCopied] = useState(false);

	const shareableUrl = generateShareableUrl();
	const embedUrl = shareableUrl.includes("?")
		? `${shareableUrl}&embed=true`
		: `${shareableUrl.split("#")[0]}?embed=true#${shareableUrl.split("#")[1] || ""}`;

	const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" style="border: none; border-radius: 8px;" title="PocketCal Calendar"></iframe>`;

	const handleCopy = () => {
		navigator.clipboard.writeText(embedCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<button
					className="modal-close"
					onClick={onClose}
					aria-label="Close embed modal"
				>
					<XIcon color="var(--icon-color)" />
				</button>
				<h2>Embed Calendar</h2>
				<p>
					Copy the code below to embed a read-only version of your calendar on
					any website.
				</p>
				<pre className="license-key-display" style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
					{embedCode}
				</pre>
				<button onClick={handleCopy} className="btn" style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
					<CopyIcon width={16} height={16} color="white" />
					{copied ? "Copied!" : "Copy Embed Code"}
				</button>
			</div>
		</div>
	);
};

export default EmbedModal;
