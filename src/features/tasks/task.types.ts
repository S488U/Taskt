export type TaskKind = "one_time" | "recurring";

export type TaskStatus = "pending" | "done";

export type RecurringMode = "today" | "tomorrow" | "custom" | "everyday";

export type Weekday = "Su" | "M" | "T" | "W" | "Th" | "F" | "S";

export type Task = {
	id: string;
	title: string;
	description: string | null;
	kind: TaskKind;
	status: TaskStatus;
	dueDate: string | null;
	dueTime: string | null;
	recurringMode: RecurringMode | null;
	recurringDays: Weekday[];
	createdAt: string;
	updatedAt: string;
	completedAt: string | null;
	timezone: string | null;
};
