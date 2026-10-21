import React, { useState, useMemo, useCallback } from "react";
import { View, Pressable, FlatList } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Temporal } from "@js-temporal/polyfill";

// components
import AppText from "../../components/AppText";
import Card from "../../components/Card";

// services & utils
import { taskService } from "../../db/taskService";
import type { TaskEntity, TaskStatus } from "../tasks/task.types";
import { DAY_LABELS } from "../../utils/scheduleUtils";
import { cancelTaskReminders, scheduleTaskReminder } from "../../utils/notificationService";
import { getToday, getCalendarDates, formatSelectedDate } from "../../utils/temporal/datePicker";
import { useTaskDraft } from "../../context/TaskDraftContext";
import { useSettings } from "../../context/SettingsContext";
import { triggerHaptic } from "../../utils/haptics";

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const CELL_WIDTH_PERCENT = `${100 / 7}%`;

type FilterType = "all" | "recurring" | "one_time";

const formatMonthYear = (displayedMonth: Temporal.PlainYearMonth) => {
	return displayedMonth.toPlainDate({ day: 1 }).toLocaleString(undefined, {
		month: "long",
		year: "numeric",
	});
};

const CalendarScreen = () => {
	const today = useMemo(() => getToday(), []);
	const todayStr = useMemo(() => today.toString(), [today]);

	const [allTasks, setAllTasks] = useState<TaskEntity[]>([]);
	const [selectedDate, setSelectedDate] = useState<Temporal.PlainDate>(today);
	const [displayedMonth, setDisplayedMonth] = useState<Temporal.PlainYearMonth>(() =>
		Temporal.PlainYearMonth.from({ year: today.year, month: today.month })
	);
	const [activeFilter, setActiveFilter] = useState<FilterType>("all");
	const { loadDraft } = useTaskDraft();
	const { hapticsEnabled } = useSettings();

	const loadTasks = async () => {
		try {
			const tasks = await taskService.getAllTask();
			setAllTasks(tasks || []);
		} catch (error) {
			console.error("Error loading tasks for calendar:", error);
		}
	};

	useFocusEffect(
		useCallback(() => {
			loadTasks();
		}, [])
	);

	// Navigation
	const goToPreviousMonth = useCallback(() => {
		triggerHaptic(hapticsEnabled, "selection");
		setDisplayedMonth((current) => current.subtract({ months: 1 }));
	}, [hapticsEnabled]);

	const goToNextMonth = useCallback(() => {
		triggerHaptic(hapticsEnabled, "selection");
		setDisplayedMonth((current) => current.add({ months: 1 }));
	}, [hapticsEnabled]);

	const goToToday = useCallback(() => {
		triggerHaptic(hapticsEnabled, "selection");
		setSelectedDate(today);
		setDisplayedMonth(Temporal.PlainYearMonth.from({ year: today.year, month: today.month }));
	}, [today, hapticsEnabled]);

	const handleDatePress = useCallback(
		(date: Temporal.PlainDate) => {
			triggerHaptic(hapticsEnabled, "selection");
			setSelectedDate(date);
			if (date.year !== displayedMonth.year || date.month !== displayedMonth.month) {
				setDisplayedMonth(Temporal.PlainYearMonth.from({ year: date.year, month: date.month }));
			}
		},
		[displayedMonth, hapticsEnabled]
	);

	// Calendar Grid Dates
	const calendarDates = useMemo(() => getCalendarDates(displayedMonth), [displayedMonth]);
	const selectedDateStr = useMemo(() => selectedDate.toString(), [selectedDate]);

	// Helper to determine if a task applies to a specific PlainDate
	const isTaskOnDate = useCallback((task: TaskEntity, date: Temporal.PlainDate) => {
		try {
			const dateStr = date.toString();
			const weekday = DAY_LABELS[date.dayOfWeek % 7];

			if (task.kind === "one_time") {
				return task.dueDate === dateStr;
			}
			if (task.kind === "recurring") {
				return Array.isArray(task.recurringDays) && task.recurringDays.includes(weekday);
			}
			return false;
		} catch {
			return false;
		}
	}, []);

	// Dates in displayed grid that have at least one task (for dot indicators)
	const datesWithTasks = useMemo(() => {
		const set = new Set<string>();
		if (allTasks.length === 0) return set;

		for (const date of calendarDates) {
			const dateStr = date.toString();
			const hasTask = allTasks.some((task) => isTaskOnDate(task, date));
			if (hasTask) {
				set.add(dateStr);
			}
		}
		return set;
	}, [allTasks, calendarDates, isTaskOnDate]);

	// Tasks for the selected date, filtered by kind
	const tasksForSelectedDate = useMemo(() => {
		return allTasks.filter((task) => {
			const matchesDate = isTaskOnDate(task, selectedDate);
			if (!matchesDate) return false;

			if (activeFilter === "recurring") return task.kind === "recurring";
			if (activeFilter === "one_time") return task.kind === "one_time";
			return true;
		});
	}, [allTasks, selectedDate, activeFilter, isTaskOnDate]);

	// Task actions (matching SavedTasks.tsx behavior)
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
				console.error("Error updating status in calendar:", error);
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
				console.error("Error deleting task in calendar:", error);
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

	const isSelectedToday = selectedDateStr === todayStr;
	const selectedDateLabel = isSelectedToday ? "Today" : formatSelectedDate(selectedDate);

	return (
		<View className="bg-background flex-1 px-4 pt-3">
			{/* Top Bar: Title + Today Pill */}
			<View className="flex-row items-center justify-between pb-3">
				<AppText className="font-interBold text-text text-3xl">Calendar</AppText>
				<Pressable onPress={goToToday} className="border-border bg-surface rounded-full border px-4 py-1.5">
					<AppText className="font-interMedium text-text text-xs">Today</AppText>
				</Pressable>
			</View>

			{/* Filter Chips */}
			<View className="flex-row gap-2 pb-3">
				<Pressable
					onPress={() => {
						triggerHaptic(hapticsEnabled, "selection");
						setActiveFilter("all");
					}}
					className={`rounded-full px-4 py-2 ${
						activeFilter === "all" ? "bg-primary" : "border-border bg-surface border"
					}`}
				>
					<AppText
						className={`font-interMedium text-xs ${
							activeFilter === "all" ? "text-white" : "text-secondary"
						}`}
					>
						All Tasks
					</AppText>
				</Pressable>

				<Pressable
					onPress={() => {
						triggerHaptic(hapticsEnabled, "selection");
						setActiveFilter("recurring");
					}}
					className={`rounded-full px-4 py-2 ${
						activeFilter === "recurring" ? "bg-primary" : "border-border bg-surface border"
					}`}
				>
					<AppText
						className={`font-interMedium text-xs ${
							activeFilter === "recurring" ? "text-white" : "text-secondary"
						}`}
					>
						Repeating
					</AppText>
				</Pressable>

				<Pressable
					onPress={() => {
						triggerHaptic(hapticsEnabled, "selection");
						setActiveFilter("one_time");
					}}
					className={`rounded-full px-4 py-2 ${
						activeFilter === "one_time" ? "bg-primary" : "border-border bg-surface border"
					}`}
				>
					<AppText
						className={`font-interMedium text-xs ${
							activeFilter === "one_time" ? "text-white" : "text-secondary"
						}`}
					>
						One-time
					</AppText>
				</Pressable>
			</View>

			{/* Calendar Card */}
			<View className="border-border bg-surface mb-4 rounded-2xl border p-4">
				{/* Month header & navigation */}
				<View className="flex-row items-center justify-between px-1 pb-2">
					<AppText className="font-interBold text-text text-base">{formatMonthYear(displayedMonth)}</AppText>
					<View className="flex-row gap-1">
						<Pressable onPress={goToPreviousMonth} className="p-1.5">
							<Ionicons name="chevron-back" size={18} color="#64748B" />
						</Pressable>
						<Pressable onPress={goToNextMonth} className="p-1.5">
							<Ionicons name="chevron-forward" size={18} color="#64748B" />
						</Pressable>
					</View>
				</View>

				{/* Weekdays */}
				<View className="flex-row pt-1">
					{weekdays.map((day) => (
						<View
							key={day}
							style={{ width: CELL_WIDTH_PERCENT }}
							className="items-center justify-center py-1"
						>
							<AppText className="font-interSBold text-secondary text-xs">{day}</AppText>
						</View>
					))}
				</View>

				{/* Days Grid */}
				<View className="flex-row flex-wrap pt-1">
					{calendarDates.map((date) => {
						const isCurrentMonth = date.year === displayedMonth.year && date.month === displayedMonth.month;
						const dateStr = date.toString();
						const isToday = dateStr === todayStr;
						const isSelected = dateStr === selectedDateStr;
						const hasTasks = datesWithTasks.has(dateStr);

						return (
							<View
								key={dateStr}
								style={{ width: CELL_WIDTH_PERCENT }}
								className="h-10 items-center justify-center"
							>
								<Pressable
									onPress={() => handleDatePress(date)}
									className="items-center justify-center"
								>
									<View
										style={{
											width: 34,
											height: 34,
											borderRadius: 17,
											overflow: "hidden",
											alignItems: "center",
											justifyContent: "center",
											backgroundColor: isSelected ? "#4F46E5" : "transparent",
											borderWidth: isToday && !isSelected ? 2 : 0,
											borderColor: "#4F46E5",
										}}
									>
										<AppText
											className={`text-xs ${
												isSelected
													? "font-interBold text-white"
													: isToday
														? "font-interBold text-text"
														: !isCurrentMonth
															? "font-interMedium text-secondary/40"
															: "font-interMedium text-text"
											}`}
										>
											{date.day}
										</AppText>

										{/* Indicator dot inside the circle */}
										{hasTasks && (
											<View
												style={{
													position: "absolute",
													bottom: 3,
													width: 4,
													height: 4,
													borderRadius: 2,
													backgroundColor: isSelected ? "#FFFFFF" : "#4F46E5",
												}}
											/>
										)}
									</View>
								</Pressable>
							</View>
						);
					})}
				</View>
			</View>

			{/* Section Header: Tasks for Date */}
			<View className="flex-row items-center justify-between px-1 pb-3">
				<AppText className="font-interBold text-text text-lg">Tasks for {selectedDateLabel}</AppText>
				<View className="bg-primary/10 rounded-full px-2.5 py-0.5">
					<AppText className="font-interSBold text-primary text-xs">
						{tasksForSelectedDate.length} {tasksForSelectedDate.length === 1 ? "task" : "tasks"}
					</AppText>
				</View>
			</View>

			{/* Task List (Using our own Card layout!) */}
			{tasksForSelectedDate.length > 0 ? (
				<FlatList
					className="flex-1"
					data={tasksForSelectedDate}
					keyExtractor={keyExtractor}
					renderItem={renderItem}
					contentContainerClassName="flex flex-col gap-2 pb-6 px-0.5"
					showsVerticalScrollIndicator={false}
					removeClippedSubviews={true}
					maxToRenderPerBatch={8}
					windowSize={5}
				/>
			) : (
				<View className="flex-1 items-center justify-center pb-12">
					<Ionicons name="calendar-outline" size={40} color="#94A3B8" />
					<AppText className="text-secondary font-interMedium mt-2 text-sm">
						No tasks scheduled for this day
					</AppText>
				</View>
			)}
		</View>
	);
};

export default CalendarScreen;
