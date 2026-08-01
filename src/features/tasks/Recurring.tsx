import { View, Pressable } from "react-native";
import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { styled } from "nativewind";

import SubTitle from "../../components/SubTitle";
import AppText from "../../components/AppText";

import type { RecurringData, RecurringMode, TaskFormData, Weekday } from "./task.types";

import { DAY_LABELS, formatTime, getPresetDays, hasFutureOccurrence, toTime24 } from "../../utils/scheduleUtils";

styled(FontAwesome6, {
	className: "style",
});

const clockIcon = "clock";

type RecurringProps = {
	data: RecurringData;
	setData: Dispatch<SetStateAction<TaskFormData>>;
	onErrorChange?: (hasError: boolean) => void;
};

const Recurring = ({ data, setData, onErrorChange }: RecurringProps) => {
	const [hasInteracted, setHasInteracted] = useState(false);
	const NOW = new Date();

	const isPast =
		hasInteracted && data.days.length > 0
			? !hasFutureOccurrence(
					{
						days: data.days,
						time: toTime24(data.time),
					},
					NOW
				)
			: false;

	useEffect(() => {
		onErrorChange?.(isPast);
	}, [isPast, onErrorChange]);

	const toggleDay = (day: Weekday) => {
		setHasInteracted(true);

		setData((prev) => {
			const days = prev.recurring.days.includes(day)
				? prev.recurring.days.filter((d) => d !== day)
				: [...prev.recurring.days, day];

			return {
				...prev,
				recurring: {
					...prev.recurring,
					type: "custom",
					days,
				},
			};
		});
	};

	const openTimePicker = () => {
		DateTimePickerAndroid.open({
			value: data.time,

			onChange: (event, selectedTime) => {
				if (event.type === "set" && selectedTime) {
					setHasInteracted(true);

					setData((prev) => ({
						...prev,
						recurring: {
							...prev.recurring,
							time: selectedTime,
						},
					}));
				}
			},

			mode: "time",
			is24Hour: false,
		});
	};

	useEffect(() => {
		if (data.type === "custom") return;

		const presetDays = getPresetDays(data.type);

		if (presetDays.length) {
			setData((prev) => ({
				...prev,
				recurring: {
					...prev.recurring,
					days: presetDays,
				},
			}));
		}
	}, [data.type, setData]);

	return (
		<>
			<View className="flex-row gap-2">
				{(["today", "tomorrow", "everyday"] as RecurringMode[]).map((item) => (
					<Pressable
						key={item}
						className={`flex-1 ${data.type === item ? "bg-primary" : "bg-surface"} border-border rounded-xl border`}
						onPress={() => {
							setHasInteracted(true);
							setData((prev) => ({
								...prev,
								recurring: {
									...prev.recurring,
									type: item,
								},
							}));
						}}
					>
						<AppText
							numberOfLines={1}
							className={`${data.type === item ? "text-surface" : "text-secondary"} font-interMedium px-3 py-2 text-center text-sm capitalize`}
						>
							{item}
						</AppText>
					</Pressable>
				))}
			</View>
			<View>
				<SubTitle title="Custom days" />
				<View className="flex-row gap-2">
					{DAY_LABELS.map((item) => (
						<Pressable
							key={item}
							onPress={() => toggleDay(item)}
							className={`flex-1 ${data.days.includes(item) ? "bg-primary" : "bg-surface"} border-border rounded-xl border`}
						>
							<AppText
								className={`${data.days.includes(item) ? "text-surface" : "text-secondary"} font-interMedium px-3 py-3 text-center text-sm capitalize`}
							>
								{item}
							</AppText>
						</Pressable>
					))}
				</View>
			</View>
			<View>
				<SubTitle title="Time" />
				<Pressable
					onPress={openTimePicker}
					className={`flex-row items-center justify-center gap-2 border ${isPast ? "border-danger" : "border-border"} bg-surface rounded-xl px-4 py-3`}
				>
					<FontAwesome6
						name={clockIcon}
						size={16}
						className={`${isPast ? "text-danger" : "text-secondary"}`}
					/>
					<AppText
						className={`${isPast ? "text-danger" : "text-secondary"} font-interMedium text-center text-base uppercase`}
					>
						{formatTime(data.time)}
					</AppText>
				</Pressable>
				{isPast && (
					<AppText className="text-danger mt-1 ml-1 text-xs">
						Selected recurring time has no future occurrence. Choose another time or days.
					</AppText>
				)}
			</View>
		</>
	);
};

export default Recurring;
