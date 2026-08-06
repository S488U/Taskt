import React, { useRef, useState } from "react";
import SchedulerLayout from "../layout/SchedulerLayout";
import TimePicker, { TimePickerRef } from "./TimePicker";
import QuickPresets from "./QuickPresets";
import { View } from "react-native";
import ErrorLayout from "../layout/ErrorLayout";

const TimeScreen = () => {
	const timePickerRef = useRef<TimePickerRef>(null);
	const [error, setError] = useState<string>("");

	const handleSelectPreset = (hour: number, minute: number, meridian: "AM" | "PM") => {
		timePickerRef.current?.scrollToTime(hour, minute, meridian);
	};

	return (
		<SchedulerLayout title="Time">
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
