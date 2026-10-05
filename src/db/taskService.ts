import { eq, desc } from "drizzle-orm";
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
		return await db
			.update(taskTable)
			.set({
				status,
				updatedAt: new Date().toISOString(),
				completedAt: status === "done" ? new Date().toISOString() : null,
			})
			.where(eq(taskTable.id, id));
	},

	deleteTask: async (id: string) => {
		return await db.delete(taskTable).where(eq(taskTable.id, id));
	},
};
