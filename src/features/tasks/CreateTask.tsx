import { View, Pressable, Animated, Easing, Keyboard } from "react-native";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import type { TextInputInstance } from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { Temporal } from "@js-temporal/polyfill";

import SubTitle from "../../components/SubTitle";
import OneTime from "./OneTime";
import Recurring from "./Recurring";
import AppTextInput from "../../components/AppTextInput";
import AppText from "../../components/AppText";

import { useTaskDraft } from "../../context/TaskDraftContext";
import { taskService } from "../../db/taskService";
import { scheduleTaskReminder } from "../../utils/notificationService";
import type { TaskEntity } from "./task.types";

const CreateTask = () => {
	const [patternWidth, setPatternWidth] = useState(0);
	const descriptionInputRef = useRef<TextInputInstance>(null);
	const [validationErrors, setValidationErrors] = useState({
		title: false,
		oneTime: false,
		recurring: false,
	});

	const { draft, updateDraft, resetDraft } = useTaskDraft();

	const placeHolderTextColor = "#64748B";
	const patternAnim = useRef(new Animated.Value(0)).current;

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

	const isAddDisabled = draft.pattern === "one-time" ? validationErrors.oneTime : validationErrors.recurring;

	const handleAddTask = async () => {
		Keyboard.dismiss();

		if (draft.title.trim() === "") {
			setValidationErrors((prev) => ({
				...prev,
				title: true,
			}));
			return;
		}

		try {
			const id = uuidv4();
			const now = Temporal.Now.instant().toString();
			const timezone = Temporal.Now.timeZoneId();

			const newTask: TaskEntity = {
				id,
				title: draft.title.trim(),
				description: draft.description?.trim() || null,
				kind: draft.pattern === "one-time" ? "one_time" : "recurring",
				status: "pending",
				dueDate: draft.pattern === "one-time" ? draft.date : null,
				dueTime: draft.time || null,
				recurringMode: draft.pattern === "recurring" ? draft.recurringMode : null,
				recurringDays: draft.pattern === "recurring" ? draft.recurringDays : [],
				createdAt: now,
				updatedAt: now,
				completedAt: null,
				timezone,
				notificationId: null,
			};

			const notificationId = await scheduleTaskReminder(newTask);
			if (notificationId) {
				newTask.notificationId = notificationId;
			}

			await taskService.createTask(newTask);
			resetDraft();
			router.dismissAll();
		} catch (error) {
			console.error("Error creating task:", error);
		}
	};

	return (
		<View className="bg-background flex-1">
			<View className="border-border bg-surface m-2 flex-1 rounded-2xl border px-3 py-3 pb-2">
				<View className="mt-3 flex-row items-center">
					<Pressable
						onPress={() => {
							resetDraft();
							router.dismissAll();
						}}
						className="rounded-3xl px-3 py-1.5 pl-0"
					>
						<MaterialIcons name="arrow-back-ios-new" size={24} />
					</Pressable>
					<AppText className="font-interSBold text-text text-4xl">New Task</AppText>
				</View>
				<View className="mt-5 flex-1 flex-col justify-start gap-4">
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
							onSubmitEditing={handleAddTask}
							multiline
							value={draft.description}
						/>
					</View>

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
								onPress={() => {
									updateDraft({ pattern: "one-time" });
								}}
								className="flex-1 rounded-xl"
							>
								<AppText
									className={`font-interMedium py-2 text-center text-sm ${draft.pattern === "one-time" ? "text-surface" : "text-secondary"}`}
								>
									One time
								</AppText>
							</Pressable>
							<Pressable
								onPress={() => {
									updateDraft({ pattern: "recurring" });
								}}
								className="flex-1 rounded-xl"
							>
								<AppText
									className={`font-interMedium py-2 text-center text-sm ${draft.pattern === "recurring" ? "text-surface" : "text-secondary"}`}
								>
									Recurring
								</AppText>
							</Pressable>
						</View>
					</View>

					{draft.pattern === "one-time" && (
						<OneTime
							onErrorChange={(hasError: boolean) =>
								setValidationErrors((prev) =>
									prev.oneTime === hasError ? prev : { ...prev, oneTime: hasError }
								)
							}
						/>
					)}

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

				<View>
					<Pressable
						disabled={isAddDisabled}
						style={{ backgroundColor: isAddDisabled ? "#CBD5E1" : "#4F46E5" }}
						className="rounded-3xl py-3"
						onPress={handleAddTask}
					>
						<AppText className="text-surface text-center text-xl">Add Task</AppText>
					</Pressable>
				</View>
			</View>
		</View>
	);
};

export default CreateTask;
