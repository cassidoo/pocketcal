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
		eventGroups,
		selectedGroupId,
		setStartDate,
		setIncludeWeekends,
		setShowToday,
		setShowHelpModal,
		addEventGroup,
		updateEventGroup,
		deleteEventGroup,
		selectEventGroup,
		isProUser,
		firstDayOfWeek,
		setFirstDayOfWeek,
	} = useStore();
	const maxGroups = getMaxGroups(isProUser);
	const [newEventName, setNewEventName] = useState("");
	const [editingGroup, setEditingGroup] = useState<EventGroup | null>(null);
	const [rawStartDate, setRawStartDate] = useState<string>(format(startDate, "yyyy-MM"))

	const isValidDate = (rawDate: string): boolean => {
		const [year, month] = rawDate.split("-");
		return year.length === 4 && typeof month !== "undefined" && month.length === 2;
	}

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
		setRawStartDate(e.target.value)
		try {
			if (isValidDate(e.target.value)) {
				const [year, month] = e.target.value.split('-').map(Number)
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

			<>
				<h3>
					<SettingsIcon height={20} /> Settings
				</h3>
				<div className="setting-item">
					<label htmlFor="start-date">Start Month:</label>
					<input
						type="month"
						id="start-date"
						value={isValidDate(rawStartDate) ? format(startDate, "yyyy-MM") : rawStartDate}
						onChange={handleStartDateChange}
					/>
				</div>
				<div className="setting-item">
					<label htmlFor="first-day-of-week">Start the Week on:</label>
					<select
						id="first-day-of-week"
						value={firstDayOfWeek}
						onChange={(e) => setFirstDayOfWeek(Number(e.target.value) as 0 | 1)}
					>
						<option value={0}>Sunday</option>
						<option value={1}>Monday</option>
					</select>
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
			</>

			<div className="sidebar-footer">{footerGroups()}</div>
		</div>
	);
}

export default Sidebar;
