import { View } from "react-native";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";

// components
import AppText from "./AppText";
import CheckBox from "./CheckBox";
import PatternPill from "./PatternPill";

//utils
import { cardShadow } from "../utils/customShadow";

const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialIcons);

const RightAction = ({ progress, dragX, cardWidth }) => {
	const panelAnimatedStyle = useAnimatedStyle(() => {
		const revealedWidth = Math.min(Math.max(-dragX.value, 0), cardWidth);

		return {
			width: revealedWidth,
		};
	});

	const binAnimatedStyle = useAnimatedStyle(() => {
		const revealedWidth = Math.min(Math.max(-dragX.value, 0), cardWidth);
		const revealRatio = cardWidth > 0 ? revealedWidth / cardWidth : 0;
		const clampedProgress = Math.min(Math.max(progress.value, revealRatio), 1);

		return {
			opacity: interpolate(clampedProgress, [0, 0.15, 1], [0.2, 0.75, 1], Extrapolation.CLAMP),
			transform: [
				{
					scale: interpolate(clampedProgress, [0, 1], [0.7, 1], Extrapolation.CLAMP),
				},
				{
					rotate: `${interpolate(clampedProgress, [0, 1], [12, 0], Extrapolation.CLAMP)}deg`,
				},
			],
		};
	});

	const labelAnimatedStyle = useAnimatedStyle(() => {
		const revealedWidth = Math.min(Math.max(-dragX.value, 0), cardWidth);
		const revealRatio = cardWidth > 0 ? revealedWidth / cardWidth : 0;
		const clampedProgress = Math.min(Math.max(progress.value, revealRatio), 1);

		return {
			opacity: interpolate(clampedProgress, [0.1, 1], [0, 1], Extrapolation.CLAMP),
			transform: [
				{
					translateY: interpolate(clampedProgress, [0.1, 1], [6, 0], Extrapolation.CLAMP),
				},
			],
		};
	});

	return (
		<View style={{ width: cardWidth }} className="items-end">
			<Animated.View
				style={[
					panelAnimatedStyle,
					{
						overflow: "hidden",
						borderRadius: 16,
						backgroundColor: "#EF4444",
					},
				]}
			>
				<View className="h-full w-full items-center justify-center">
					<View className="min-w-20 items-center justify-center gap-1.5">
						<AnimatedMaterialIcons
							name="delete-outline"
							size={28}
							color="#FFF7ED"
							style={binAnimatedStyle}
						/>
						<Animated.View style={labelAnimatedStyle}>
							<AppText className="font-interMedium text-surface text-xs tracking-wider uppercase">
								Delete
							</AppText>
						</Animated.View>
					</View>
				</View>
			</Animated.View>
		</View>
	);
};

const Card = ({ item, onDelete, onToggle }) => {
	const [cardWidth, setCardWidth] = useState(0);
	if (!item) return null;

	const id = item.id;
	const checked = item.status === "done" || item.status === true;
	const title = item.title?.trim() || "";
	const desc = item.description?.trim();
	const pattern = item.kind ? (item.kind === "one_time" ? "one-time" : "recurring") : item.pattern?.trim();
	let newTitle = title;
	if (title.length > 30) {
		newTitle = title.substring(0, 30) + "...";
	}

	const strikeThroughText = checked ? "line-through text-text/20" : "";
	const strikeSubText = checked ? "line-through text-secondary/20" : "text-secondary";
	const strikeBg = checked ? "bg-background" : "bg-surface";

	const handleToggle = (nextValue) => {
		onToggle?.(id, nextValue);
	};

	return (
		<Swipeable
			key={item.id}
			overshootRight={true}
			rightThreshold={40}
			onSwipeableOpen={() => {
				onDelete?.(id);
			}}
			renderRightActions={(progress, dragX) => (
				<RightAction progress={progress} dragX={dragX} cardWidth={cardWidth} />
			)}
		>
			<View
				onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
				style={cardShadow}
				className={` ${strikeBg} border-border mb-2 h-max w-full flex-row gap-2 rounded-2xl p-3 shadow-lg`}
			>
				<CheckBox value={checked} onChange={handleToggle} />
				<View className={` ${strikeBg} flex-1`}>
					<View className="flex flex-row items-center">
						<AppText
							className={`${strikeThroughText} font-interMedium text-text flex-1 text-lg capitalize`}
						>
							{newTitle}
						</AppText>
						<PatternPill pattern={pattern} checked={checked} />
					</View>

					{desc && (
						<AppText className={` ${strikeSubText} text-secondary h-fit`}>
							{desc.length > 95 ? desc.substring(0, 95) + "..." : desc}
						</AppText>
					)}
				</View>
			</View>
		</Swipeable>
	);
};

export default Card;
