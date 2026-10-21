import { FlatList, View } from "react-native";
import { useCallback, useMemo, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Temporal } from "@js-temporal/polyfill";

// components
import Card from "../../components/Card";
import AppText from "../../components/AppText";
import ProgressCard from "../../components/ProgressCard";

import { taskService } from "../../db/taskService";
import type { TaskEntity, TaskStatus } from "./task.types";
import { DAY_LABELS } from "../../utils/scheduleUtils";
import { cancelTaskReminders, scheduleTaskReminder } from "../../utils/notificationService";
import { useTaskDraft } from "../../context/TaskDraftContext";

const SavedTasks = () => {
	const [allTasks, setAllTasks] = useState<TaskEntity[]>([]);
	const [viewAll, setViewAll] = useState(false);
	const { loadDraft } = useTaskDraft();

	const loadTasks = async () => {
		try {
			const tasks = await taskService.getAllTask();
			setAllTasks(tasks || []);
		} catch (error) {
			console.error("Error loading tasks from db:", error);
		}
	};

	useFocusEffect(
		useCallback(() => {
			loadTasks();
		}, [])
	);

	const isForToday = useCallback((task: TaskEntity) => {
		try {
			const today = Temporal.Now.plainDateISO();
			const todayDateStr = today.toString();
			const todayWeekday = DAY_LABELS[today.dayOfWeek % 7];

			if (task.kind === "one_time") {
				return task.dueDate === todayDateStr;
			}
			if (task.kind === "recurring") {
				return Array.isArray(task.recurringDays) && task.recurringDays.includes(todayWeekday);
			}
			return false;
		} catch {
			return false;
		}
	}, []);

	const visibleTasks = useMemo(() => {
		return viewAll ? allTasks : allTasks.filter(isForToday);
	}, [allTasks, viewAll, isForToday]);

	const todoExtra = useMemo(() => {
		return {
			length: visibleTasks.length,
			status: visibleTasks.filter((item) => item.status === "done").length,
		};
	}, [visibleTasks]);

	const handleToggle = async (id: string, nextChecked: boolean) => {
		const nextStatus: TaskStatus = nextChecked ? "done" : "pending";
		const currentTask = allTasks.find((item) => item.id === id);

		setAllTasks((prev) =>
			prev.map((item) =>
				item.id === id
					? {
							...item,
							status: nextStatus,
						}
					: item
			)
		);

		try {
			await taskService.updateStatus(id, nextStatus);

			if (nextChecked) {
				// Mark as done: cancel any existing scheduled reminder
				if (currentTask?.notificationId) {
					await cancelTaskReminders(currentTask.notificationId);
					await taskService.updateNotificationId(id, null);
				}
			} else if (currentTask) {
				// Unchecked back to pending: re-schedule reminder
				const newNotificationId = await scheduleTaskReminder({
					...currentTask,
					status: "pending",
				});
				if (newNotificationId) {
					await taskService.updateNotificationId(id, newNotificationId);
					setAllTasks((prev) =>
						prev.map((item) => (item.id === id ? { ...item, notificationId: newNotificationId } : item))
					);
				}
			}
		} catch (error) {
			console.error("Error updating status:", error);
		}
	};

	const handleDelete = async (id: string) => {
		const taskToDelete = allTasks.find((item) => item?.id === id);
		setAllTasks((prev) => prev.filter((item) => item?.id !== id));

		try {
			if (taskToDelete?.notificationId) {
				await cancelTaskReminders(taskToDelete.notificationId);
			}
			await taskService.deleteTask(id);
		} catch (error) {
			console.error("Error deleting task:", error);
		}
	};

	const handleEdit = (task: TaskEntity) => {
		loadDraft(task);
		router.push({ pathname: "/edit", params: { id: task.id } });
	};

	return (
		<>
			<ProgressCard todoExtra={todoExtra} />

			<View className="mb-3 flex-row items-center justify-between px-2">
				<AppText className="font-interBold text-text text-xl capitalize">
					{viewAll ? "all tasks" : "daily tasks"}
				</AppText>
				<AppText
					onPress={() => setViewAll((prev) => !prev)}
					className="font-interSBold text-primary text-base capitalize"
				>
					{viewAll ? "View Today" : "View All"}
				</AppText>
			</View>
			{visibleTasks.length > 0 ? (
				<FlatList
					className="flex-1"
					data={visibleTasks}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<Card item={item} onDelete={handleDelete} onToggle={handleToggle} onPress={handleEdit} />
					)}
					contentContainerClassName="flex flex-col gap-2 pb-12 px-0.5"
					showsVerticalScrollIndicator={false}
					removeClippedSubviews={false}
				/>
			) : (
				<View className="flex-1 items-center justify-center">
					<AppText className="text-secondary italic">Add Task to list here</AppText>
				</View>
			)}
		</>
	);
};

export default SavedTasks;
