import React, { useState, useEffect } from "react";
import XIcon from "./icons/XIcon";
import CalIcon from "./icons/CalIcon";
import { useStore, getMaxGroups } from "../store";
import "./Modal.css";

declare global {
	interface Window {
		createLemonSqueezy: () => void;
	}
}

interface LicenseModalProps {
	onClose: () => void;
}

const LicenseModal: React.FC<LicenseModalProps> = ({ onClose }) => {
	const { licenseKey, isProUser, setLicenseKey, validateLicenseKey } =
		useStore();
	const [inputKey, setInputKey] = useState(licenseKey || "");
	const [isValidating, setIsValidating] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		window.createLemonSqueezy();
	}, []);

	const handleValidate = async () => {
		setError("");
		setIsValidating(true);
		const valid = await validateLicenseKey(inputKey);
		if (valid) {
			setLicenseKey(inputKey);
		} else {
			setError("Invalid or inactive license key");
		}
		setIsValidating(false);
	};

	const handleRemoveLicense = () => {
		setLicenseKey(null);
		setInputKey("");
		useStore.setState({ isProUser: false });
	};

	const proDescription = () => {
		if (isProUser) {
			return (
				<p className="pro-description">
					Thank you so much for your support! You can create up to{" "}
					{getMaxGroups(true)} event groups, each with its own color and
					settings.
				</p>
			);
		}

		return (
			<>
				<p className="pro-description">
					Support PocketCal's development with a lifetime <span>Pro</span>{" "}
					license!
				</p>
				<p className="pro-description">
					With a Pro license, you can create up to {getMaxGroups(true)} event
					groups, each with its own color and settings.
				</p>
			</>
		);
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<button
					className="modal-close"
					onClick={onClose}
					aria-label="Close license modal"
				>
					<XIcon color="var(--icon-color)" />
				</button>
				<h2>
					Pocket<span className="logo-cal">Cal</span>{" "}
					<span className="pro-badge">Pro</span>
				</h2>

				<p>{proDescription()}</p>
				{isProUser ? (
					<div className="license-status">
						<p className="license-active">
							<CalIcon color="var(--icon-color)" />
							<strong>Pro license active!</strong>
						</p>

						<pre className="license-key-display">
							{licenseKey ||
								"No license key! If you see this, something is wrong."}
						</pre>

						<button onClick={handleRemoveLicense} className="btn">
							Remove License
						</button>
					</div>
				) : (
					<>
						{error && <p className="error-message">{error}</p>}
						<input
							type="text"
							value={inputKey}
							onChange={(e) => setInputKey(e.target.value)}
							placeholder="Enter your license key"
							className="license-input"
						/>
						<div className="license-actions">
							<a
								href="https://cassidoo.lemonsqueezy.com/buy/741d9abc-39c1-4ec1-9f21-e585bf8e6a13?embed=1&logo=0"
								className="buy-license-link lemonsqueezy-button"
							>
								Don't have a license? Get one here!
							</a>
							<button
								onClick={handleValidate}
								disabled={isValidating || !inputKey}
								className="btn"
							>
								{isValidating ? "Validating..." : "Activate License"}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default LicenseModal;
