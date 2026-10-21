import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";

export type EmptyStateType = "first_time" | "all_clear" | "calendar_empty";

export interface EmptyStateProps {
	type: EmptyStateType;
	title: string;
	description: string;
	buttonText?: string;
	secondaryButtonText?: string;
	onAction?: () => void;
	onSecondaryAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
	type,
	title,
	description,
	buttonText,
	secondaryButtonText,
	onAction,
	onSecondaryAction,
}) => {
	const iconName =
		type === "first_time"
			? "calendar-outline"
			: type === "all_clear"
				? "checkmark-circle-outline"
				: "calendar-clear-outline";

	return (
		<View className="flex-1 items-center justify-center px-6 py-8">
			{/* Multi-layered soft glow badge */}
			<View className="bg-primary/10 mb-6 h-28 w-28 items-center justify-center rounded-full">
				<View className="bg-surface h-20 w-20 items-center justify-center rounded-full border border-indigo-100 shadow-md">
					<Ionicons name={iconName} size={40} color="#4F46E5" />
				</View>
			</View>

			{/* Title & Description */}
			<AppText className="font-interBold text-text mb-2 text-center text-2xl">{title}</AppText>
			<AppText className="text-secondary font-inter mb-8 max-w-xs text-center text-sm leading-6">
				{description}
			</AppText>

			{/* Primary Action Button */}
			{buttonText && onAction && (
				<Pressable
					onPress={onAction}
					className="bg-primary flex-row items-center justify-center gap-2 rounded-full px-6 py-3.5 shadow-lg shadow-indigo-300 active:opacity-90"
				>
					<Ionicons name="add" size={20} color="#FFFFFF" />
					<AppText numberOfLines={1} className="font-interSBold text-base text-white">
						{buttonText}
					</AppText>
				</Pressable>
			)}

			{/* Secondary Action Link / Button */}
			{secondaryButtonText && onSecondaryAction && (
				<Pressable onPress={onSecondaryAction} className="active:bg-secondary/10 mt-3 rounded-full px-5 py-2">
					<AppText className="font-interMedium text-primary text-sm">{secondaryButtonText}</AppText>
				</Pressable>
			)}
		</View>
	);
};

export default React.memo(EmptyState);
