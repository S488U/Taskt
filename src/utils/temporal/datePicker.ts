import { Temporal } from "@js-temporal/polyfill";

const CALENDAR_CELLS = 42;

export const getToday = (): Temporal.PlainDate => {
	return Temporal.Now.plainDateISO();
};

export const formatDate = (date: Temporal.PlainDate): string => {
	return date.toLocaleString(undefined, {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
};

export const formatSelectedDate = (date: Temporal.PlainDate): string => {
	return date.toLocaleString(undefined, {
		weekday: "long",
		month: "short",
		day: "numeric",
	});
};

export const getCalendarDates = (displayedMonth: Temporal.PlainYearMonth): Temporal.PlainDate[] => {
	const firstDay = displayedMonth.toPlainDate({
		day: 1,
	});

	/*
	 * Temporal:
	 * Monday = 1
	 * Tuesday = 2
	 * ...
	 * Sunday = 7
	 *
	 * Our calendar:
	 * Sunday = 0
	 * Monday = 1
	 * ...
	 * Saturday = 6
	 */
	const firstWeekday = firstDay.dayOfWeek % 7;

	return Array.from({ length: CALENDAR_CELLS }, (_, index) => {
		const offset = index - firstWeekday;

		return firstDay.add({
			days: offset,
		});
	});
};
