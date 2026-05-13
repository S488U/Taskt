import { Task } from "./task.types";

export const toDBTask = (task: Task) => {
	return {
		id: task.id,
		title: task.title,
		description: task.description,
		kind: task.kind,
		status: task.status,
		due_date: task.dueDate,
		due_time: task.dueTime,
		recurring_mode: task.recurringMode,
		recurring_days: JSON.stringify(task.recurringDays),
		created_at: task.createdAt,
		updated_at: task.updatedAt,
		completed_at: task.completedAt,
		timezone: task.timezone,
	};
};
