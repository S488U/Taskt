import React, { useRef, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Temporal } from "@js-temporal/polyfill";
import SchedulerLayout from "../layout/SchedulerLayout";
import TimePicker, { TimePickerRef } from "./TimePicker";
import QuickPresets from "./QuickPresets";
import ErrorLayout from "../layout/ErrorLayout";
import { useTaskDraft } from "../../../context/TaskDraftContext";

const TimeScreen = () => {
	const timePickerRef = useRef<TimePickerRef>(null);
	const [error] = useState<string>("");
	const { updateDraft } = useTaskDraft();

	const handleSelectPreset = (hour: number, minute: number, meridian: "AM" | "PM") => {
		timePickerRef.current?.scrollToTime(hour, minute, meridian);
	};

	const handleConfirm = () => {
		const timeData = timePickerRef.current?.getTime();
		if (timeData) {
			let hour24 = timeData.hour % 12;
			if (timeData.meridian === "PM") hour24 += 12;

			const plainTime = Temporal.PlainTime.from({
				hour: hour24,
				minute: timeData.minute,
			});
			updateDraft({ time: plainTime.toString({ smallestUnit: "minute" }) });
		}
		router.back();
	};

	return (
		<SchedulerLayout title="Time" onConfirm={handleConfirm}>
			<View className="flex-1 flex-col justify-between">
				<View>
					<TimePicker ref={timePickerRef} />
					{error ? <ErrorLayout error={error} /> : null}
				</View>
				<QuickPresets onSelectPreset={handleSelectPreset} />
			</View>
		</SchedulerLayout>
	);
};

export default TimeScreen;
