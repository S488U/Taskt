import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import ProgressCircle from "./ProgressCircle";

const ProgressCard = ({ todoExtra }) => {
	const { length, status } = todoExtra;
	const progress = length === 0 ? 0 : status / length;
	const [displayPercent, setDisplayPercent] = useState(Math.round(progress * 100));
	const progressValue = useSharedValue(progress);
	const cardOpacity = useSharedValue(0);
	const cardTranslateY = useSharedValue(12);

	useEffect(() => {
		cardOpacity.value = withTiming(1, { duration: 260 });
		cardTranslateY.value = withTiming(0, { duration: 260 });
	}, [cardOpacity, cardTranslateY]);

	useEffect(() => {
		progressValue.value = withTiming(progress, { duration: 450 });
	}, [progress, progressValue]);

	useAnimatedReaction(
		() => Math.round(progressValue.value * 100),
		(value, previous) => {
			if (value !== previous) {
				scheduleOnRN(setDisplayPercent, value);
			}
		}
	);

	const cardAnimatedStyle = useAnimatedStyle(() => ({
		opacity: cardOpacity.value,
		transform: [{ translateY: cardTranslateY.value }],
	}));

	return (
		<Animated.View style={cardAnimatedStyle} className="mt-3 mb-5 w-full">
			<View className="border-secondary/20 bg-primary/10 w-full flex-row items-center justify-between rounded-3xl border p-4">
				<View className="flex-col gap-y-1">
					<Text className="font-interMedium text-primary text-lg">YOUR PROGRESS</Text>
					{displayPercent !== 0 ? (
						<Text className="font-interSBold text-xl">{displayPercent}% of tasks completed</Text>
					) : (
						<Text className="font-interSBold text-xl">Do a task to get completed!</Text>
					)}
				</View>
				<View>
					<ProgressCircle progress={progress} completed={status} total={length} />
				</View>
			</View>
		</Animated.View>
	);
};

export default ProgressCard;
