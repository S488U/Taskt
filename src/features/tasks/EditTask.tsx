import { View, Pressable, Animated, Easing, Keyboard } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import type { TextInputInstance } from "react-native";
import { Temporal } from "@js-temporal/polyfill";

import SubTitle from "../../components/SubTitle";
import OneTime from "./OneTime";
import Recurring from "./Recurring";
import AppTextInput from "../../components/AppTextInput";
import AppText from "../../components/AppText";

import { useTaskDraft } from "../../context/TaskDraftContext";
import { taskService } from "../../db/taskService";
import { cancelTaskReminders, scheduleTaskReminder } from "../../utils/notificationService";
import type { TaskEntity } from "./task.types";

const EditTask = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [patternWidth, setPatternWidth] = useState(0);
	const descriptionInputRef = useRef<TextInputInstance>(null);
	const [validationErrors, setValidationErrors] = useState({
		title: false,
		oneTime: false,
		recurring: false,
	});

	const { draft, updateDraft, resetDraft, loadDraft } = useTaskDraft();
	const placeHolderTextColor = "#64748B";
	const [patternAnim] = useState(() => new Animated.Value(draft.pattern === "one-time" ? 0 : 1));

	// Load existing task from db if not already loaded into draft
	useEffect(() => {
		if (!id) return;
		const loadTaskFromDb = async () => {
			try {
				const existing = await taskService.getTaskById(id);
				if (existing) {
					loadDraft(existing);
				}
			} catch (err) {
				console.error("Error loading task to edit:", err);
			}
		};
		loadTaskFromDb();
	}, [id]);

	useEffect(() => {
		Animated.timing(patternAnim, {
			toValue: draft.pattern === "one-time" ? 0 : 1,
			duration: 220,
			easing: Easing.out(Easing.cubic),
			useNativeDriver: true,
		}).start();
	}, [draft.pattern, patternAnim]);

	const sliderTrackWidth = Math.max(patternWidth - 8, 0);
	const sliderSegmentWidth = sliderTrackWidth / 2;
	const sliderTranslateX = patternAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, sliderSegmentWidth],
	});

	const isSaveDisabled = draft.pattern === "one-time" ? validationErrors.oneTime : validationErrors.recurring;

	const handleSave = async () => {
		if (!id) return;
		Keyboard.dismiss();

		if (draft.title.trim() === "") {
			setValidationErrors((prev) => ({
				...prev,
				title: true,
			}));
			return;
		}

		try {
			const existing = await taskService.getTaskById(id);
			const now = Temporal.Now.instant().toString();
			const timezone = Temporal.Now.timeZoneId();

			const updatedData: Partial<Omit<TaskEntity, "id" | "createdAt">> = {
				title: draft.title.trim(),
				description: draft.description?.trim() || null,
				kind: draft.pattern === "one-time" ? "one_time" : "recurring",
				dueDate: draft.pattern === "one-time" ? draft.date : null,
				dueTime: draft.time || null,
				recurringMode: draft.pattern === "recurring" ? draft.recurringMode : null,
				recurringDays: draft.pattern === "recurring" ? draft.recurringDays : [],
				timezone,
			};

			// Handle reminder re-scheduling
			if (existing?.notificationId) {
				await cancelTaskReminders(existing.notificationId);
				updatedData.notificationId = null;
			}

			if (existing?.status !== "done") {
				const newNotificationId = await scheduleTaskReminder({
					...existing,
					...updatedData,
					id,
					status: existing?.status || "pending",
					createdAt: existing?.createdAt || now,
					updatedAt: now,
					completedAt: existing?.completedAt || null,
				} as TaskEntity);

				if (newNotificationId) {
					updatedData.notificationId = newNotificationId;
				}
			}

			await taskService.updateTask(id, updatedData);
			resetDraft();
			router.back();
		} catch (error) {
			console.error("Error saving updated task:", error);
		}
	};

	const handleCancel = () => {
		resetDraft();
		router.back();
	};

	return (
		<View className="bg-background flex-1">
			<View className="border-border bg-surface m-2 flex-1 rounded-2xl border px-3 py-3 pb-2">
				{/* Header: [Back Arrow | Edit Task | Checkmark Save] */}
				<View className="mt-3 flex-row items-center justify-between">
					<View className="flex-row items-center gap-2">
						<Pressable onPress={handleCancel} className="rounded-3xl p-1.5 pl-0">
							<MaterialIcons name="arrow-back-ios-new" size={24} color="#0F172A" />
						</Pressable>
						<AppText className="font-interSBold text-text text-3xl">Edit Task</AppText>
					</View>

					<Pressable
						onPress={handleSave}
						disabled={isSaveDisabled}
						className={`rounded-full p-2 ${isSaveDisabled ? "opacity-40" : "active:bg-indigo-50"}`}
					>
						<Ionicons name="checkmark" size={28} color="#4F46E5" />
					</Pressable>
				</View>

				{/* Form Fields */}
				<View className="mt-5 flex-1 flex-col justify-start gap-4">
					{/* Title */}
					<View>
						<SubTitle title="Title" />
						<AppTextInput
							hasError={validationErrors.title}
							placeholder="Enter Task Title"
							placeholderTextColor={placeHolderTextColor}
							returnKeyType="next"
							blurOnSubmit={false}
							onSubmitEditing={() => descriptionInputRef.current?.focus()}
							onChangeText={(text) => {
								updateDraft({ title: text });
								if (validationErrors.title && text.trim() !== "") {
									setValidationErrors((prev) => ({ ...prev, title: false }));
								}
							}}
							onFocus={() =>
								setValidationErrors((prev) => (prev.title ? { ...prev, title: false } : prev))
							}
							value={draft.title}
						/>
						{validationErrors.title && (
							<AppText className="text-danger ml-3 text-xs capitalize">Title is required!</AppText>
						)}
					</View>

					{/* Description */}
					<View>
						<SubTitle title="Description (optional)" />
						<AppTextInput
							ref={descriptionInputRef}
							placeholder="Enter Task Description"
							placeholderTextColor={placeHolderTextColor}
							onChangeText={(text) => updateDraft({ description: text })}
							returnKeyType="done"
							blurOnSubmit
							submitBehavior="blurAndSubmit"
							onSubmitEditing={handleSave}
							multiline
							value={draft.description}
						/>
					</View>

					{/* Pattern Switcher */}
					<View>
						<SubTitle title="Pattern" />
						<View
							className="border-border relative flex-row rounded-2xl border p-1"
							onLayout={(event) => setPatternWidth(event.nativeEvent.layout.width)}
						>
							<Animated.View
								pointerEvents="none"
								className="bg-primary absolute top-1 bottom-1 left-1 rounded-xl"
								style={{
									width: sliderSegmentWidth,
									transform: [{ translateX: sliderTranslateX }],
								}}
							/>
							<Pressable
								onPress={() => updateDraft({ pattern: "one-time" })}
								className="flex-1 rounded-xl"
							>
								<AppText
									className={`font-interMedium py-2 text-center text-sm ${
										draft.pattern === "one-time" ? "text-surface" : "text-secondary"
									}`}
								>
									One time
								</AppText>
							</Pressable>
							<Pressable
								onPress={() => updateDraft({ pattern: "recurring" })}
								className="flex-1 rounded-xl"
							>
								<AppText
									className={`font-interMedium py-2 text-center text-sm ${
										draft.pattern === "recurring" ? "text-surface" : "text-secondary"
									}`}
								>
									Recurring
								</AppText>
							</Pressable>
						</View>
					</View>

					{/* One Time Date & Time Selectors */}
					{draft.pattern === "one-time" && (
						<OneTime
							onErrorChange={(hasError: boolean) =>
								setValidationErrors((prev) =>
									prev.oneTime === hasError ? prev : { ...prev, oneTime: hasError }
								)
							}
						/>
					)}

					{/* Recurring Days & Time Selectors */}
					{draft.pattern === "recurring" && (
						<Recurring
							onErrorChange={(hasError: boolean) =>
								setValidationErrors((prev) =>
									prev.recurring === hasError ? prev : { ...prev, recurring: hasError }
								)
							}
						/>
					)}
				</View>

				{/* Save Changes Bottom Button */}
				<View>
					<Pressable
						disabled={isSaveDisabled}
						style={{ backgroundColor: isSaveDisabled ? "#CBD5E1" : "#4F46E5" }}
						className="rounded-3xl py-3"
						onPress={handleSave}
					>
						<AppText className="text-surface text-center text-xl">Save Changes</AppText>
					</Pressable>
				</View>
			</View>
		</View>
	);
};

export default EditTask;
