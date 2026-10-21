import React, { memo, useState, useCallback } from "react";
import { View, Pressable, LayoutChangeEvent } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, SharedValue } from "react-native-reanimated";

// components
import AppText from "./AppText";
import CheckBox from "./CheckBox";
import PatternPill from "./PatternPill";

// utils
import { cardShadow } from "../utils/customShadow";
import type { TaskEntity } from "../features/tasks/task.types";

const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialIcons);

interface RightActionProps {
	progress: SharedValue<number>;
	dragX: SharedValue<number>;
	cardWidth: number;
}

const RightAction: React.FC<RightActionProps> = ({ progress, dragX, cardWidth }) => {
	const panelAnimatedStyle = useAnimatedStyle(() => {
		const revealedWidth = Math.min(Math.max(-dragX.value, 0), cardWidth);
		return { width: revealedWidth };
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
						borderTopRightRadius: 16,
						borderBottomRightRadius: 16,
						borderTopLeftRadius: 0,
						borderBottomLeftRadius: 0,
						backgroundColor: "#EF4444",
						height: "100%",
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

export interface CardProps {
	item: TaskEntity;
	onDelete?: (id: string) => void;
	onToggle?: (id: string, nextValue: boolean) => void;
	onPress?: (task: TaskEntity) => void;
}

const Card: React.FC<CardProps> = ({ item, onDelete, onToggle, onPress }) => {
	const [cardWidth, setCardWidth] = useState(0);

	const onLayout = useCallback((e: LayoutChangeEvent) => {
		const newWidth = e.nativeEvent.layout.width;
		setCardWidth((prev) => (prev === newWidth ? prev : newWidth));
	}, []);

	if (!item) return null;

	const id = item.id;
	const checked = item.status === "done";
	const title = item.title?.trim() || "";
	const desc = item.description?.trim();
	const pattern = item.kind ? (item.kind === "one_time" ? "one-time" : "recurring") : "one-time";
	const newTitle = title.length > 30 ? title.substring(0, 30) + "..." : title;

	const strikeThroughText = checked ? "line-through text-text/20" : "";
	const strikeSubText = checked ? "line-through text-secondary/20" : "text-secondary";
	const strikeBg = checked ? "bg-background" : "bg-surface";

	const handleToggle = (nextValue: boolean) => {
		onToggle?.(id, nextValue);
	};

	return (
		<Swipeable
			key={item.id}
			overshootRight={false}
			rightThreshold={cardWidth > 0 ? cardWidth * 0.75 : 200}
			containerStyle={{ overflow: "visible", marginBottom: 8 }}
			childrenContainerStyle={{ overflow: "visible" }}
			onSwipeableOpen={() => {
				onDelete?.(id);
			}}
			renderRightActions={(progress, dragX) => (
				<RightAction progress={progress} dragX={dragX} cardWidth={cardWidth} />
			)}
		>
			<View
				onLayout={onLayout}
				style={checked ? undefined : cardShadow}
				className={`${strikeBg} border-border h-max w-full flex-row gap-2 rounded-2xl p-3`}
			>
				<CheckBox value={checked} onChange={handleToggle} />
				<Pressable onPress={() => onPress?.(item)} className={`${strikeBg} flex-1`}>
					<View className="flex flex-row items-center">
						<AppText
							className={`${strikeThroughText} font-interMedium text-text flex-1 text-lg capitalize`}
						>
							{newTitle}
						</AppText>
						<PatternPill pattern={pattern} checked={checked} />
					</View>

					{desc && (
						<AppText className={`${strikeSubText} text-secondary h-fit`}>
							{desc.length > 95 ? desc.substring(0, 95) + "..." : desc}
						</AppText>
					)}
				</Pressable>
			</View>
		</Swipeable>
	);
};

export default memo(Card, (prev, next) => {
	return (
		prev.item.id === next.item.id &&
		prev.item.status === next.item.status &&
		prev.item.title === next.item.title &&
		prev.item.description === next.item.description &&
		prev.item.kind === next.item.kind &&
		prev.onDelete === next.onDelete &&
		prev.onToggle === next.onToggle &&
		prev.onPress === next.onPress
	);
});
