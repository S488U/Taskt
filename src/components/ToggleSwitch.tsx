import React, { useEffect, useState } from "react";
import { Animated, Pressable } from "react-native";

interface ToggleSwitchProps {
	value?: boolean;
	onValueChange?: (value: boolean) => void;
	disabled?: boolean;
}

const ToggleSwitch = ({ value, onValueChange, disabled = false }: ToggleSwitchProps) => {
	const isControlled = value !== undefined;
	const [internalValue, setInternalValue] = useState(false);
	const active = isControlled ? value : internalValue;

	const [animValue] = useState(() => new Animated.Value(active ? 1 : 0));

	useEffect(() => {
		Animated.spring(animValue, {
			toValue: active ? 1 : 0,
			useNativeDriver: true,
			bounciness: 4,
			speed: 14,
		}).start();
	}, [active, animValue]);

	const handlePress = () => {
		if (disabled) return;
		const nextValue = !active;
		if (!isControlled) {
			setInternalValue(nextValue);
		}
		onValueChange?.(nextValue);
	};

	const translateX = animValue.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 17],
	});

	return (
		<Pressable
			onPress={handlePress}
			disabled={disabled}
			accessibilityRole="switch"
			accessibilityState={{ checked: active, disabled }}
			className={`h-7 w-12 justify-center rounded-full p-1 ${
				disabled ? "opacity-50" : ""
			} ${active ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"}`}
		>
			<Animated.View
				style={{
					transform: [{ translateX }],
				}}
				className="h-5 w-5 rounded-full bg-white shadow-sm"
			/>
		</Pressable>
	);
};

export default ToggleSwitch;
