import { View, Pressable, Animated, Easing, Keyboard } from "react-native";

import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import type { TextInput } from "react-native";

import SubTitle from "../../components/SubTitle";
import OneTime from "./OneTime";
import Recurring from "./Recurring";
import AppTextInput from "../../components/AppTextInput";
import AppText from "../../components/AppText";

import { storeData } from "../../utils/storageUtils";
import type { TaskFormData } from "./task.types";

const CreateTask = () => {
	const [patternWidth, setPatternWidth] = useState(0);
	const descriptionInputRef = useRef<TextInput>(null);
	const [validationErrors, setValidationErrors] = useState({
		title: false,
		oneTime: false,
		recurring: false,
	});
	const [todoData, setTodoData] = useState<TaskFormData>({
		title: "",
		description: "",
		pattern: "one-time",
		status: false,
		oneTime: {
			date: new Date(),
		},
		recurring: {
			type: "today",
			days: [],
			time: new Date(),
		},
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	const placeHolderTextColor = "#64748B";
	const patternAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(patternAnim, {
			toValue: todoData.pattern === "one-time" ? 0 : 1,
			duration: 220,
			easing: Easing.out(Easing.cubic),
			useNativeDriver: true,
		}).start();

		// console.log(todoData);
	}, [todoData.pattern, patternAnim]);

	const sliderTrackWidth = Math.max(patternWidth - 8, 0);
	const sliderSegmentWidth = sliderTrackWidth / 2;
	const sliderTranslateX = patternAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, sliderSegmentWidth],
	});

	const isAddDisabled = todoData.pattern === "one-time" ? validationErrors.oneTime : validationErrors.recurring;

	const handleAddTask = async () => {
		Keyboard.dismiss();

		if (todoData.title.trim() === "") {
			setValidationErrors((prev) => ({
				...prev,
				title: true,
			}));
			return;
		}

		const storeTodoData = await storeData("todoData", todoData);

		if (!storeTodoData?.success) {
			return;
		}

		router.dismissAll();
	};

	return (
		<View className="bg-background flex-1">
			<View className="border-border bg-surface m-2 flex-1 rounded-2xl border px-3 py-3 pb-2">
				<View className="mt-3 flex-row items-center">
					<Pressable onPress={() => router.dismissAll()} className="rounded-3xl px-3 py-1.5 pl-0">
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
								setTodoData((prev) => ({ ...prev, title: text }));
								if (validationErrors.title && text.trim() !== "") {
									setValidationErrors((prev) => ({ ...prev, title: false }));
								}
							}}
							onFocus={() =>
								setValidationErrors((prev) => (prev.title ? { ...prev, title: false } : prev))
							}
							value={todoData.title}
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
							onChangeText={(text) => setTodoData((prev) => ({ ...prev, description: text }))}
							returnKeyType="done"
							blurOnSubmit
							submitBehavior="blurAndSubmit"
							onSubmitEditing={handleAddTask}
							multiline
							value={todoData.description}
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
									setTodoData((prev) => ({ ...prev, pattern: "one-time" }));
								}}
								className="flex-1 rounded-xl"
							>
								<AppText
									className={`font-interMedium py-2 text-center text-sm ${todoData.pattern === "one-time" ? "text-surface" : "text-secondary"}`}
								>
									One time
								</AppText>
							</Pressable>
							<Pressable
								onPress={() => {
									setTodoData((prev) => ({ ...prev, pattern: "recurring" }));
								}}
								className="flex-1 rounded-xl"
							>
								<AppText
									className={`font-interMedium py-2 text-center text-sm ${todoData.pattern === "recurring" ? "text-surface" : "text-secondary"}`}
								>
									Recurring
								</AppText>
							</Pressable>
						</View>
					</View>

					{todoData.pattern === "one-time" && (
						<OneTime
							data={todoData.oneTime}
							setData={setTodoData}
							onErrorChange={(hasError: boolean) =>
								setValidationErrors((prev) =>
									prev.oneTime === hasError ? prev : { ...prev, oneTime: hasError }
								)
							}
						/>
					)}

					{todoData.pattern === "recurring" && (
						<Recurring
							data={todoData.recurring}
							setData={setTodoData}
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
						className={`rounded-3xl border border-slate-400 ${
							isAddDisabled ? "bg-slate-300" : "bg-primary"
						}`}
						onPress={handleAddTask}
					>
						<AppText className="text-surface my-3 text-center text-xl">Add Task</AppText>
					</Pressable>
				</View>
			</View>
		</View>
	);
};

export default CreateTask;
