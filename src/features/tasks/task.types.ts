export type Weekday = "Su" | "M" | "T" | "W" | "Th" | "F" | "S";

export type TaskKind = "one_time" | "recurring";
export type TaskFormPattern = "one-time" | "recurring";
export type TaskStatus = "pending" | "done";
export type RecurringMode = "today" | "tomorrow" | "custom" | "everyday";

export type TaskEntity = {
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
	notificationId?: string | null;
};

export type Task = TaskEntity;

export type OneTimeData = {
	date: Date;
};

export type RecurringData = {
	type: RecurringMode;
	days: Weekday[];
	time: Date;
};

export type TaskFormData = {
	title: string;
	description: string;
	pattern: TaskFormPattern;
	status: boolean;
	oneTime: OneTimeData;
	recurring: RecurringData;
	createdAt: Date;
	updatedAt: Date;
};

export type StoredTaskFormData = TaskFormData & {
	id: string;
};

export type TaskDraft = {
	title: string;
	description: string;
	pattern: TaskFormPattern;
	date: string;
	time: string;
	recurringMode: RecurringMode;
	recurringDays: Weekday[];
};
