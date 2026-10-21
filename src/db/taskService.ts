import { eq, desc } from "drizzle-orm";
import { Temporal } from "@js-temporal/polyfill";
import { db } from "./index";
import { taskTable } from "./schema";
import type { TaskEntity, TaskStatus } from "../features/tasks/task.types";

export const taskService = {
	getAllTask: async (): Promise<TaskEntity[]> => {
		return await db.select().from(taskTable).orderBy(desc(taskTable.createdAt));
	},

	createTask: async (task: TaskEntity) => {
		return await db.insert(taskTable).values(task);
	},

	updateStatus: async (id: string, status: TaskStatus) => {
		const nowStr = Temporal.Now.instant().toString();
		return await db
			.update(taskTable)
			.set({
				status,
				updatedAt: nowStr,
				completedAt: status === "done" ? nowStr : null,
			})
			.where(eq(taskTable.id, id));
	},

	getTaskById: async (id: string): Promise<TaskEntity | undefined> => {
		const results = await db.select().from(taskTable).where(eq(taskTable.id, id));
		return results[0];
	},

	updateNotificationId: async (id: string, notificationId: string | null) => {
		return await db
			.update(taskTable)
			.set({
				notificationId,
				updatedAt: Temporal.Now.instant().toString(),
			})
			.where(eq(taskTable.id, id));
	},

	updateTask: async (id: string, updates: Partial<Omit<TaskEntity, "id" | "createdAt">>) => {
		return await db
			.update(taskTable)
			.set({
				...updates,
				updatedAt: Temporal.Now.instant().toString(),
			})
			.where(eq(taskTable.id, id));
	},

	deleteTask: async (id: string) => {
		return await db.delete(taskTable).where(eq(taskTable.id, id));
	},

	clearAllTasks: async () => {
		return await db.delete(taskTable);
	},
};
