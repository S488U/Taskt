import { View, Pressable } from "react-native";
import { useState, useEffect, useMemo } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { styled } from "nativewind";
import { router } from "expo-router";
import { Temporal } from "@js-temporal/polyfill";

import SubTitle from "../../components/SubTitle";
import AppText from "../../components/AppText";
import { useTaskDraft } from "../../context/TaskDraftContext";

import type { RecurringMode, Weekday } from "./task.types";
import { DAY_LABELS, getPresetDays, hasFutureOccurrence } from "../../utils/scheduleUtils";

styled(FontAwesome6, {
	className: "style",
});

const clockIcon = "clock";

const formatTimeString = (timeStr?: string) => {
	if (!timeStr) return "";
	try {
		const plainTime = Temporal.PlainTime.from(timeStr);
		const hour12 = plainTime.hour % 12 || 12;
		const hour = hour12.toString().padStart(2, "0");
		const minute = plainTime.minute.toString().padStart(2, "0");
		const meridian = plainTime.hour >= 12 ? "PM" : "AM";
		return `${hour}:${minute} ${meridian}`;
	} catch {
		return timeStr;
	}
};

type RecurringProps = {
	onErrorChange?: (hasError: boolean) => void;
};

const Recurring = ({ onErrorChange }: RecurringProps) => {
	const { draft, updateDraft } = useTaskDraft();
	const [hasInteracted, setHasInteracted] = useState(false);

	const isPast = useMemo(() => {
		if (!hasInteracted || !draft.recurringDays.length || !draft.time) return false;
		return !hasFutureOccurrence(
			{
				days: draft.recurringDays,
				time: draft.time,
			},
			new Date()
		);
	}, [hasInteracted, draft.recurringDays, draft.time]);

	useEffect(() => {
		onErrorChange?.(isPast);
	}, [isPast, onErrorChange]);

	const toggleDay = (day: Weekday) => {
		setHasInteracted(true);
		const currentDays = draft.recurringDays || [];
		const days = currentDays.includes(day)
			? currentDays.filter((d) => d !== day)
			: [...currentDays, day];

		updateDraft({
			recurringMode: "custom",
			recurringDays: days,
		});
	};

	useEffect(() => {
		if (draft.recurringMode === "custom") return;

		const presetDays = getPresetDays(draft.recurringMode);
		if (presetDays.length) {
			updateDraft({
				recurringDays: presetDays,
			});
		}
	}, [draft.recurringMode]);

	return (
		<>
			<View className="flex-row gap-2">
				{(["today", "tomorrow", "everyday"] as RecurringMode[]).map((item) => (
					<Pressable
						key={item}
						className={`flex-1 ${draft.recurringMode === item ? "bg-primary" : "bg-surface"} border-border rounded-xl border`}
						onPress={() => {
							setHasInteracted(true);
							updateDraft({
								recurringMode: item,
								recurringDays: getPresetDays(item),
							});
						}}
					>
						<AppText
							numberOfLines={1}
							className={`${draft.recurringMode === item ? "text-surface" : "text-secondary"} font-interMedium px-3 py-2 text-center text-sm capitalize`}
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
							className={`flex-1 ${draft.recurringDays?.includes(item) ? "bg-primary" : "bg-surface"} border-border rounded-xl border`}
						>
							<AppText
								className={`${draft.recurringDays?.includes(item) ? "text-surface" : "text-secondary"} font-interMedium px-3 py-3 text-center text-sm capitalize`}
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
					onPress={() => router.push("/timepicker")}
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
						{formatTimeString(draft.time)}
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
