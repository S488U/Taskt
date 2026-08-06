import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";

import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

import AppText from "../../AppText";
import WheelItem, { ITEM_HEIGHT } from "./WheelItem";
import { getCurrentTimeSegments } from "../../../utils/temporal/timePicker";

type Meridian = "AM" | "PM";

const REPEAT_COUNT = 12;

const HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));

const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

const MERIDIANS: Meridian[] = ["AM", "PM"];

const INFINITE_HOURS = Array.from({ length: HOURS.length * REPEAT_COUNT }, (_, index) => HOURS[index % HOURS.length]);

const INFINITE_MINUTES = Array.from(
	{ length: MINUTES.length * REPEAT_COUNT },
	(_, index) => MINUTES[index % MINUTES.length]
);

export type TimePickerRef = {
	scrollToTime: (hour: number, minute: number, meridian: Meridian) => void;
};

const TimePicker = forwardRef<TimePickerRef>((_, ref) => {
	const initialTime = useMemo(() => getCurrentTimeSegments(), []);
	const [hour, setHour] = useState(initialTime.hour);
	const [minute, setMinute] = useState(initialTime.minute);
	const [meridian, setMeridian] = useState<Meridian>(initialTime.meridian as Meridian);

	const hourRef = useRef<FlatList<string>>(null);
	const minuteRef = useRef<FlatList<string>>(null);
	const meridianRef = useRef<FlatList<string>>(null);

	/*
	 * Shared values live on the UI thread.
	 *
	 * React does NOT re-render while the user is dragging.
	 */
	const hourScrollY = useSharedValue(0);
	const minuteScrollY = useSharedValue(0);
	const meridianScrollY = useSharedValue(0);

	/*
	 * Start around the middle of our repeated list.
	 *
	 * This gives us a huge amount of room to scroll
	 * in either direction.
	 */
	const middleRepeat = Math.floor(REPEAT_COUNT / 2);

	const initialHourIndex = middleRepeat * HOURS.length + (hour - 1);

	const initialMinuteIndex = middleRepeat * MINUTES.length + minute;

	const initialMeridianIndex = meridian === "AM" ? 0 : 1;

	useImperativeHandle(ref, () => ({
		scrollToTime: (h, m, mer) => {
			setHour(h);
			setMinute(m);
			setMeridian(mer);

			const hourIndex = middleRepeat * HOURS.length + (h - 1);
			const minuteIndex = middleRepeat * MINUTES.length + m;
			const meridianIndex = mer === "AM" ? 0 : 1;

			hourRef.current?.scrollToOffset({ offset: hourIndex * ITEM_HEIGHT, animated: true });
			minuteRef.current?.scrollToOffset({ offset: minuteIndex * ITEM_HEIGHT, animated: true });
			meridianRef.current?.scrollToOffset({ offset: meridianIndex * ITEM_HEIGHT, animated: true });
		},
	}));

	// Scroll Handlers
	const hourScrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			hourScrollY.value = event.contentOffset.y;
		},
	});

	const minuteScrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			minuteScrollY.value = event.contentOffset.y;
		},
	});

	const meridianScrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			meridianScrollY.value = event.contentOffset.y;
		},
	});

	// Hour Selection
	const handleHourMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const offset = event.nativeEvent.contentOffset.y;

		const index = Math.round(offset / ITEM_HEIGHT);

		/*
		 * Convert the repeated-list index back to
		 * the actual hour.
		 */
		const value = index % HOURS.length;

		const normalizedValue = value < 0 ? value + HOURS.length : value;

		const newHour = normalizedValue + 1;

		setHour(newHour);

		/*
		 * Re-center when approaching either end.
		 *
		 * This makes the scrolling effectively unlimited.
		 */
		if (index < HOURS.length * 3 || index > INFINITE_HOURS.length - HOURS.length * 3) {
			const middleIndex = middleRepeat * HOURS.length + normalizedValue;

			requestAnimationFrame(() => {
				hourRef.current?.scrollToOffset({
					offset: middleIndex * ITEM_HEIGHT,
					animated: false,
				});

				hourScrollY.value = middleIndex * ITEM_HEIGHT;
			});
		}
	};

	// Minute Selection
	const handleMinuteMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const offset = event.nativeEvent.contentOffset.y;

		const index = Math.round(offset / ITEM_HEIGHT);

		const value = index % MINUTES.length;

		const normalizedValue = value < 0 ? value + MINUTES.length : value;

		setMinute(normalizedValue);

		if (index < MINUTES.length * 3 || index > INFINITE_MINUTES.length - MINUTES.length * 3) {
			const middleIndex = middleRepeat * MINUTES.length + normalizedValue;

			requestAnimationFrame(() => {
				minuteRef.current?.scrollToOffset({
					offset: middleIndex * ITEM_HEIGHT,
					animated: false,
				});

				minuteScrollY.value = middleIndex * ITEM_HEIGHT;
			});
		}
	};

	// Meridian Selector
	const handleMeridianMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const offset = event.nativeEvent.contentOffset.y;
		const index = Math.round(offset / ITEM_HEIGHT);
		const normalizedValue = Math.max(0, Math.min(1, index));
		setMeridian(MERIDIANS[normalizedValue]);
	};

	return (
		<>
			<View className="bg-surface my-9 w-full rounded-2xl px-5 py-7">
				{/* Selected Time */}
				<View className="mb-7 items-center">
					<AppText className="font-interSBold color-gray-400 mb-2 text-sm">Selected time</AppText>

					<AppText className="font-interBold text-primary text-5xl">
						{String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}{" "}
						<AppText className="font-interBold text-3xl">{meridian}</AppText>
					</AppText>
				</View>

				{/* Picker*/}
				<View className="relative h-43 w-full overflow-hidden rounded-2xl">
					{/* Selected Row */}
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							top: ITEM_HEIGHT,
							left: 0,
							right: 0,
							height: ITEM_HEIGHT,
							zIndex: 10,
						}}
						className="bg-primary/5 border-primary/10 rounded-xl border"
					/>

					<View className="h-full flex-row items-center justify-center">
						{/* Hour */}
						<Animated.FlatList
							ref={hourRef as any}
							data={INFINITE_HOURS}
							keyExtractor={(_, index) => `hour-${index}`}
							renderItem={({ item, index }) => (
								<WheelItem item={item as string} index={index} scrollY={hourScrollY} width={72} />
							)}
							showsVerticalScrollIndicator={false}
							snapToInterval={ITEM_HEIGHT}
							decelerationRate="fast"
							bounces={false}
							overScrollMode="never"
							scrollEventThrottle={16}
							initialNumToRender={7}
							windowSize={5}
							maxToRenderPerBatch={5}
							contentContainerStyle={{
								paddingVertical: ITEM_HEIGHT,
							}}
							initialScrollIndex={initialHourIndex}
							getItemLayout={(_, index) => ({
								length: ITEM_HEIGHT,
								offset: ITEM_HEIGHT * index,
								index,
							})}
							onScroll={hourScrollHandler}
							onMomentumScrollEnd={handleHourMomentumEnd}
						/>

						{/* Colon */}
						<View
							style={{
								height: ITEM_HEIGHT,
								width: 24,
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<AppText className="font-interBold text-3xl">:</AppText>
						</View>

						{/* Minute */}
						<Animated.FlatList
							ref={minuteRef as any}
							data={INFINITE_MINUTES}
							keyExtractor={(_, index) => `minute-${index}`}
							renderItem={({ item, index }) => (
								<WheelItem item={item as string} index={index} scrollY={minuteScrollY} width={72} />
							)}
							showsVerticalScrollIndicator={false}
							snapToInterval={ITEM_HEIGHT}
							decelerationRate="fast"
							bounces={false}
							overScrollMode="never"
							scrollEventThrottle={16}
							initialNumToRender={7}
							windowSize={5}
							maxToRenderPerBatch={5}
							contentContainerStyle={{
								paddingVertical: ITEM_HEIGHT,
							}}
							initialScrollIndex={initialMinuteIndex}
							getItemLayout={(_, index) => ({
								length: ITEM_HEIGHT,
								offset: ITEM_HEIGHT * index,
								index,
							})}
							onScroll={minuteScrollHandler}
							onMomentumScrollEnd={handleMinuteMomentumEnd}
						/>

						{/* Meridian */}
						<Animated.FlatList
							ref={meridianRef as any}
							data={MERIDIANS}
							keyExtractor={(_, index) => `meridian-${index}`}
							renderItem={({ item, index }) => (
								<WheelItem
									item={item as string}
									index={index}
									scrollY={meridianScrollY}
									width={68}
									fontSize={24}
								/>
							)}
							showsVerticalScrollIndicator={false}
							snapToInterval={ITEM_HEIGHT}
							decelerationRate="fast"
							bounces={false}
							overScrollMode="never"
							scrollEventThrottle={16}
							initialNumToRender={7}
							windowSize={5}
							maxToRenderPerBatch={5}
							contentContainerStyle={{
								paddingVertical: ITEM_HEIGHT,
							}}
							initialScrollIndex={initialMeridianIndex}
							getItemLayout={(_, index) => ({
								length: ITEM_HEIGHT,
								offset: ITEM_HEIGHT * index,
								index,
							})}
							onScroll={meridianScrollHandler}
							onMomentumScrollEnd={handleMeridianMomentumEnd}
						/>
					</View>
				</View>

				{/* User Hint */}
				<View className="mt-6 items-center">
					<AppText className="font-inter color-gray-400 text-xs">Swipe up or down to adjust the time</AppText>
				</View>
			</View>
		</>
	);
});

TimePicker.displayName = "TimePicker";

export default TimePicker;
