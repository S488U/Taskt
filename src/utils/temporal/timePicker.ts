import { Temporal } from "@js-temporal/polyfill";

export const getCurrentTimeSegments = () => {
	const now = Temporal.Now.plainTimeISO();
	let hour = now.hour;
	const minute = now.minute;
	const meridian = hour >= 12 ? "PM" : "AM";

	hour = hour % 12;
	if (hour === 0) hour = 12;

	return { hour, minute, meridian };
};

export const getCurrentTime = (): string => {
	const now = Temporal.Now.plainTimeISO();

	const hour12 = now.hour % 12 || 12;
	const hour = hour12.toString().padStart(2, "0");
	const minute = now.minute.toString().padStart(2, "0");
	const meridian = now.hour >= 12 ? "PM" : "AM";

	return `${hour}:${minute} ${meridian}`;
};
