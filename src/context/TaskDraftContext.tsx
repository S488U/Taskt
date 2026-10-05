import React, { createContext, useContext, useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import type { TaskDraft } from "../features/tasks/task.types";

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
}

const TaskDraftContext = createContext<TaskDraftContextValue | null>(null);

export const TaskDraftProvider = ({ children }: { children: React.ReactNode }) => {
	const [draft, setDraft] = useState<TaskDraft>(getInitialDraft);
	const updateDraft = (updates: Partial<TaskDraft>) => {
		setDraft((prev) => ({ ...prev, ...updates }));
	};
	const resetDraft = () => setDraft(getInitialDraft());
	return <TaskDraftContext.Provider value={{ draft, updateDraft, resetDraft }}>{children}</TaskDraftContext.Provider>;
};

export const useTaskDraft = () => {
  const context = useContext(TaskDraftContext);
  if (!context) throw new Error("useTaskDraft must be used within TaskDraftProvider");
  return context;
};