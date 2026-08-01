import { View, Pressable } from "react-native";
import { useEffect, useState } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { styled } from "nativewind";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import type { Dispatch, SetStateAction } from "react";

import SubTitle from "../../components/SubTitle";
import AppText from "../../components/AppText";

import { formatDate, formatTime } from "../../utils/scheduleUtils";
import type { OneTimeData, TaskFormData } from "./task.types";

styled(FontAwesome6, {
	className: "style",
});

type OneTimePickerMode = "date" | "time";

type OneTimeProps = {
	data: OneTimeData;
	setData: Dispatch<SetStateAction<TaskFormData>>;
	onErrorChange?: (hasError: boolean) => void;
};

const OneTime = ({ data, setData, onErrorChange }: OneTimeProps) => {
	const [timeEdited, setTimeEdited] = useState(false);
	const clockIcon = "clock";
	const calendarIcon = "calendar-days";

	const currentDate = data.date;
	const NOW = new Date();
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const selectedDay = new Date(currentDate);
	selectedDay.setHours(0, 0, 0, 0);

	let isPast = false;
	if (selectedDay < today) {
		isPast = true;
	} else if (selectedDay.getTime() === today.getTime() && timeEdited && currentDate < NOW) {
		isPast = true;
	}

	useEffect(() => {
		onErrorChange?.(isPast);
	}, [isPast, onErrorChange]);

	const openPicker = (currentMode: OneTimePickerMode) => {
		DateTimePickerAndroid.open({
			value: currentDate,
			onChange: (event, selectedDate) => {
				if (event.type === "set" && selectedDate) {
					setData((prev) => ({
						...prev,
						oneTime: {
							...prev.oneTime,
							date: selectedDate,
						},
					}));

					if (currentMode === "time") {
						setTimeEdited(true);
					}
				}
			},
			mode: currentMode,
			is24Hour: false,
		});
	};

	return (
		<View>
			<SubTitle title="Due" />
			<View>
				<View className="flex-row gap-3">
					<Pressable
						className={`flex-1 border ${isPast ? "border-danger" : "border-border"} bg-surface rounded-2xl px-4 py-3`}
						onPress={() => openPicker("date")}
					>
						<AppText className={`text-xs ${isPast ? "text-danger" : "text-secondary"}`}>Date</AppText>
						<View className="mt-1 flex-row items-center gap-2">
							<FontAwesome6
								name={calendarIcon}
								size={16}
								className={`${isPast ? "text-danger" : "text-secondary"}`}
							/>
							<AppText className={`text-base ${isPast ? "text-danger" : "text-secondary"} leading-5`}>
								{formatDate(currentDate)}
							</AppText>
						</View>
					</Pressable>
					<Pressable
						className={`flex-1 border ${isPast ? "border-danger" : "border-border"} bg-surface rounded-2xl px-4 py-3`}
						onPress={() => openPicker("time")}
					>
						<AppText className={`text-xs ${isPast ? "text-danger" : "text-secondary"}`}>Time</AppText>
						<View className="mt-1 flex-row items-center gap-2">
							<FontAwesome6
								name={clockIcon}
								size={16}
								className={`${isPast ? "text-danger" : "text-secondary"}`}
							/>
							<AppText
								className={`text-base ${isPast ? "text-danger" : "text-secondary"} leading-5 uppercase`}
							>
								{formatTime(currentDate)}
							</AppText>
						</View>
					</Pressable>
				</View>
				{isPast && (
					<View className="mt-1 ml-1">
						<AppText className="text-danger text-xs">
							Selected: {formatDate(currentDate)} at {formatTime(currentDate)}. Please choose a future
							time.
						</AppText>
					</View>
				)}
			</View>
		</View>
	);
};

export default OneTime;
