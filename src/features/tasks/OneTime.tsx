import { View, Pressable } from "react-native";
import { useEffect, useMemo } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router } from "expo-router";
import { Temporal } from "@js-temporal/polyfill";

import SubTitle from "../../components/SubTitle";
import AppText from "../../components/AppText";
import { useTaskDraft } from "../../context/TaskDraftContext";
import { useSettings } from "../../context/SettingsContext";
import { triggerHaptic } from "../../utils/haptics";

const COLOR_DANGER = "#EF4444";
const COLOR_SECONDARY = "#64748B";

const clockIcon = "clock";
const calendarIcon = "calendar-days";

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

const formatDateString = (dateStr?: string) => {
	if (!dateStr) return "";
	try {
		const plainDate = Temporal.PlainDate.from(dateStr);
		return plainDate.toLocaleString(undefined, {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	} catch {
		return dateStr;
	}
};

type OneTimeProps = {
	onErrorChange?: (hasError: boolean) => void;
};

const OneTime = ({ onErrorChange }: OneTimeProps) => {
	const { draft } = useTaskDraft();
	const { hapticsEnabled } = useSettings();

	const isPast = useMemo(() => {
		try {
			if (!draft.date) return false;
			const today = Temporal.Now.plainDateISO();
			const taskDate = Temporal.PlainDate.from(draft.date);
			const dateCmp = Temporal.PlainDate.compare(taskDate, today);
			if (dateCmp < 0) return true;
			if (dateCmp === 0 && draft.time) {
				const nowTime = Temporal.Now.plainTimeISO().round({
					smallestUnit: "minute",
					roundingMode: "floor",
				});
				const taskTime = Temporal.PlainTime.from(draft.time);
				return Temporal.PlainTime.compare(taskTime, nowTime) < 0;
			}
			return false;
		} catch {
			return false;
		}
	}, [draft.date, draft.time]);

	useEffect(() => {
		onErrorChange?.(isPast);
	}, [isPast, onErrorChange]);

	return (
		<View>
			<SubTitle title="Due" />
			<View>
				<View className="flex-row gap-3">
					<Pressable
						className={`flex-1 border ${isPast ? "border-danger" : "border-border"} bg-surface rounded-2xl px-4 py-3`}
						onPress={() => {
							triggerHaptic(hapticsEnabled, "selection");
							router.push("/datepicker");
						}}
					>
						<AppText className={`text-xs ${isPast ? "text-danger" : "text-secondary"}`}>Date</AppText>
						<View className="mt-1 flex-row items-center gap-2">
							<FontAwesome6
								name={calendarIcon}
								size={16}
								color={isPast ? COLOR_DANGER : COLOR_SECONDARY}
							/>
							<AppText className={`text-base ${isPast ? "text-danger" : "text-secondary"} leading-5`}>
								{formatDateString(draft.date)}
							</AppText>
						</View>
					</Pressable>
					<Pressable
						className={`flex-1 border ${isPast ? "border-danger" : "border-border"} bg-surface rounded-2xl px-4 py-3`}
						onPress={() => {
							triggerHaptic(hapticsEnabled, "selection");
							router.push("/timepicker");
						}}
					>
						<AppText className={`text-xs ${isPast ? "text-danger" : "text-secondary"}`}>Time</AppText>
						<View className="mt-1 flex-row items-center gap-2">
							<FontAwesome6
								name={clockIcon}
								size={16}
								color={isPast ? COLOR_DANGER : COLOR_SECONDARY}
							/>
							<AppText
								className={`text-base ${isPast ? "text-danger" : "text-secondary"} leading-5 uppercase`}
							>
								{formatTimeString(draft.time)}
							</AppText>
						</View>
					</Pressable>
				</View>
				{isPast && (
					<View className="mt-1 ml-1">
						<AppText className="text-danger text-xs">
							Selected: {formatDateString(draft.date)} at {formatTimeString(draft.time)}. Please choose a future
							time.
						</AppText>
					</View>
				)}
			</View>
		</View>
	);
};

export default OneTime;
