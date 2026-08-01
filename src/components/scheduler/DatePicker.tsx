import React, { useState } from "react";
import { View, Pressable } from "react-native";
import AppText from "../AppText";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import { router } from "expo-router";
import { Temporal } from "@js-temporal/polyfill";
import { clsx } from "clsx";

import { getToday, formatDate, formatSelectedDate } from "../../utils/temporal/datePicker";

const StyledIcon = styled(Ionicons, { className: "style" });

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const dateArray = Array.from({ length: 31 }, (_, index) => index + 1);

const DatePickerGrid = () => {
	const [gridWidth, setGridWidth] = useState(0);

	const today = getToday();

	const [selectedDate, setSelectedDate] = useState<Temporal.PlainDate>(today);

	const cellWidth = gridWidth / 7;

	const getPressedDate = (day: number) => {
		const date = Temporal.PlainDate.from({
			year: today.year,
			month: today.month,
			day,
		});

		setSelectedDate(date);

		console.log("Selected Date:", date.toString());
	};

	const isToday = (day: number) => {
		return day === today.day;
	};

	const isSelected = (day: number) => {
		return day === selectedDate.day;
	};

	return (
		<View
			className="mt-4"
			onLayout={(event) => {
				setGridWidth(event.nativeEvent.layout.width);
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
				{dateArray.map((day) => {
					const todayDate = isToday(day);
					const selected = isSelected(day);

					const showPrimary = selected;

					const showTodayBorder = todayDate && !selected;

					return (
						<View
							key={day}
							style={{
								width: cellWidth,
								height: 44,
							}}
							className="items-center justify-center"
						>
							<Pressable onPress={() => getPressedDate(day)}>
								<View
									className={clsx(
										"will-change-variable h-10 w-10 items-center justify-center rounded-full",
										selected ? "bg-primary" : "bg-transparent",
										showTodayBorder ? "border-primary border-2" : "border-none"
									)}
								>
									<AppText
										className={clsx(
											"font-interMedium text-sm",
											selected ? "text-background" : "text-text"
										)}
									>
										{day}
									</AppText>
								</View>
							</Pressable>
						</View>
					);
				})}
			</View>
		</View>
	);
};

const DatePicker = () => {
	const today = getToday();

	const [selectedDate, setSelectedDate] = useState<Temporal.PlainDate>(today);

	return (
		<View className="flex-1 flex-col justify-between px-6 py-4">
			<StatusBar style="light" animated />

			<View className="mt-5 mb-5 justify-center">
				{/* Header */}
				<View className="w-full flex-row items-center">
					<View className="absolute w-20 items-center">
						<Pressable onPress={() => router.back()}>
							<StyledIcon className="text-secondary" name="close" size={24} color="black" />
						</Pressable>
					</View>

					<View className="flex-1 items-center">
						<AppText className="font-interSBold text-2xl">Select Date</AppText>
					</View>
				</View>

				{/* Calendar */}
				<View className="bg-surface my-9 w-full rounded-xl p-5 px-7">
					<View className="flex-row items-center justify-between">
						<AppText className="font-interBold text-lg">{formatDate(today).slice(3)}</AppText>

						<View className="flex-row gap-4">
							<MaterialIcons name="arrow-back-ios-new" size={17} />
							<MaterialIcons name="arrow-forward-ios" size={17} />
						</View>
					</View>

					<DatePickerGrid />
				</View>

				<View className="px-3">
					<View className="flex flex-row items-center justify-between">
						<AppText className="text-secondary font-interMedium">Selected Date</AppText>

						<AppText className="font-interSBold text-primary">{formatSelectedDate(selectedDate)}</AppText>
					</View>

					<View className="bg-secondary/8 my-5 h-0.5 w-full rounded-full" />

					<View className="flex flex-row items-center justify-between">
						<AppText className="text-secondary font-interMedium">Set Time (Optional)</AppText>

						<AppText className="font-interSBold text-primary bg-primary/8 rounded-lg p-2">10:00 AM</AppText>
					</View>
				</View>
			</View>

			<View>
				<Pressable
					onPress={() => router.push("/")}
					className="bg-primary rounded-2xl border border-slate-400 py-1"
				>
					<AppText className="text-surface my-3 text-center text-xl">Confirm Date</AppText>
				</Pressable>
			</View>
		</View>
	);
};

export default DatePicker;
