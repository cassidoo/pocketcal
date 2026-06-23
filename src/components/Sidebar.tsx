import React, { useState, useEffect } from "react";
import { useStore, EventGroup, getMaxGroups, Theme } from "../store";
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
import ShareIcon from "./icons/ShareIcon";

import "./Sidebar.css";

function Sidebar({
	setShowLicenseModal,
	setShowEmbedModal,
}: {
	setShowLicenseModal: (show: boolean) => void;
	setShowEmbedModal: (show: boolean) => void;
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
		reorderEventGroups,
		selectEventGroup,
		isProUser,
		firstDayOfWeek,
		setFirstDayOfWeek,
		theme,
		setTheme,
	} = useStore();
	const maxGroups = getMaxGroups(isProUser);
	const [newEventName, setNewEventName] = useState("");
	const [editingGroup, setEditingGroup] = useState<EventGroup | null>(null);
	const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null);
	const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
	const [reorderAnnouncement, setReorderAnnouncement] = useState("");
	const [rawStartDate, setRawStartDate] = useState<string>(format(startDate, "yyyy-MM"))
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

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

	const announceReorder = (group: EventGroup, targetIndex: number) => {
		setReorderAnnouncement(
			`${group.name} moved to position ${targetIndex + 1} of ${eventGroups.length}.`
		);
	};

	const handleDragStart = (
		e: React.DragEvent<HTMLButtonElement>,
		group: EventGroup
	) => {
		if (editingGroup) {
			e.preventDefault();
			return;
		}

		e.stopPropagation();
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", group.id);

		const item = e.currentTarget.closest<HTMLElement>(".event-group-item");
		if (item) {
			const rect = item.getBoundingClientRect();
			e.dataTransfer.setDragImage(
				item,
				e.clientX - rect.left,
				e.clientY - rect.top
			);
		}

		setDraggedGroupId(group.id);
	};

	const handleDragOver = (
		e: React.DragEvent<HTMLDivElement>,
		group: EventGroup
	) => {
		if (!draggedGroupId || draggedGroupId === group.id || editingGroup) {
			return;
		}

		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setDragOverGroupId(group.id);
	};

	const handleDrop = (
		e: React.DragEvent<HTMLDivElement>,
		targetGroup: EventGroup
	) => {
		e.preventDefault();
		const droppedGroupId =
			e.dataTransfer.getData("text/plain") || draggedGroupId;
		const droppedGroup = eventGroups.find((group) => group.id === droppedGroupId);

		if (droppedGroup && droppedGroup.id !== targetGroup.id) {
			const targetIndex = eventGroups.findIndex(
				(group) => group.id === targetGroup.id
			);
			reorderEventGroups(droppedGroup.id, targetGroup.id);
			announceReorder(droppedGroup, targetIndex);
		}

		setDraggedGroupId(null);
		setDragOverGroupId(null);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
			return;
		}

		setDragOverGroupId(null);
	};

	const handleDragEnd = () => {
		setDraggedGroupId(null);
		setDragOverGroupId(null);
	};

	const handleReorderKeyDown = (
		e: React.KeyboardEvent<HTMLButtonElement>,
		group: EventGroup
	) => {
		e.stopPropagation();

		if (editingGroup || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) {
			return;
		}

		const currentIndex = eventGroups.findIndex(
			(eventGroup) => eventGroup.id === group.id
		);
		const targetIndex =
			e.key === "ArrowUp" ? currentIndex - 1 : currentIndex + 1;

		if (targetIndex < 0 || targetIndex >= eventGroups.length) {
			e.preventDefault();
			return;
		}

		e.preventDefault();
		reorderEventGroups(group.id, eventGroups[targetIndex].id);
		announceReorder(group, targetIndex);
	};

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopyState("copied");
		} catch {
			setCopyState("error");
		}
		setTimeout(() => setCopyState("idle"), 2000);
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
		const proButton = (
			<div className="sidebar-footer-buttons">
				<button
					className="footer-button pro-button"
					onClick={() => setShowLicenseModal(true)}
					aria-label="Show license modal"
				>
					{isProUser ? "Thanks for going Pro!" : "Go Pro"}
				</button>
			</div>
		);
		const copyAndHelpButtons = (
			<div className="sidebar-footer-buttons">
				<button
					className={`footer-button ${copyState === "copied" ? "copied" : ""}`}
					onClick={handleCopyUrl}
					aria-label="Copy URL to clipboard"
				>
					<CopyIcon color="var(--icon-color)" />{" "}
					{copyState === "copied"
						? "Copied!"
						: copyState === "error"
						? "Press Ctrl+C"
						: "Copy URL"}
				</button>
				<button
					className="footer-button"
					onClick={() => setShowHelpModal(true)}
					aria-label="Show instructions"
				>
					<HelpIcon color="var(--icon-color)" /> Help
				</button>
			</div>
		);
		const shareButton = (
			<div className="sidebar-footer-buttons">
				<button
					className="footer-button"
					onClick={() => setShowEmbedModal(true)}
					aria-label="Share calendar"
				>
					<ShareIcon color="var(--icon-color)" /> Share
				</button>
			</div>
		);

		return isProUser
			? [copyAndHelpButtons, shareButton, proButton]
			: [proButton, copyAndHelpButtons, shareButton];
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
			<div className="sr-only" aria-live="polite">
				{reorderAnnouncement}
			</div>
			<div className="event-groups-list" role="list">
				{eventGroups.map((group) => (
					<div
						key={group.id}
						className={`event-group-item ${
							selectedGroupId === group.id ? "selected" : ""
						} ${editingGroup?.id === group.id ? "editing" : ""} ${
							draggedGroupId === group.id ? "dragging" : ""
						} ${dragOverGroupId === group.id ? "drag-over" : ""}`}
						onClick={() =>
							editingGroup?.id !== group.id && selectEventGroup(group.id)
						}
						onKeyDown={(e) => handleKeyDown(e, group)}
						onDragOver={(e) => handleDragOver(e, group)}
						onDragLeave={handleDragLeave}
						onDrop={(e) => handleDrop(e, group)}
						tabIndex={editingGroup?.id !== group.id ? 0 : -1}
						role="listitem"
						aria-selected={selectedGroupId === group.id}
						aria-label={`Event group: ${group.name}`}
					>
						<button
							type="button"
							className="drag-handle"
							draggable={!editingGroup}
							onClick={(e) => e.stopPropagation()}
							onDragStart={(e) => handleDragStart(e, group)}
							onDragEnd={handleDragEnd}
							onKeyDown={(e) => handleReorderKeyDown(e, group)}
							disabled={!!editingGroup}
							aria-label={`Move ${group.name}. Use up and down arrow keys to reorder.`}
						>
							Drag
						</button>
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
										<SaveIcon color="var(--icon-color)" />
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleCancelEdit();
										}}
										className="cancel-button"
										aria-label="Cancel editing"
									>
										<XIcon color="var(--icon-color)" />
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
										<PencilIcon color="var(--icon-color)" />
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
										<TrashIcon color="var(--icon-color)" />
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
				<div className="setting-item">
					<label htmlFor="theme">Theme:</label>
					<select
						id="theme"
						value={theme}
						onChange={(e) => setTheme(e.target.value as Theme)}
					>
						<option value="system">System</option>
						<option value="light">Light</option>
						<option value="dark">Dark</option>
					</select>
				</div>
			</>

			<div className="sidebar-footer">
				<div className="sr-only" aria-live="polite">
					{copyState === "copied"
						? "Link copied to clipboard."
						: copyState === "error"
						? "Couldn't copy automatically. Press Control or Command + C to copy."
						: ""}
				</div>
				{footerGroups()}
			</div>
		</div>
	);
}

export default Sidebar;
