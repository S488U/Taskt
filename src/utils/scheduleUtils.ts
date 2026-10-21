import { Temporal } from "@js-temporal/polyfill";
import type { RecurringMode, Weekday } from "../features/tasks/task.types";

export const DAY_LABELS: Weekday[] = ["Su", "M", "T", "W", "Th", "F", "S"];

export const getPresetDays = (mode: RecurringMode): Weekday[] => {
	if (mode === "everyday") return DAY_LABELS;
	const today = Temporal.Now.plainDateISO();
	const todayIndex = today.dayOfWeek % 7; // Su = 0, M = 1 ... S = 6
	if (mode === "today") return [DAY_LABELS[todayIndex]];
	if (mode === "tomorrow") return [DAY_LABELS[(todayIndex + 1) % 7]];
	return [];
};

interface Schedule {
	days: Weekday[];
	time: string;
}

export const hasFutureOccurrence = (schedule: Schedule, now?: Temporal.PlainDateTime): boolean => {
	if (!schedule?.days?.length || !schedule?.time) return false;

	const [hh, mm] = schedule.time.split(":").map(Number);
	if (Number.isNaN(hh) || Number.isNaN(mm)) return false;

	const currentNow = now ?? Temporal.Now.plainDateTimeISO();
	const todayDate = currentNow.toPlainDate();
	const targetTime = Temporal.PlainTime.from({ hour: hh, minute: mm });

	// Validate against the current cycle (today + next 6 days)
	for (let offset = 0; offset <= 6; offset += 1) {
		const candidateDate = todayDate.add({ days: offset });
		const dayLabel = DAY_LABELS[candidateDate.dayOfWeek % 7];
		if (!schedule.days.includes(dayLabel)) continue;

		const candidateDateTime = candidateDate.toPlainDateTime(targetTime);
		if (Temporal.PlainDateTime.compare(candidateDateTime, currentNow) > 0) {
			return true;
		}
	}

	return false;
};

export const getTodaysDay = (): Weekday => {
	const today = Temporal.Now.plainDateISO();
	return DAY_LABELS[today.dayOfWeek % 7];
};
