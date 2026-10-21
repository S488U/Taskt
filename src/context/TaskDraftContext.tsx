import React, { createContext, useContext, useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import type { TaskDraft, TaskEntity } from "../features/tasks/task.types";

const getInitialDraft = (): TaskDraft => {
	const future = Temporal.Now.plainDateTimeISO().add({ hours: 1 });

	return {
		title: "",
		description: "",
		pattern: "one-time",
		date: future.toPlainDate().toString(),
		time: future.toPlainTime().toString({ smallestUnit: "minute" }),
		recurringMode: "today",
		recurringDays: [],
	};
};

interface TaskDraftContextValue {
	draft: TaskDraft;
	updateDraft: (updates: Partial<TaskDraft>) => void;
	resetDraft: () => void;
	loadDraft: (task: TaskEntity) => void;
}

const TaskDraftContext = createContext<TaskDraftContextValue | null>(null);

export const TaskDraftProvider = ({ children }: { children: React.ReactNode }) => {
	const [draft, setDraft] = useState<TaskDraft>(getInitialDraft);
	const updateDraft = (updates: Partial<TaskDraft>) => {
		setDraft((prev) => ({ ...prev, ...updates }));
	};
	const resetDraft = () => setDraft(getInitialDraft());
	const loadDraft = (task: TaskEntity) => {
		const future = Temporal.Now.plainDateTimeISO().add({ hours: 1 });
		setDraft({
			title: task.title,
			description: task.description || "",
			pattern: task.kind === "recurring" ? "recurring" : "one-time",
			date: task.dueDate || future.toPlainDate().toString(),
			time: task.dueTime || future.toPlainTime().toString({ smallestUnit: "minute" }),
			recurringMode: task.recurringMode || "today",
			recurringDays: task.recurringDays || [],
		});
	};
	return (
		<TaskDraftContext.Provider value={{ draft, updateDraft, resetDraft, loadDraft }}>
			{children}
		</TaskDraftContext.Provider>
	);
};

export const useTaskDraft = () => {
	const context = useContext(TaskDraftContext);
	if (!context) throw new Error("useTaskDraft must be used within TaskDraftProvider");
	return context;
};
