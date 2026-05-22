import React, { useState } from "react";
import XIcon from "./icons/XIcon";
import CopyIcon from "./icons/CopyIcon";
import DownloadIcon from "./icons/DownloadIcon";
import { useStore } from "../store";
import { downloadICS } from "../ics";
import "./Modal.css";

interface EmbedModalProps {
	onClose: () => void;
}

const EmbedModal: React.FC<EmbedModalProps> = ({ onClose }) => {
	const generateShareableUrl = useStore((state) => state.generateShareableUrl);
	const eventGroups = useStore((state) => state.eventGroups);
	const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
	const [shareButtonFormat, setShareButtonFormat] = useState<"markdown" | "html">("markdown");

	const shareableUrl = generateShareableUrl();
	const shareButtonUrl = `${window.location.origin}/share-button.svg`;
	const embedUrl = shareableUrl.includes("?")
		? `${shareableUrl}&embed=true`
		: `${shareableUrl.split("#")[0]}?embed=true#${shareableUrl.split("#")[1] || ""}`;

	const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" style="border: none; border-radius: 8px;" title="PocketCal Calendar"></iframe>`;
	const markdownButtonCode = `[![Open in PocketCal](${shareButtonUrl})](${shareableUrl})`;
	const htmlButtonCode = `<a href="${shareableUrl}"><img src="${shareButtonUrl}" alt="Open in PocketCal" /></a>`;
	const shareButtonCode =
		shareButtonFormat === "markdown" ? markdownButtonCode : htmlButtonCode;
	const shareButtonSnippetName = `${shareButtonFormat}-button`;
	const shareButtonCopyText =
		shareButtonFormat === "markdown" ? "Copy Markdown" : "Copy HTML";

	const handleCopy = (snippetName: string, text: string) => {
		navigator.clipboard.writeText(text);
		setCopiedSnippet(snippetName);
		setTimeout(() => setCopiedSnippet(null), 2000);
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<button
					className="modal-close"
					onClick={onClose}
					aria-label="Close share modal"
				>
					<XIcon color="var(--icon-color)" />
				</button>
				<h2>Share calendar</h2>
				<section className="share-section">
					<h3>Export .ics</h3>
					<div className="share-row">
						<p>Download this calendar as an .ics file.</p>
						<button onClick={() => downloadICS(eventGroups)} className="btn icon-btn">
							<DownloadIcon width={16} height={16} color="white" />
							Export .ics
						</button>
					</div>
				</section>
				<section className="share-section">
					<h3>Embed calendar as HTML</h3>
					<p>
						Copy the code below to embed a read-only version of your calendar on
						any website.
					</p>
					<pre className="copy-text-embed">
						{embedCode}
					</pre>
					<div className="share-actions">
						<button onClick={() => handleCopy("embed", embedCode)} className="btn icon-btn">
							<CopyIcon width={16} height={16} color="white" />
							{copiedSnippet === "embed" ? "Copied!" : "Copy Embed Code"}
						</button>
					</div>
				</section>
				<section className="share-section">
					<h3>Share button</h3>
					<p>
						Copy a Markdown or HTML button that links to this calendar.
					</p>
					<div className="share-tabs" role="tablist" aria-label="Share button format">
						<button
							type="button"
							role="tab"
							aria-selected={shareButtonFormat === "markdown"}
							className={shareButtonFormat === "markdown" ? "active" : ""}
							onClick={() => setShareButtonFormat("markdown")}
						>
							Markdown
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={shareButtonFormat === "html"}
							className={shareButtonFormat === "html" ? "active" : ""}
							onClick={() => setShareButtonFormat("html")}
						>
							HTML
						</button>
					</div>
					<pre className="copy-text-embed">
						{shareButtonCode}
					</pre>
					<div className="share-actions">
						<button onClick={() => handleCopy(shareButtonSnippetName, shareButtonCode)} className="btn icon-btn">
							<CopyIcon width={16} height={16} color="white" />
							{copiedSnippet === shareButtonSnippetName ? "Copied!" : shareButtonCopyText}
						</button>
					</div>
				</section>
			</div>
		</div>
	);
};

export default EmbedModal;
