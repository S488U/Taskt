import { db } from "../../db/index";
import { Task } from "./task.types";
import { toDBTask } from "./task.mapper";

export const taskRepository = {
	create(task: Task) {
		const dbTask = toDBTask(task);

		return db.runSync(
			` INSERT INTO tasks(id, title, description, kind, status, due_date, due_time, recurring_mode, recurring_days, created_at, updated_at, completed_at, timezone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `,
			[
				dbTask.id,
				dbTask.title,
				dbTask.description,
				dbTask.kind,
				dbTask.status,
				dbTask.due_date,
				dbTask.due_time,
				dbTask.recurring_mode,
				dbTask.recurring_days,
				dbTask.created_at,
				dbTask.updated_at,
				dbTask.completed_at,
				dbTask.timezone,
			]
		);
	},

	findAll() {
		const rows = db.getAllSync("SELECT * FROM tasks ORDER BY created_at DESC");

		console.log(rows);

		return rows;
	},
};
