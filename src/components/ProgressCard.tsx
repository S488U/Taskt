import React, { useEffect, useMemo } from "react";
import { View, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import ProgressCircle from "./ProgressCircle";

interface ProgressCardProps {
	todoExtra: {
		length: number;
		status: number;
	};
}

const ProgressCard: React.FC<ProgressCardProps> = ({ todoExtra }) => {
	const { length, status } = todoExtra;
	const progress = length === 0 ? 0 : status / length;
	const displayPercent = useMemo(() => Math.round(progress * 100), [progress]);

	const cardOpacity = useSharedValue(0);
	const cardTranslateY = useSharedValue(12);

	useEffect(() => {
		cardOpacity.value = withTiming(1, { duration: 260 });
		cardTranslateY.value = withTiming(0, { duration: 260 });
	}, [cardOpacity, cardTranslateY]);

	const cardAnimatedStyle = useAnimatedStyle(() => ({
		opacity: cardOpacity.value,
		transform: [{ translateY: cardTranslateY.value }],
	}));

	return (
		<Animated.View style={cardAnimatedStyle} className="mb-5 w-full">
			<View className="border-secondary/20 my-3 bg-primary/10 w-full flex-row items-center justify-between rounded-3xl border p-4">
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

export default React.memo(ProgressCard);
