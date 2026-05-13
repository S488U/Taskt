import React, { useEffect, useRef } from "react";
import { Pressable, View, Animated } from "react-native";

interface checkBoxProps {
	value: boolean;
	onChange: (value: boolean) => void;
}

const CheckBox = ({ value, onChange }: checkBoxProps) => {
	const scaleAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

	useEffect(() => {
		Animated.spring(scaleAnim, {
			toValue: value ? 1 : 0,
			useNativeDriver: true,
			friction: 6,
		}).start();
	}, [value]);

	const toggleButton = () => {
		onChange(!value);
	};

	return (
		<Pressable onPress={toggleButton} className="items-center justify-center">
			<View className="h-14 w-10 items-center justify-center">
				<View className="h-7 w-7 items-center justify-center rounded-full border-2 border-primary">
					<Animated.View
						style={{
							transform: [{ scale: scaleAnim }],
						}}
						className="h-4 w-4 rounded-full bg-primary"
					/>
				</View>
			</View>
		</Pressable>
	);
};

export default CheckBox;
