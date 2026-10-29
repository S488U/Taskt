import React, { useState, useCallback } from "react";
import { View, ScrollView, Pressable, Modal } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Temporal } from "@js-temporal/polyfill";

// components
import AppText from "../../components/AppText";
import PatternPill from "../../components/PatternPill";
import StatusPill from "../../components/StatusPill";
import CheckBox from "../../components/CheckBox";

// db & utils
import { taskService } from "../../db/taskService";
import type { TaskEntity, TaskStatus } from "./task.types";
import { useTaskDraft } from "../../context/TaskDraftContext";
import { useSettings } from "../../context/SettingsContext";
import { triggerHaptic } from "../../utils/haptics";
import { parseDate, parseTime } from "../../utils/dateTime";
import { isTaskCompletedForDate } from "../../utils/scheduleUtils";
import { cancelTaskReminders, scheduleTaskReminder } from "../../utils/notificationService";

const ViewTask = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { hapticsEnabled } = useSettings();
	const { loadDraft } = useTaskDraft();

	const [task, setTask] = useState<TaskEntity | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);

	const fetchTask = useCallback(async () => {
		if (!id) return;
		try {
			const found = await taskService.getTaskById(id);
			if (found) {
				setTask(found);
			}
		} catch (error) {
			console.error("Error fetching task for view:", error);
		} finally {
			setLoading(false);
		}
	}, [id]);

	useFocusEffect(
		useCallback(() => {
			fetchTask();
		}, [fetchTask])
	);

	const handleBack = () => {
		triggerHaptic(hapticsEnabled, "selection");
		router.back();
	};

	const handleEdit = () => {
		if (!task) return;
		triggerHaptic(hapticsEnabled, "selection");
		loadDraft(task);
		router.push({ pathname: "/edit", params: { id: task.id } });
	};

	const isDone = task ? isTaskCompletedForDate(task) : false;

	const handleToggleStatus = async () => {
		if (!task) return;
		const nextChecked = !isDone;
		triggerHaptic(hapticsEnabled, nextChecked ? "success" : "selection");

		const nextStatus: TaskStatus = nextChecked ? "done" : "pending";
		const nowStr = Temporal.Now.instant().toString();

		const updatedTask: TaskEntity = {
			...task,
			status: nextStatus,
			completedAt: nextChecked ? nowStr : null,
		};
		setTask(updatedTask);

		try {
			await taskService.updateStatus(task.id, nextStatus);

			if (task.kind === "one_time") {
				if (nextChecked) {
					if (task.notificationId) {
						await cancelTaskReminders(task.notificationId);
						await taskService.updateNotificationId(task.id, null);
						setTask((prev) => (prev ? { ...prev, notificationId: null } : null));
					}
				} else {
					const newNotifId = await scheduleTaskReminder({ ...task, status: "pending" });
					if (newNotifId) {
						await taskService.updateNotificationId(task.id, newNotifId);
						setTask((prev) => (prev ? { ...prev, notificationId: newNotifId } : null));
					}
				}
			}
		} catch (error) {
			console.error("Error toggling task status:", error);
		}
	};

	const handleDeletePress = () => {
		triggerHaptic(hapticsEnabled, "warning");
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!task) return;
		try {
			setIsDeleting(true);
			triggerHaptic(hapticsEnabled, "warning");
			if (task.notificationId) {
				await cancelTaskReminders(task.notificationId);
			}
			await taskService.deleteTask(task.id);
			setShowDeleteModal(false);
			router.back();
		} catch (error) {
			console.error("Error deleting task:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	if (loading) {
		return (
			<View className="bg-background flex-1 items-center justify-center">
				<AppText className="text-secondary font-inter">Loading task...</AppText>
			</View>
		);
	}

	if (!task) {
		return (
			<View className="bg-background flex-1 items-center justify-center p-4">
				<AppText className="text-secondary font-inter mb-4 text-base">Task not found</AppText>
				<Pressable onPress={() => router.back()} className="bg-surface rounded-xl border border-border px-4 py-2">
					<AppText className="text-text font-interMedium">Go Back</AppText>
				</Pressable>
			</View>
		);
	}

	const patternLabel = task.kind === "one_time" ? "one-time" : "recurring";

	// Format schedule details
	let scheduleText = "";
	if (task.kind === "one_time") {
		const formattedDate = task.dueDate ? parseDate(task.dueDate) : "No date";
		const formattedTime = task.dueTime ? parseTime(task.dueTime) : null;
		scheduleText = formattedTime ? `${formattedDate} • ${formattedTime}` : formattedDate;
	} else {
		let daysLabel = "No days set";
		if (Array.isArray(task.recurringDays) && task.recurringDays.length > 0) {
			if (task.recurringDays.length === 7) {
				daysLabel = "Every day";
			} else {
				daysLabel = `Every ${task.recurringDays.join(", ")}`;
			}
		}
		const formattedTime = task.dueTime ? parseTime(task.dueTime) : null;
		scheduleText = formattedTime ? `${daysLabel} • ${formattedTime}` : daysLabel;
	}

	return (
		<View className="bg-background flex-1">
			<View className="border-border bg-surface m-2 flex-1 rounded-2xl border px-4 py-3 pb-4">
				{/* Header: [Back Arrow | Title | Edit Button] */}
				<View className="mt-2 flex-row items-center justify-between pb-3 border-b border-border">
					<View className="flex-row items-center gap-2">
						<Pressable onPress={handleBack} className="rounded-3xl p-1.5 pl-0">
							<MaterialIcons name="arrow-back-ios-new" size={24} color="#0F172A" />
						</Pressable>
						<AppText className="font-interSBold text-text text-2xl">Task Details</AppText>
					</View>

					<Pressable
						onPress={handleEdit}
						className="active:bg-indigo-50 flex-row items-center gap-1 rounded-full px-3 py-1.5"
					>
						<MaterialIcons name="edit" size={18} color="#4F46E5" />
						<AppText className="font-interSBold text-primary text-base">Edit</AppText>
					</Pressable>
				</View>

				{/* Scrollable Content */}
				<ScrollView
					className="flex-1 mt-4"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
				>
					{/* Badges: Pattern & Status */}
					<View className="flex-row items-center gap-2">
						<PatternPill pattern={patternLabel} checked={isDone} />
						<StatusPill status={isDone ? "done" : ""} />
					</View>

					{/* Title */}
					<AppText className="font-interBold text-text text-2xl capitalize">
						{task.title}
					</AppText>

					{/* Schedule Info Box */}
					<View className="bg-background border border-border rounded-xl p-3.5 flex-row items-center gap-3">
						<Ionicons
							name={task.kind === "one_time" ? "calendar-outline" : "repeat-outline"}
							size={20}
							color="#64748B"
						/>
						<View className="flex-1">
							<AppText className="text-secondary font-inter text-xs uppercase tracking-wider">
								{task.kind === "one_time" ? "Scheduled For" : "Repeat Schedule"}
							</AppText>
							<AppText className="text-text font-interMedium text-sm mt-0.5">
								{scheduleText}
							</AppText>
						</View>
					</View>

					{/* Description */}
					<View className="gap-1.5">
						<AppText className="text-secondary font-interSBold text-xs uppercase tracking-wider">
							Description
						</AppText>
						{task.description && task.description.trim() !== "" ? (
							<AppText className="text-text font-inter text-base leading-6">
								{task.description}
							</AppText>
						) : (
							<AppText className="text-secondary/60 font-inter italic text-sm">
								No description provided.
							</AppText>
						)}
					</View>

					{/* Completion Toggle Card */}
					<Pressable
						onPress={handleToggleStatus}
						className="bg-background border border-border rounded-xl p-4 flex-row items-center justify-between mt-2"
					>
						<View className="flex-1 pr-3">
							<AppText className="font-interMedium text-text text-base">
								{isDone ? "Task Completed" : "Mark as Completed"}
							</AppText>
							<AppText className="text-secondary font-inter text-sm mt-0.5">
								{isDone ? "Tap to mark as pending" : "Tap to complete this task"}
							</AppText>
						</View>
						<CheckBox value={isDone} onChange={handleToggleStatus} />
					</Pressable>
				</ScrollView>

				{/* Bottom Delete Button */}
				<Pressable
					onPress={handleDeletePress}
					className="border border-red-500/30 active:bg-red-50 flex-row items-center justify-center gap-2 rounded-xl py-3 mt-2"
				>
					<MaterialIcons name="delete-outline" size={20} color="#EF4444" />
					<AppText className="font-interMedium text-danger text-base">Delete Task</AppText>
				</Pressable>
			</View>

			{/* ================= MODAL: DELETE TASK ================= */}
			<Modal
				visible={showDeleteModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowDeleteModal(false)}
			>
				<View className="flex-1 items-center justify-center bg-black/50 p-6">
					<View className="border-border bg-surface w-full max-w-sm rounded-3xl border p-6 shadow-xl">
						<View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-red-100">
							<Ionicons name="trash-outline" size={24} color="#EF4444" />
						</View>

						<AppText className="font-interBold text-text text-xl">Delete Task?</AppText>
						<AppText className="text-secondary font-inter mt-2 text-sm leading-5">
							This will permanently delete this task and cancel any scheduled reminders. This action
							cannot be undone.
						</AppText>

						<View className="mt-6 flex-row justify-end gap-3">
							<Pressable
								onPress={() => setShowDeleteModal(false)}
								className="rounded-xl px-4 py-2.5 active:bg-slate-100"
							>
								<AppText className="font-interMedium text-secondary text-sm">Cancel</AppText>
							</Pressable>
							<Pressable
								onPress={confirmDelete}
								disabled={isDeleting}
								className="rounded-xl bg-red-500 px-5 py-2.5 active:bg-red-600"
							>
								<AppText className="font-interBold text-sm text-white">
									{isDeleting ? "Deleting..." : "Delete"}
								</AppText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default ViewTask;
