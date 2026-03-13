import { nanoid } from "nanoid";
import { addDays, parseISO, format } from "date-fns";
import { EventGroup } from "../store";

const formatIcsDate = (isoDate: string): string => {
	return format(parseISO(isoDate), "yyyyMMdd");
};

// Escape special characters per RFC 5545 section 3.3.11
const escapeIcsText = (text: string): string => {
	return text
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "");
};

export const generateIcsContent = (eventGroups: EventGroup[]): string => {
	const lines: string[] = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//PocketCal//PocketCal//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
	];

	for (const group of eventGroups) {
		for (const range of group.ranges) {
			const dtstart = formatIcsDate(range.start);
			// DTEND for all-day events is exclusive (day after last day)
			const dtend = formatIcsDate(
				format(addDays(parseISO(range.end), 1), "yyyy-MM-dd")
			);
			const uid = `${nanoid()}@pocketcal`;

			lines.push("BEGIN:VEVENT");
			lines.push(`UID:${uid}`);
			lines.push(`SUMMARY:${escapeIcsText(group.name)}`);
			lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
			lines.push(`DTEND;VALUE=DATE:${dtend}`);
			lines.push("END:VEVENT");
		}
	}

	lines.push("END:VCALENDAR");
	return lines.join("\r\n");
};

export const downloadIcsFile = (
	content: string,
	filename = "pocketcal.ics"
): void => {
	const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};
