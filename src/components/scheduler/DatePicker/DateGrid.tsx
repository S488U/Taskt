import React, { memo, useState, useMemo, useCallback } from "react";
import { View, Pressable } from "react-native";
import { getCalendarDates } from "../../../utils/temporal/datePicker";
import { Temporal } from "@js-temporal/polyfill";
import AppText from "../../AppText";

type DatePickerGridProps = {
	displayedMonth: Temporal.PlainYearMonth;
	selectedDate: Temporal.PlainDate;
	today: Temporal.PlainDate;
	setDisplayedMonth: React.Dispatch<React.SetStateAction<Temporal.PlainYearMonth>>;
	setSelectedDate: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
};

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const DateGrid = memo(
	({ displayedMonth, selectedDate, today, setDisplayedMonth, setSelectedDate }: DatePickerGridProps) => {
		const [gridWidth, setGridWidth] = useState(0);

		const cellWidth = gridWidth / 7;

		/*
		 * Recalculate the 42 dates only when
		 * displayedMonth changes.
		 */
		const calendarDates = useMemo(() => getCalendarDates(displayedMonth), [displayedMonth]);

		const handleDatePress = useCallback(
			(date: Temporal.PlainDate) => {
				setSelectedDate(date);

				/*
				 * If the selected date belongs to another
				 * month, move the calendar to that month.
				 */
				if (date.year !== displayedMonth.year || date.month !== displayedMonth.month) {
					setDisplayedMonth(
						Temporal.PlainYearMonth.from({
							year: date.year,
							month: date.month,
						})
					);
				}
			},
			[displayedMonth, setDisplayedMonth, setSelectedDate]
		);

		return (
			<View
				className="mt-4"
				onLayout={(event) => {
					const width = event.nativeEvent.layout.width;

					setGridWidth((previousWidth) => (previousWidth === width ? previousWidth : width));
				}}
			>
				{/* Weekdays */}
				<View className="flex-row">
					{weekdays.map((day) => (
						<View
							key={day}
							style={{
								width: cellWidth,
								height: 40,
							}}
							className="items-center justify-center"
						>
							<AppText className="font-interSBold text-secondary text-sm">{day}</AppText>
						</View>
					))}
				</View>

				{/* Dates */}
				<View className="flex-row flex-wrap">
					{calendarDates.map((date) => {
						const isCurrentMonth = date.year === displayedMonth.year && date.month === displayedMonth.month;

						const isToday = Temporal.PlainDate.compare(date, today) === 0;

						const isSelected = Temporal.PlainDate.compare(date, selectedDate) === 0;

						return (
							<View
								key={date.toString()}
								style={{
									width: cellWidth,
									height: 44,
								}}
								className="items-center justify-center"
							>
								<Pressable onPress={() => handleDatePress(date)}>
									<View
										style={{
											width: 35,
											height: 35,
											borderRadius: 20,

											alignItems: "center",
											justifyContent: "center",

											backgroundColor: isSelected ? "#4F46E5" : "transparent",

											borderWidth: isToday && !isSelected ? 2 : 0,

											borderColor: "#4F46E5",
										}}
									>
										<AppText
											className="font-interMedium text-sm"
											style={{
												color: isSelected ? "#F8FAFC" : isCurrentMonth ? "#0F172A" : "#94A3B8",
											}}
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
