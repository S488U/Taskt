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
import { useSettings } from "../../context/SettingsContext";
import { triggerHaptic } from "../../utils/haptics";

const SavedTasks = () => {
	const [allTasks, setAllTasks] = useState<TaskEntity[]>([]);
	const [viewAll, setViewAll] = useState(false);
	const { loadDraft } = useTaskDraft();
	const { showProgressCard, hapticsEnabled } = useSettings();

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

	const handleToggle = useCallback(
		async (id: string, nextChecked: boolean) => {
			triggerHaptic(hapticsEnabled, nextChecked ? "success" : "selection");
			const nextStatus: TaskStatus = nextChecked ? "done" : "pending";

			let currentTask: TaskEntity | undefined;
			setAllTasks((prev) => {
				currentTask = prev.find((item) => item.id === id);
				return prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item));
			});

			try {
				await taskService.updateStatus(id, nextStatus);

				if (nextChecked) {
					if (currentTask?.notificationId) {
						await cancelTaskReminders(currentTask.notificationId);
						await taskService.updateNotificationId(id, null);
					}
				} else if (currentTask) {
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
		},
		[hapticsEnabled]
	);

	const handleDelete = useCallback(
		async (id: string) => {
			triggerHaptic(hapticsEnabled, "warning");
			let taskToDelete: TaskEntity | undefined;
			setAllTasks((prev) => {
				taskToDelete = prev.find((item) => item?.id === id);
				return prev.filter((item) => item?.id !== id);
			});

			try {
				if (taskToDelete?.notificationId) {
					await cancelTaskReminders(taskToDelete.notificationId);
				}
				await taskService.deleteTask(id);
			} catch (error) {
				console.error("Error deleting task:", error);
			}
		},
		[hapticsEnabled]
	);

	const handleEdit = useCallback(
		(task: TaskEntity) => {
			triggerHaptic(hapticsEnabled, "selection");
			loadDraft(task);
			router.push({ pathname: "/edit", params: { id: task.id } });
		},
		[hapticsEnabled, loadDraft]
	);

	const keyExtractor = useCallback((item: TaskEntity) => item.id, []);

	const renderItem = useCallback(
		({ item }: { item: TaskEntity }) => (
			<Card item={item} onDelete={handleDelete} onToggle={handleToggle} onPress={handleEdit} />
		),
		[handleDelete, handleToggle, handleEdit]
	);

	return (
		<>
			{showProgressCard && <ProgressCard todoExtra={todoExtra} />}

			<View className="mb-3 flex-row items-center justify-between px-2">
				<AppText className="font-interBold text-text text-xl capitalize">
					{viewAll ? "all tasks" : "daily tasks"}
				</AppText>
				<AppText
					onPress={() => {
						triggerHaptic(hapticsEnabled, "selection");
						setViewAll((prev) => !prev);
					}}
					className="font-interSBold text-primary text-base capitalize"
				>
					{viewAll ? "View Today" : "View All"}
				</AppText>
			</View>
			{visibleTasks.length > 0 ? (
				<FlatList
					className="flex-1"
					data={visibleTasks}
					keyExtractor={keyExtractor}
					renderItem={renderItem}
					contentContainerClassName="flex flex-col gap-2 pb-12 px-0.5"
					showsVerticalScrollIndicator={false}
					removeClippedSubviews={true}
					maxToRenderPerBatch={8}
					windowSize={5}
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
