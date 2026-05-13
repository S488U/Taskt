import { db } from "./index";
import { CREATE_TASKS_TABLE, CREATE_TASKS_INDEX } from "./schema";

export const initDB = () => {
	try {
		db.execSync(CREATE_TASKS_TABLE);
		db.execSync(CREATE_TASKS_INDEX);

		console.log("DB created successfully");
	} catch (err) {
		console.error("DB init error: ", err);
	}
};
