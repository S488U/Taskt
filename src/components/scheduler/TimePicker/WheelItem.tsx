import React from "react";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, SharedValue } from "react-native-reanimated";
import AppText from "../../AppText";

export const ITEM_HEIGHT = 52;

export type WheelItemProps = {
	item: string;
	index: number;
	scrollY: SharedValue<number>;
	width: number;
	fontSize?: number;
};

const WheelItem = ({ item, index, scrollY, width, fontSize = 30 }: WheelItemProps) => {
	const animatedStyle = useAnimatedStyle(() => {
		const position = scrollY.value / ITEM_HEIGHT;
		const distance = Math.abs(position - index);
		const scale = interpolate(distance, [0, 1, 2, 3], [1, 0.9, 0.78, 0.7], Extrapolation.CLAMP);
		const opacity = interpolate(distance, [0, 1, 2, 3], [1, 0.55, 0.25, 0], Extrapolation.CLAMP);
		return { opacity, transform: [{ scale }] };
	});

	return (
		<Animated.View
			style={[{ height: ITEM_HEIGHT, width, alignItems: "center", justifyContent: "center" }, animatedStyle]}
		>
			<AppText className="font-interBold" style={{ fontSize }}>
				{item}
			</AppText>
		</Animated.View>
	);
};

export default WheelItem;
