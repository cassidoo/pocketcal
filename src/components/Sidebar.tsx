import React, { useState, useEffect } from "react";
import { useStore, EventGroup, getMaxGroups } from "../store";
import { format } from "date-fns";
import CalIcon from "./icons/CalIcon";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";
import XIcon from "./icons/XIcon";
import SaveIcon from "./icons/SaveIcon";
import PlusIcon from "./icons/PlusIcon";
import SettingsIcon from "./icons/SettingsIcon";
import HelpIcon from "./icons/HelpIcon";
import CopyIcon from "./icons/CopyIcon";

import "./Sidebar.css";

function Sidebar({
	setShowLicenseModal,
}: {
	setShowLicenseModal: (show: boolean) => void;
}) {
	const {
		startDate,
		includeWeekends,
		showToday,
		weekStartMonday,
		eventGroups,
		selectedGroupId,
		setStartDate,
		setIncludeWeekends,
		setShowToday,
		setWeekStartMonday,
		setShowHelpModal,
		addEventGroup,
		updateEventGroup,
		deleteEventGroup,
		selectEventGroup,
		isProUser,
	} = useStore();
	const maxGroups = getMaxGroups(isProUser);
	const [newEventName, setNewEventName] = useState("");
	const [editingGroup, setEditingGroup] = useState<EventGroup | null>(null);
	const [settingsOpen, setSettingsOpen] = useState(true);

	// Add effect to select the first group if none is selected
	useEffect(() => {
		if (!selectedGroupId && eventGroups.length > 0) {
			selectEventGroup(eventGroups[0].id);
		}
	}, [selectedGroupId, eventGroups, selectEventGroup]);

	const handleAddGroup = () => {
		if (eventGroups.length < maxGroups) {
			const newGroup = addEventGroup("New Group");
			selectEventGroup(newGroup.id);
		}
	};

	const handleUpdateGroup = () => {
		if (editingGroup && newEventName.trim()) {
			updateEventGroup(editingGroup.id, newEventName.trim());
			setEditingGroup(null);
			setNewEventName("");
		}
	};

	const handleEditClick = (group: EventGroup) => {
		setEditingGroup(group);
		setNewEventName(group.name);
		selectEventGroup(group.id);
	};

	const handleCancelEdit = () => {
		setEditingGroup(null);
		setNewEventName("");
	};

	const handleKeyDown = (e: React.KeyboardEvent, group: EventGroup) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (editingGroup?.id !== group.id) {
				selectEventGroup(group.id);
			}
		}
	};

	const handleCopyUrl = () => {
		navigator.clipboard.writeText(window.location.href);
	};

	const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const [year, month] = e.target.value.split("-").map(Number);
			if (year && month) {
				const newDate = new Date(year, month - 1, 1);
				setStartDate(newDate);
			}
		} catch (error) {
			console.error("Invalid date format", error);
		}
	};

	const footerGroups = () => {
		let proButton = (
			<div className="sidebar-footer-buttons">
				<button
					className="footer-button"
					onClick={() => setShowLicenseModal(true)}
					aria-label="Show license modal"
				>
					{isProUser ? "Thanks for going Pro!" : "Go Pro"}
				</button>
			</div>
		);
		let helpAndCopyButtons = (
			<div className="sidebar-footer-buttons">
				<button
					className="footer-button"
					onClick={() => setShowHelpModal(true)}
					aria-label="Show instructions"
				>
					<HelpIcon color="#000" /> Help
				</button>
				<button
					className="footer-button"
					onClick={handleCopyUrl}
					aria-label="Copy URL to clipboard"
				>
					<CopyIcon color="#000" /> Copy URL
				</button>
			</div>
		);

		return isProUser
			? [helpAndCopyButtons, proButton]
			: [proButton, helpAndCopyButtons];
	};

	return (
		<div className="sidebar">
			<h1 className="logo">
				Pocket<span className="logo-cal">Cal</span>{" "}
				{isProUser && <span className="pro-badge">Pro</span>}
			</h1>

			<h3>
				<CalIcon height={20} />
				Event Groups ({eventGroups.length}/{maxGroups})
			</h3>
			<div className="event-groups-list" role="list">
				{eventGroups.map((group) => (
					<div
						key={group.id}
						className={`event-group-item ${
							selectedGroupId === group.id ? "selected" : ""
						} ${editingGroup?.id === group.id ? "editing" : ""}`}
						onClick={() =>
							editingGroup?.id !== group.id && selectEventGroup(group.id)
						}
						onKeyDown={(e) => handleKeyDown(e, group)}
						tabIndex={editingGroup?.id !== group.id ? 0 : -1}
						role="listitem"
						aria-selected={selectedGroupId === group.id}
						aria-label={`Event group: ${group.name}`}
					>
						<span
							className="color-indicator"
							style={{ backgroundColor: group.color }}
						></span>
						{editingGroup?.id === group.id ? (
							<>
								<input
									type="text"
									value={newEventName}
									onChange={(e) => setNewEventName(e.target.value)}
									onClick={(e) => e.stopPropagation()}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleUpdateGroup();
										} else if (e.key === "Escape") {
											handleCancelEdit();
										}
									}}
									autoFocus
									className="group-name-input"
									aria-label="Edit group name"
								/>
								<div className="group-actions">
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleUpdateGroup();
										}}
										className="save-button"
										aria-label="Save group name"
									>
										<SaveIcon color="#000" />
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleCancelEdit();
										}}
										className="cancel-button"
										aria-label="Cancel editing"
									>
										<XIcon color="#000" />
									</button>
								</div>
							</>
						) : (
							<>
								<span className="group-name">{group.name}</span>
								<div className="group-actions">
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleEditClick(group);
										}}
										disabled={!!editingGroup}
										className="edit-button"
										aria-label={`Edit ${group.name}`}
									>
										<PencilIcon color="#000" />
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											deleteEventGroup(group.id);
										}}
										disabled={!!editingGroup}
										className="delete-button"
										aria-label={`Delete ${group.name}`}
									>
										<TrashIcon color="#000" />
									</button>
								</div>
							</>
						)}
					</div>
				))}
			</div>

			{eventGroups.length < maxGroups && (
				<button
					className="add-group-button"
					onClick={handleAddGroup}
					disabled={!!editingGroup}
				>
					<PlusIcon height={18} /> Add new group
				</button>
			)}

			<h3 className="settings-header" style={{ display: "flex", alignItems: "center" }}>
				<span>
					<SettingsIcon height={20} /> Settings
				</span>
				<button
					className="settings-toggle-button"
					onClick={() => setSettingsOpen((v) => !v)}
					aria-expanded={settingsOpen}
					aria-controls="settings-content"
                    aria-label={settingsOpen ? "Hide settings" : "Show settings"}
				>
					{settingsOpen ? "▲" : "▼"}
				</button>
			</h3>
			<div id="settings-content" hidden={!settingsOpen}>
				<div className="setting-item">
					<label htmlFor="start-date">Start Month:</label>
					<input
						type="month"
						id="start-date"
						value={format(startDate, "yyyy-MM")}
						onChange={handleStartDateChange}
					/>
				</div>
				<div className="setting-item">
					<label htmlFor="include-weekends">Include Weekends:</label>
					<input
						type="checkbox"
						id="include-weekends"
						checked={includeWeekends}
						onChange={(e) => setIncludeWeekends(e.target.checked)}
					/>
				</div>
				<div className="setting-item">
					<label htmlFor="show-today">Highlight Today:</label>
					<input
						type="checkbox"
						id="show-today"
						checked={showToday}
						onChange={(e) => setShowToday(e.target.checked)}
					/>
				</div>
				<div className="setting-item">
					<label htmlFor="week-monday">Week starts on Monday:</label>
					<input
						type="checkbox"
						id="week-monday"
						checked={weekStartMonday}
						onChange={(e) => setWeekStartMonday(e.target.checked)}
						title="UI-only setting for now"
					/>
				</div>
			</div>

			<div className="sidebar-footer">{footerGroups()}</div>
		</div>
	);
}

export default Sidebar;
