export const DAY_LABELS = ["Su", "M", "T", "W", "Th", "F", "S"];

export const formatDate = (value: Date) =>
	value.toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	});

export const formatTime = (value: Date) =>
	value.toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});

export const toTime24 = (value: Date): string => {
	const hh = String(value.getHours()).padStart(2, "0");
	const mm = String(value.getMinutes()).padStart(2, "0");
	return `${hh}:${mm}`;
};

export const getPresetDays = (mode: string): string[] => {
	if (mode === "everyday") return DAY_LABELS;
	if (mode === "today") return [DAY_LABELS[new Date().getDay()]];
	if (mode === "tomorrow") return [DAY_LABELS[(new Date().getDay() + 1) % 7]];
	return [];
};

interface Schedule {
	days: string[];
	time: string;
}

export const hasFutureOccurrence = (schedule: Schedule, now = new Date()): boolean => {
	if (!schedule?.days?.length || !schedule?.time) return false;

	const [hh, mm] = schedule.time.split(":").map(Number);
	if (Number.isNaN(hh) || Number.isNaN(mm)) return false;

	// Validate against the current cycle (today + next 6 days).
	// This prevents selecting "today" with an already passed time.
	for (let offset = 0; offset <= 6; offset += 1) {
		const candidate = new Date(now);
		candidate.setHours(0, 0, 0, 0);
		candidate.setDate(candidate.getDate() + offset);

		const dayLabel = DAY_LABELS[candidate.getDay()];
		if (!schedule.days.includes(dayLabel)) continue;

		candidate.setHours(hh, mm, 0, 0);
		if (candidate > now) return true;
	}

	return false;
};

export const getTodaysDay = (): string => {
	const todayIndex = new Date().getDay(); // 0–6
	const day = DAY_LABELS[todayIndex];

	return day;
};
