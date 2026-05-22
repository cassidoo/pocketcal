import { EventGroup } from "./store";
import { parseISO, addDays, format } from "date-fns";

function foldLine(line: string): string {
	const parts: string[] = [];
	let remaining = line;
	while (remaining.length > 75) {
		parts.push(remaining.slice(0, 75));
		remaining = " " + remaining.slice(75);
	}
	parts.push(remaining);
	return parts.join("\r\n");
}

export function generateICS(eventGroups: EventGroup[]): string {
	const now = new Date();
	const timestamp = format(now, "yyyyMMdd'T'HHmmss'Z'");

	const lines: string[] = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//PocketCal//pocketcal.com//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
	];

	for (const group of eventGroups) {
		for (const range of group.ranges) {
			const startDate = parseISO(range.start);
			// ICS DTEND for all-day events is exclusive, so add 1 day
			const endDate = addDays(parseISO(range.end), 1);

			const dtStart = format(startDate, "yyyyMMdd");
			const dtEnd = format(endDate, "yyyyMMdd");

			lines.push("BEGIN:VEVENT");
			lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
			lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
			lines.push(foldLine(`SUMMARY:${group.name}`));
			lines.push(`DTSTAMP:${timestamp}`);
			lines.push(`UID:${dtStart}-${dtEnd}-${group.id}@pocketcal.com`);
			lines.push("END:VEVENT");
		}
	}

	lines.push("END:VCALENDAR");
	return lines.join("\r\n");
}

export function downloadICS(eventGroups: EventGroup[]) {
	const icsContent = generateICS(eventGroups);
	const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "pocketcal.ics";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
