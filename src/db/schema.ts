import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const taskTable = sqliteTable("task_table", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	kind: text("kind").notNull(),
	status: text("status").notNull().default("pending"),
	dueDate: text("due_date"),
	dueTime: text("due_time"),
	recurringMode: text("recurring_mode"),
	recurringDays: text("recurring_days").notNull().default("[]"),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
	completedAt: text("completed_at"),
	timezone: text("timezone"),
});
