import { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
	useAnimatedProps,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";

type ProgressCircleProps = {
	progress?: number;
	completed?: number;
	total?: number;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressCircle = ({ progress = 0, completed = 0, total = 0 }: ProgressCircleProps) => {
	const size = 64;
	const strokeWidth = 6;

	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;

	// clamp progress between 0 and 1 (safety )
	const safeProgress = Math.min(Math.max(progress, 0), 1);
	const animatedProgress = useSharedValue(safeProgress);
	const labelScale = useSharedValue(1);

	useEffect(() => {
		animatedProgress.value = withTiming(safeProgress, {
			duration: 450,
		});
		labelScale.value = 0.92;
		labelScale.value = withSpring(1, {
			damping: 12,
			stiffness: 180,
		});
	}, [safeProgress]);

	const animatedCircleProps = useAnimatedProps(() => ({
		strokeDashoffset: circumference * (1 - animatedProgress.value),
	}));

	const labelAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: labelScale.value }],
	}));

	return (
		<View className="items-center justify-center">
			<Svg width={size} height={size}>
				{/* Background */}
				<Circle stroke="#E5E7EB" fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />

				{/* Progress */}
				<AnimatedCircle
					animatedProps={animatedCircleProps}
					stroke="#4F46E5"
					fill="none"
					cx={size / 2}
					cy={size / 2}
					r={radius}
					strokeWidth={strokeWidth}
					strokeDasharray={`${circumference} ${circumference}`}
					strokeLinecap="round"
					rotation="-90"
					origin={`${size / 2}, ${size / 2}`}
				/>
			</Svg>

			{/* Dynamic text */}
			<Animated.View style={[labelAnimatedStyle, { position: "absolute" }]}>
				<Text className="font-interSBold text-primary">{total === 0 ? "0/0" : `${completed}/${total}`}</Text>
			</Animated.View>
		</View>
	);
};

export default ProgressCircle;
