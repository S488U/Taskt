import { Temporal } from "@js-temporal/polyfill";

/**
 * Returns the month name from a 0-based month index (0 = January, 11 = December).
 */
export const getMonthName = (monthNumber: number, format: "short" | "long" = "short"): string => {
	const month = Math.max(1, Math.min(12, monthNumber + 1));
	const date = Temporal.PlainDate.from({ year: 2026, month, day: 1 });
	return date.toLocaleString(undefined, { month: format === "long" ? "long" : "short" });
};

/**
 * Formats a YYYY-MM-DD date string into a user-friendly locale date.
 */
export const parseDate = (date: string): string => {
	try {
		const plainDate = Temporal.PlainDate.from(date.substring(0, 10));
		return plainDate.toLocaleString(undefined, {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	} catch {
		return date;
	}
};

/**
 * Formats an HH:mm or HH:mm:ss string into 12-hour format with AM/PM meridian.
 * Fixes noon (12:00 PM) and midnight (12:00 AM) edge cases.
 */
export const parseTime = (time: string, seconds = false): string => {
	try {
		const plainTime = Temporal.PlainTime.from(time.trim());
		const hour12 = plainTime.hour % 12 || 12;
		const hour = hour12.toString().padStart(2, "0");
		const minute = plainTime.minute.toString().padStart(2, "0");
		const second = plainTime.second.toString().padStart(2, "0");
		const meridian = plainTime.hour >= 12 ? "PM" : "AM";

		if (seconds) {
			return `${hour}:${minute}:${second} ${meridian}`;
		}
		return `${hour}:${minute} ${meridian}`;
	} catch {
		return time;
	}
};

export const parseDateTime = (datetime: string, date = false, time = false) => {
	const parts = datetime.split("T");
	if (date) {
		return { date: parseDate(parts[0]) };
	}
	if (time) {
		return { time: parseTime(parts[1] || parts[0]) };
	}
	return {
		date: parseDate(parts[0]),
		time: parseTime(parts[1] || ""),
	};
};

/**
 * Returns the current date formatted according to the user's local timezone.
 */
export const today = (): string => {
	const now = Temporal.Now.plainDateISO();
	return now.toLocaleString(undefined, {
		weekday: "long",
		day: "numeric",
		month: "short",
	});
};
