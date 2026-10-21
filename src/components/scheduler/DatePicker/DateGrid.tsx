import React, { memo, useMemo, useCallback } from "react";
import { View, Pressable } from "react-native";
import { getCalendarDates } from "../../../utils/temporal/datePicker";
import { Temporal } from "@js-temporal/polyfill";
import AppText from "../../AppText";
import { useSettings } from "../../../context/SettingsContext";
import { triggerHaptic } from "../../../utils/haptics";

type DatePickerGridProps = {
	displayedMonth: Temporal.PlainYearMonth;
	selectedDate: Temporal.PlainDate;
	today: Temporal.PlainDate;
	setDisplayedMonth: React.Dispatch<React.SetStateAction<Temporal.PlainYearMonth>>;
	setSelectedDate: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
};

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// 100 / 7 = 14.2857...%
// This allows the layout engine to handle the grid natively without JS measuring!
const CELL_WIDTH_PERCENT = `${100 / 7}%`;

const DateGrid = memo(
	({ displayedMonth, selectedDate, today, setDisplayedMonth, setSelectedDate }: DatePickerGridProps) => {
		const { hapticsEnabled } = useSettings();
		// 1. Memoize calendar dates
		const calendarDates = useMemo(() => getCalendarDates(displayedMonth), [displayedMonth]);

		// 2. Pre-calculate strings for O(1) comparison
		// Temporal's toString() outputs YYYY-MM-DD, which is perfectly safe for equality checks
		const todayStr = today.toString();
		const selectedDateStr = selectedDate.toString();

		const handleDatePress = useCallback(
			(date: Temporal.PlainDate) => {
				triggerHaptic(hapticsEnabled, "selection");
				setSelectedDate(date);

				if (date.year !== displayedMonth.year || date.month !== displayedMonth.month) {
					setDisplayedMonth(
						Temporal.PlainYearMonth.from({
							year: date.year,
							month: date.month,
						})
					);
				}
			},
			[displayedMonth, setDisplayedMonth, setSelectedDate, hapticsEnabled]
		);

		return (
			<View className="mt-4">
				{/* Weekdays */}
				<View className="flex-row">
					{weekdays.map((day) => (
						<View
							key={day}
							style={{ width: CELL_WIDTH_PERCENT }}
							className="h-10 items-center justify-center"
						>
							<AppText className="font-interSBold text-secondary text-sm">{day}</AppText>
						</View>
					))}
				</View>

				{/* Dates */}
				<View className="flex-row flex-wrap">
					{calendarDates.map((date) => {
						const isCurrentMonth = date.year === displayedMonth.year && date.month === displayedMonth.month;

						// 3. Fast string comparison (Vastly faster than Temporal.compare)
						const dateStr = date.toString();
						const isToday = dateStr === todayStr;
						const isSelected = dateStr === selectedDateStr;

						return (
							<View
								key={dateStr}
								style={{ width: CELL_WIDTH_PERCENT }}
								className="h-11 items-center justify-center"
							>
								<Pressable onPress={() => handleDatePress(date)}>
									{/* 4. Pure NativeWind styling eliminates inline style object creation */}
									<View
										className={`h-8.75 w-8.75 items-center justify-center rounded-full ${
											isSelected ? "bg-primary" : "bg-transparent"
										} ${isToday && !isSelected ? "border-primary border-2" : "border-0"}`}
									>
										<AppText
											className={`font-interMedium text-sm ${
												isSelected
													? "text-[#F8FAFC]"
													: !isCurrentMonth
														? "text-[#94A3B8]"
														: "text-[#0F172A]"
											}`}
										>
											{date.day}
										</AppText>
									</View>
								</Pressable>
							</View>
						);
					})}
				</View>
			</View>
		);
	}
);

DateGrid.displayName = "DatePickerGrid";

export default DateGrid;
