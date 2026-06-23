import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
	useStore,
	getCalendarDates,
	checkSameDay,
	DateRange,
	EventGroup,
	findRangeForDate,
} from "../store";
import {
	format,
	getMonth,
	getYear,
	getDate,
	getDay,
	isWeekend,
	formatISO,
	isBefore,
	isAfter,
	startOfDay,
	parseISO,
	subDays,
	addDays,
	eachDayOfInterval,
} from "date-fns";
import "./Calendar.css";

const Calendar: React.FC = () => {
	const {
		startDate,
		includeWeekends,
		showToday,
		eventGroups,
		selectedGroupId,
		addDateRange,
		deleteDateRange,
		firstDayOfWeek,
		isEmbedMode,
	} = useStore();

	const calendarDates = useMemo(
		() => getCalendarDates(startDate),
		[startDate]
	);
	const today = useMemo(() => startOfDay(new Date()), []);

	// Precompute which groups cover each date so per-cell rendering (and every
	// drag mousemove re-render) is a cheap Map lookup instead of re-parsing
	// every range for all 365 cells.
	const groupsByDate = useMemo(() => {
		const map = new Map<string, EventGroup[]>();
		eventGroups.forEach((group) => {
			group.ranges.forEach((range) => {
				const start = parseISO(range.start);
				const end = parseISO(range.end);
				if (isAfter(start, end)) return;
				eachDayOfInterval({ start, end }).forEach((day) => {
					const key = formatISO(day, { representation: "date" });
					const existing = map.get(key);
					if (existing) {
						if (!existing.includes(group)) existing.push(group);
					} else {
						map.set(key, [group]);
					}
				});
			});
		});
		return map;
	}, [eventGroups]);

	const [isDragging, setIsDragging] = useState(false);
	const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
	const [dragEndDate, setDragEndDate] = useState<Date | null>(null);
	const [focusedDate, setFocusedDate] = useState<Date | null>(null);
	const [isContainerFocused, setIsContainerFocused] = useState(false);
	// Track input modality so the date focus ring shows for keyboard users only
	// (focus-visible semantics), not as a lingering outline after a mouse click.
	const [usingKeyboard, setUsingKeyboard] = useState(false);
	// Bumps on each user-driven group selection to retrigger the "boost" pulse;
	// stays 0 on initial mount so there's no page-load choreography.
	const [boostKey, setBoostKey] = useState(0);
	const prevSelectedRef = useRef<string | null>(selectedGroupId);
	const calendarGridRef = useRef<HTMLDivElement>(null);

	const selectedGroup = useMemo(
		() => eventGroups.find((group) => group.id === selectedGroupId) ?? null,
		[eventGroups, selectedGroupId]
	);

	useEffect(() => {
		const keyboardKeys = new Set([
			"Tab",
			"ArrowUp",
			"ArrowDown",
			"ArrowLeft",
			"ArrowRight",
			" ",
			"Enter",
			"Home",
			"End",
			"PageUp",
			"PageDown",
		]);
		const onKeyDown = (e: KeyboardEvent) => {
			if (keyboardKeys.has(e.key)) setUsingKeyboard(true);
		};
		const onPointerDown = () => setUsingKeyboard(false);
		window.addEventListener("keydown", onKeyDown, true);
		window.addEventListener("pointerdown", onPointerDown, true);
		return () => {
			window.removeEventListener("keydown", onKeyDown, true);
			window.removeEventListener("pointerdown", onPointerDown, true);
		};
	}, []);

	useEffect(() => {
		if (prevSelectedRef.current !== selectedGroupId) {
			prevSelectedRef.current = selectedGroupId;
			setBoostKey((key) => key + 1);
		}
	}, [selectedGroupId]);

	// Focus management
	useEffect(() => {
		// Only set initial focus when container is focused
		if (isContainerFocused && !focusedDate && calendarDates.length > 0) {
			const todayInCalendar = calendarDates.find((date) =>
				checkSameDay(date, today)
			);
			setFocusedDate(todayInCalendar || calendarDates[0]);
		}
	}, [calendarDates, focusedDate, today, isContainerFocused]);

	const handleContainerFocus = () => {
		setIsContainerFocused(true);
		// Set initial focused date if not already set
		if (!focusedDate && calendarDates.length > 0) {
			const todayInCalendar = calendarDates.find((date) =>
				checkSameDay(date, today)
			);
			setFocusedDate(todayInCalendar || calendarDates[0]);
		}
	};

	const handleContainerBlur = (e: React.FocusEvent<HTMLDivElement>) => {
		if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
		setIsContainerFocused(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!focusedDate || !selectedGroupId) return;

		const filteredDates = includeWeekends
			? calendarDates
			: calendarDates.filter((date) => !isWeekend(date));

		const currentIndex = filteredDates.findIndex((date) =>
			checkSameDay(date, focusedDate)
		);

		let newIndex = currentIndex;
		let preventDefault = true;

		switch (e.key) {
			case "ArrowRight":
				newIndex = Math.min(currentIndex + 1, filteredDates.length - 1);
				break;
			case "ArrowLeft":
				newIndex = Math.max(currentIndex - 1, 0);
				break;
			case "ArrowDown":
				// Move down by a week (or 5 days if weekends are hidden)
				newIndex = Math.min(
					currentIndex + (includeWeekends ? 7 : 5),
					filteredDates.length - 1
				);
				break;
			case "ArrowUp":
				// Move up by a week (or 5 days if weekends are hidden)
				newIndex = Math.max(currentIndex - (includeWeekends ? 7 : 5), 0);
				break;
			case " ":
			case "Enter":
				e.preventDefault();
				handleDateSelection(focusedDate);
				return;
			default:
				preventDefault = false;
		}

		if (preventDefault) {
			e.preventDefault();
		}

		if (newIndex !== currentIndex && filteredDates[newIndex]) {
			const newFocusedDate = filteredDates[newIndex];
			setFocusedDate(newFocusedDate);

			// Scroll into view if needed
			const dayElement = document.querySelector(
				`[data-date="${formatISO(newFocusedDate, { representation: "date" })}"]`
			);
			dayElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
		}
	};

	const handleDateSelection = (date: Date) => {
		if (isEmbedMode || !selectedGroupId) return;

		const selectedGroup = eventGroups.find(
			(group) => group.id === selectedGroupId
		);
		if (!selectedGroup) return;

		// Check if the date is already in a range for this group
		const existingRange = findRangeForDate(date, selectedGroup);
		if (existingRange) {
			deleteDateRange(selectedGroupId, existingRange);

			// Create two new ranges if needed - one before and one after the clicked date
			const startDate = parseISO(existingRange.start);
			const endDate = parseISO(existingRange.end);

			// Only create new ranges if there are dates to include
			if (isBefore(startDate, date)) {
				const beforeRange: DateRange = {
					start: formatISO(startDate, { representation: "date" }),
					end: formatISO(subDays(date, 1), { representation: "date" }),
				};
				addDateRange(selectedGroupId, beforeRange);
			}

			if (isAfter(endDate, date)) {
				const afterRange: DateRange = {
					start: formatISO(addDays(date, 1), { representation: "date" }),
					end: formatISO(endDate, { representation: "date" }),
				};
				addDateRange(selectedGroupId, afterRange);
			}
		} else {
			// Add single date
			const newRange: DateRange = {
				start: formatISO(date, { representation: "date" }),
				end: formatISO(date, { representation: "date" }),
			};
			addDateRange(selectedGroupId, newRange);
		}
	};

	const handleMouseDown = (date: Date) => {
		if (isEmbedMode || !selectedGroupId) return;
		setFocusedDate(date);

		const selectedGroup = eventGroups.find(
			(group) => group.id === selectedGroupId
		);
		if (!selectedGroup) return;

		// Check if the date is already in a range for this group
		const existingRange = findRangeForDate(date, selectedGroup);
		if (existingRange) {
			deleteDateRange(selectedGroupId, existingRange);

			// Create two new ranges if needed - one before and one after the clicked date
			const startDate = parseISO(existingRange.start);
			const endDate = parseISO(existingRange.end);

			// Only create new ranges if there are dates to include
			if (isBefore(startDate, date)) {
				const beforeRange: DateRange = {
					start: formatISO(startDate, { representation: "date" }),
					end: formatISO(subDays(date, 1), { representation: "date" }),
				};
				addDateRange(selectedGroupId, beforeRange);
			}

			if (isAfter(endDate, date)) {
				const afterRange: DateRange = {
					start: formatISO(addDays(date, 1), { representation: "date" }),
					end: formatISO(endDate, { representation: "date" }),
				};
				addDateRange(selectedGroupId, afterRange);
			}
			return;
		}

		setIsDragging(true);
		setDragStartDate(date);
		setDragEndDate(date);
	};

	const handleMouseMove = (date: Date) => {
		if (!isDragging || !dragStartDate) return;
		setDragEndDate(date);
	};

	const handleMouseUp = useCallback(() => {
		if (!isDragging || !dragStartDate || !dragEndDate || !selectedGroupId)
			return;

		setIsDragging(false);

		// Ensure start is before end
		const finalStartDate = isBefore(dragStartDate, dragEndDate)
			? dragStartDate
			: dragEndDate;
		const finalEndDate = isAfter(dragEndDate, dragStartDate)
			? dragEndDate
			: dragStartDate;

		const newRange: DateRange = {
			start: formatISO(finalStartDate, { representation: "date" }),
			end: formatISO(finalEndDate, { representation: "date" }),
		};

		addDateRange(selectedGroupId, newRange);

		setDragStartDate(null);
		setDragEndDate(null);
	}, [isDragging, dragStartDate, dragEndDate, selectedGroupId, addDateRange]);

	useEffect(() => {
		const handleGlobalMouseUp = () => {
			if (isDragging) {
				handleMouseUp();
			}
		};

		window.addEventListener("mouseup", handleGlobalMouseUp);
		return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
	}, [isDragging, handleMouseUp]);

	const getMonthYearKey = (date: Date) => `${getYear(date)}-${getMonth(date)}`;

	// Replace the display of day headers
	const weekdayLabels = firstDayOfWeek === 1
		? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
		: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	const adjustPaddingForWeekdays = (dayOfWeek: number): number => {
		if (firstDayOfWeek === 1) {
			// Monday = 0, ..., Sunday = 6
			const adjusted = (dayOfWeek + 6) % 7;
			if (!includeWeekends) {
				return adjusted < 5 ? adjusted : 0;
			}
			return adjusted;
		} else {
			if (!includeWeekends) {
				if (dayOfWeek === 0) return 0;
				return dayOfWeek - 1;
			}
			return dayOfWeek;
		}
	};

	const groupedDates = useMemo(
		() =>
			calendarDates.reduce((acc, date) => {
				if (!includeWeekends && isWeekend(date)) {
					return acc;
				}
				const key = getMonthYearKey(date);
				if (!acc[key]) {
					acc[key] = [];
				}
				acc[key].push(date);
				return acc;
			}, {} as { [key: string]: Date[] }),
		[calendarDates, includeWeekends]
	);

	const getDayClassName = (date: Date): string => {
		let className = "calendar-day";

		if (showToday && checkSameDay(date, today)) {
			className += " today";
		}

		if (!includeWeekends && isWeekend(date)) {
			className += " weekend-hidden";
		}

		if (
			usingKeyboard &&
			isContainerFocused &&
			focusedDate &&
			checkSameDay(date, focusedDate)
		) {
			className += " focused";
		}

		if (isDragging && dragStartDate && dragEndDate) {
			const currentDragStart = isBefore(dragStartDate, dragEndDate)
				? dragStartDate
				: dragEndDate;
			const currentDragEnd = isAfter(dragEndDate, dragStartDate)
				? dragEndDate
				: dragStartDate;

			if (date >= currentDragStart && date <= currentDragEnd) {
				className += " dragging";
			}
		}

		return className;
	};

	const getRangeStyles = (dateStr: string): React.CSSProperties[] => {
		const groupsWithDate = groupsByDate.get(dateStr);
		if (!groupsWithDate) return [];

		const totalGroups = groupsWithDate.length;
		return groupsWithDate.map((group, index) => ({
			backgroundColor: group.color,
			position: "absolute",
			left: 0,
			right: 0,
			top: `${(index / totalGroups) * 100}%`,
			height: `${100 / totalGroups}%`,
		}));
	};

	return (
		<div
			className="calendar-container"
			ref={calendarGridRef}
			onKeyDown={handleKeyDown}
			onFocus={handleContainerFocus}
			onBlur={handleContainerBlur}
			tabIndex={0}
			role="application"
			aria-label="Calendar grid. Use arrow keys to navigate dates and space or enter to select."
		>
			{Object.entries(groupedDates).map(([monthYearKey, datesInMonth]) => {
				const [year, monthIndex] = monthYearKey.split("-").map(Number);
				const monthDate = new Date(year, monthIndex);
				const firstDayOfMonth = datesInMonth[0];
				const dayOfWeek = getDay(firstDayOfMonth);
				const paddingDays = Array.from({
					length: adjustPaddingForWeekdays(dayOfWeek),
				});

				return (
					<div key={monthYearKey} className="calendar-month">
						<h3 id={`month-${monthYearKey}`}>
							{format(monthDate, "MMMM yyyy")}
						</h3>
						<div
							className={`calendar-grid ${
								!includeWeekends ? "weekends-hidden" : ""
							}`}
							role="grid"
							aria-labelledby={`month-${monthYearKey}`}
						>
							{weekdayLabels
								.filter(
									(_, index) => includeWeekends || (firstDayOfWeek === 1 ? (index < 5) : (index > 0 && index < 6))
								)
								.map((day) => (
									<div key={day} className="weekday-header" role="columnheader">
										{day}
									</div>
								))}

							{paddingDays.map((_, index) => (
								<div
									key={`padding-${index}`}
									className="calendar-day empty"
									role="gridcell"
									aria-hidden="true"
								/>
							))}

							{datesInMonth.map((date) => {
								const dateStr = formatISO(date, { representation: "date" });
								const dayGroups = groupsByDate.get(dateStr);
								const isSelected = dayGroups !== undefined;
								const inSelectedGroup = !!(
									selectedGroupId &&
									dayGroups?.some((group) => group.id === selectedGroupId)
								);
								let dayClassName = getDayClassName(date);
								if (inSelectedGroup) {
									dayClassName += " in-selected-group";
									if (boostKey > 0) {
										dayClassName +=
											boostKey % 2 === 1 ? " boost-b" : " boost-a";
									}
								}
								return (
									<div
										key={dateStr}
										className={dayClassName}
										style={
											inSelectedGroup && selectedGroup
												? ({
														"--sel-color": selectedGroup.color,
												  } as React.CSSProperties)
												: undefined
										}
										onMouseDown={() => handleMouseDown(date)}
										onMouseEnter={() => handleMouseMove(date)}
										data-date={dateStr}
										role="gridcell"
										aria-selected={isSelected}
										aria-label={format(date, "MMMM d, yyyy")}
										tabIndex={
											focusedDate && checkSameDay(date, focusedDate) ? 0 : -1
										}
									>
										<span className="day-number" aria-hidden="true">
											{getDate(date)}
										</span>
										<div className="range-indicators" aria-hidden="true">
											{getRangeStyles(dateStr).map((style, index) => (
												<div
													key={`range-${index}`}
													className="range-indicator"
													style={style}
												/>
											))}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default Calendar;
