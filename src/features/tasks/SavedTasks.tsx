import { FlatList, View } from "react-native";
import { useCallback, useMemo, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Temporal } from "@js-temporal/polyfill";

// components
import Card from "../../components/Card";
import AppText from "../../components/AppText";
import ProgressCard from "../../components/ProgressCard";
import EmptyState from "../../components/EmptyState";
import FloatingButton from "../../components/FloatingButton";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import { taskService } from "../../db/taskService";
import type { TaskEntity, TaskStatus } from "./task.types";
import { DAY_LABELS, isTaskCompletedForDate } from "../../utils/scheduleUtils";
import { cancelTaskReminders, scheduleTaskReminder } from "../../utils/notificationService";
import { useTaskDraft } from "../../context/TaskDraftContext";
import { useSettings } from "../../context/SettingsContext";
import { triggerHaptic } from "../../utils/haptics";

const SavedTasks = () => {
	const [allTasks, setAllTasks] = useState<TaskEntity[]>([]);
	const [viewAll, setViewAll] = useState(false);
	const { loadDraft } = useTaskDraft();
	const { showProgressCard, hapticsEnabled, hideCompletedTasks } = useSettings();

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

	const isTaskDone = useCallback((task: TaskEntity) => {
		return isTaskCompletedForDate(task);
	}, []);

	const dailyTasks = useMemo(() => {
		return allTasks.filter(isForToday);
	}, [allTasks, isForToday]);

	const todoExtra = useMemo(() => {
		const target = viewAll ? allTasks : dailyTasks;
		return {
			length: target.length,
			status: target.filter(isTaskDone).length,
		};
	}, [viewAll, allTasks, dailyTasks, isTaskDone]);

	const visibleTasks = useMemo(() => {
		const baseTasks = viewAll ? allTasks : dailyTasks;
		const filtered = hideCompletedTasks ? baseTasks.filter((item) => !isTaskDone(item)) : baseTasks;

		return [...filtered].sort((a, b) => {
			const aDone = isTaskDone(a);
			const bDone = isTaskDone(b);
			if (aDone === bDone) return 0;
			return aDone ? 1 : -1;
		});
	}, [allTasks, viewAll, dailyTasks, hideCompletedTasks, isTaskDone]);

	const handleToggle = useCallback(
		async (id: string, nextChecked: boolean) => {
			triggerHaptic(hapticsEnabled, nextChecked ? "success" : "selection");
			const nowStr = Temporal.Now.instant().toString();
			const nextStatus: TaskStatus = nextChecked ? "done" : "pending";

			let currentTask: TaskEntity | undefined;
			setAllTasks((prev) => {
				currentTask = prev.find((item) => item.id === id);
				return prev.map((item) =>
					item.id === id
						? {
								...item,
								status: nextStatus,
								completedAt: nextChecked ? nowStr : null,
							}
						: item
				);
			});

			try {
				await taskService.updateStatus(id, nextStatus);

				// Only cancel/reschedule notifications for ONE-TIME tasks.
				// For recurring tasks, keep the repeating weekly alarm intact!
				if (currentTask?.kind === "one_time") {
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
								prev.map((item) =>
									item.id === id ? { ...item, notificationId: newNotificationId } : item
								)
							);
						}
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
			<Card
				item={item}
				checked={isTaskDone(item)}
				onDelete={handleDelete}
				onToggle={handleToggle}
				onPress={handleEdit}
			/>
		),
		[handleDelete, handleToggle, handleEdit, isTaskDone]
	);

	// State 1: Brand New User (Zero tasks exist anywhere in the app)
	if (allTasks.length === 0) {
		return (
			<EmptyState
				type="first_time"
				title="Plan your day with Taskt"
				description="Set up one-time reminders or recurring habits. Everything is saved locally and rings on time."
				buttonText="Create a Task"
				onAction={() => {
					triggerHaptic(hapticsEnabled, "impact");
					router.push("/create");
				}}
			/>
		);
	}

	// State 2: Daily Clear (Tasks exist in DB, but none scheduled for today or all done)
	if (visibleTasks.length === 0) {
		return (
			<>
				{showProgressCard && todoExtra.length > 0 && <ProgressCard todoExtra={todoExtra} />}
				<EmptyState
					type="all_clear"
					title="All clear for today"
					description="Your daily tasks have been completed or you haven't scheduled any for today. Ready to start fresh?"
					buttonText="Schedule a Task"
					secondaryButtonText={viewAll ? undefined : "View All Tasks"}
					onAction={() => {
						triggerHaptic(hapticsEnabled, "impact");
						router.push("/create");
					}}
					onSecondaryAction={() => {
						triggerHaptic(hapticsEnabled, "selection");
						setViewAll(true);
					}}
				/>
			</>
		);
	}

	// State 3: Active Task List
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
			<FlatList
				className="flex-1"
				data={visibleTasks}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				contentContainerClassName="flex flex-col gap-2 pb-12 px-1 pt-1"
				showsVerticalScrollIndicator={false}
				removeClippedSubviews={true}
				maxToRenderPerBatch={8}
				windowSize={5}
			/>
			<FloatingButton
				icon={<FontAwesome6 name="add" size={20} color="#FFFFFF" />}
				onPress={() => {
					triggerHaptic(hapticsEnabled, "impact");
					router.push("/create");
				}}
			/>
		</>
	);
};

export default SavedTasks;
