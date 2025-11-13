import { useEffect, useState } from "react";
import "./App.css";
import { useStore } from "./store";
import Sidebar from "./components/Sidebar";
import Calendar from "./components/Calendar";
import ChevronIcon from "./components/icons/ChevronIcon";
import HelpModal from "./components/HelpModal";
import LicenseModal from "./components/LicenseModal";

function App() {
	const [isSidebarHidden, setIsSidebarHidden] = useState(false);
	const [showLicenseModal, setShowLicenseModal] = useState(false);
	const getAppStateFromUrl = useStore((state) => state.getAppStateFromUrl);
	const generateShareableUrl = useStore((state) => state.generateShareableUrl);
	const showHelpModal = useStore((state) => state.showHelpModal);
	const setShowHelpModal = useStore((state) => state.setShowHelpModal);
	const validateLicenseKey = useStore((state) => state.validateLicenseKey);
	const licenseKey = useStore((state) => state.licenseKey);

	// Select individual state pieces needed for the URL
	const startDate = useStore((state) => state.startDate);
	const includeWeekends = useStore((state) => state.includeWeekends);
	const showToday = useStore((state) => state.showToday);
	const eventGroups = useStore((state) => state.eventGroups);
	const firstDayOfWeek = useStore((state) => state.firstDayOfWeek);

	// Load state from URL on initial mount
	useEffect(() => {
		getAppStateFromUrl();

		// Check license validity on load (with cache)
		if (licenseKey) {
			const lastValidated = localStorage.getItem("pocketcal_pro_validated");
			const daysSinceValidation = lastValidated
				? (Date.now() - parseInt(lastValidated)) / (1000 * 60 * 60 * 24)
				: Infinity;
			// Re-validate every 7 days
			if (daysSinceValidation > 7) {
				validateLicenseKey(licenseKey);
			} else {
				useStore.setState({ isProUser: true });
			}
		}
	}, [getAppStateFromUrl, validateLicenseKey, licenseKey]);

	// Update URL whenever relevant state pieces change
	useEffect(() => {
		const newUrl = generateShareableUrl();
		window.history.replaceState(null, "", newUrl);
	}, [
		startDate,
		includeWeekends,
		showToday,
		eventGroups,
		firstDayOfWeek,
		generateShareableUrl,
	]);

	const toggleSidebar = () => {
		const sidebar = document.querySelector(".sidebar");

		if (!isSidebarHidden && sidebar) {
			sidebar.scrollTop = 0;
			sidebar.scrollTo({ top: 0, behavior: "smooth" });

			setTimeout(() => {
				setIsSidebarHidden(true);
			}, 300);
		} else {
			setIsSidebarHidden(false);
		}
	};

	return (
		<div className={`app-container ${isSidebarHidden ? "sidebar-hidden" : ""}`}>
			<button
				className="sidebar-toggle"
				onClick={toggleSidebar}
				aria-label={isSidebarHidden ? "Show sidebar" : "Hide sidebar"}
				aria-expanded={!isSidebarHidden}
			>
				<ChevronIcon color="black" />
			</button>
			<Sidebar setShowLicenseModal={setShowLicenseModal} />
			<Calendar />
			{showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
			{showLicenseModal && (
				<LicenseModal onClose={() => setShowLicenseModal(false)} />
			)}
		</div>
	);
}

export default App;
