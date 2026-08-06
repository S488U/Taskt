import React, { useCallback, useMemo, useState } from "react";
import { View, Pressable } from "react-native";
import AppText from "../../AppText";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Temporal } from "@js-temporal/polyfill";

import { getToday, formatSelectedDate } from "../../../utils/temporal/datePicker";
import DateGrid from "./DateGrid";

import SchedulerLayout from "../layout/SchedulerLayout";
import { getCurrentTime } from "../../../utils/temporal/timePicker";

const formatMonthYear = (displayedMonth: Temporal.PlainYearMonth) => {
	return displayedMonth.toPlainDate({ day: 1 }).toLocaleString(undefined, {
		month: "long",
		year: "numeric",
	});
};

const DateScreen = () => {
	const today = useMemo(() => getToday(), []);

	/*
	 * The month currently visible in the calendar.
	 *
	 * This is intentionally separate from selectedDate.
	 */
	const [displayedMonth, setDisplayedMonth] = useState<Temporal.PlainYearMonth>(() =>
		Temporal.PlainYearMonth.from({
			year: today.year,
			month: today.month,
		})
	);

	/*
	 * The actual date selected by the user.
	 */
	const [selectedDate, setSelectedDate] = useState<Temporal.PlainDate>(today);

	const monthTitle = useMemo(() => formatMonthYear(displayedMonth), [displayedMonth]);

	const goToPreviousMonth = useCallback(() => {
		setDisplayedMonth((currentMonth) =>
			currentMonth.subtract({
				months: 1,
			})
		);
	}, []);

	const goToNextMonth = useCallback(() => {
		setDisplayedMonth((currentMonth) =>
			currentMonth.add({
				months: 1,
			})
		);
	}, []);

	return (
		<SchedulerLayout title="Date">
			{/* Calendar */}
			<View className="bg-surface my-9 w-full rounded-xl p-5 px-7">
				<View className="flex-row items-center justify-between">
					<AppText className="font-interBold text-lg">{monthTitle}</AppText>

					<View className="flex-row gap-4">
						<Pressable onPress={goToPreviousMonth} className="px-2 py-0.5">
							<MaterialIcons name="arrow-back-ios-new" size={17} />
						</Pressable>

						<Pressable onPress={goToNextMonth} className="px-2 py-0.5">
							<MaterialIcons name="arrow-forward-ios" size={17} />
						</Pressable>
					</View>
				</View>

				<DateGrid
					displayedMonth={displayedMonth}
					selectedDate={selectedDate}
					today={today}
					setDisplayedMonth={setDisplayedMonth}
					setSelectedDate={setSelectedDate}
				/>
			</View>

			{/* Selected Date */}
			<View className="px-3">
				<View className="flex flex-row items-center justify-between">
					<AppText className="text-secondary font-interMedium">Selected Date</AppText>

					<AppText className="font-interSBold text-primary">{formatSelectedDate(selectedDate)}</AppText>
				</View>

				<View className="bg-secondary/8 my-5 h-0.5 w-full rounded-full" />

				<Pressable onPress={() => router.push("/timepicker")}>
					<View className="flex flex-row items-center justify-between">
						<AppText className="text-secondary font-interMedium">Set Time (Optional)</AppText>
						<AppText className="font-interSBold text-primary bg-primary/8 rounded-lg p-2">
							{getCurrentTime()}
						</AppText>
					</View>
				</Pressable>
			</View>
		</SchedulerLayout>
	);
};

export default DateScreen;
