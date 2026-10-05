import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { TaskKind, TaskStatus, RecurringMode, Weekday } from "../features/tasks/task.types";

export const taskTable = sqliteTable("task_table", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	kind: text("kind").$type<TaskKind>().notNull(),
	status: text("status").$type<TaskStatus>().notNull().default("pending"),
	dueDate: text("due_date"),
	dueTime: text("due_time"),
	recurringMode: text("recurring_mode").$type<RecurringMode>(),
	recurringDays: text("recurring_days", { mode: "json" }).$type<Weekday[]>().notNull().default([]),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
	completedAt: text("completed_at"),
	timezone: text("timezone"),
});
