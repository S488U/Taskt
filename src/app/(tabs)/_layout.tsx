import { useEffect } from "react";
import { View, Pressable } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { useSettings } from "../../context/SettingsContext";
import { triggerHaptic } from "../../utils/haptics";

type TabIconProps = {
	name: keyof typeof Ionicons.glyphMap;
	focusedName: keyof typeof Ionicons.glyphMap;
	focused: boolean;
};

const AnimatedTabIcon = ({ name, focusedName, focused }: TabIconProps) => {
	const scaleX = useSharedValue(focused ? 1 : 0.3);
	const opacity = useSharedValue(focused ? 1 : 0);

	useEffect(() => {
		if (focused) {
			scaleX.value = withSpring(1, { damping: 14, stiffness: 160 });
			opacity.value = withTiming(1, { duration: 160 });
		} else {
			scaleX.value = withTiming(0.3, { duration: 140 });
			opacity.value = withTiming(0, { duration: 140 });
		}
	}, [focused, scaleX, opacity]);

	const pillAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scaleX: scaleX.value }],
		opacity: opacity.value,
	}));

	return (
		<View
			style={{
				width: 58,
				height: 32,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Animated.View
				style={[
					{
						position: "absolute",
						width: 58,
						height: 32,
						borderRadius: 16,
						backgroundColor: "#EEF2FF",
					},
					pillAnimatedStyle,
				]}
			/>
			<Ionicons name={focused ? focusedName : name} size={22} color={focused ? "#4F46E5" : "#64748B"} />
		</View>
	);
};

const TabLayout = () => {
	const insets = useSafeAreaInsets();
	const { hapticsEnabled } = useSettings();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: "#0F172A",
				tabBarInactiveTintColor: "#64748B",
				tabBarActiveBackgroundColor: "transparent",
				tabBarInactiveBackgroundColor: "transparent",
				tabBarButton: ({ android_ripple, ref, onPress, ...props }) => (
					<Pressable
						{...props}
						onPress={(e) => {
							triggerHaptic(hapticsEnabled, "selection");
							onPress?.(e);
						}}
						style={[props.style, { backgroundColor: "transparent" }]}
					/>
				),
				tabBarStyle: {
					backgroundColor: "#FFFFFF",
					borderTopColor: "#E2E8F0",
					borderTopWidth: 1,
					height: 66 + (insets.bottom > 0 ? insets.bottom : 8),
					paddingTop: 6,
					paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
				},
				tabBarItemStyle: {
					backgroundColor: "transparent",
				},
				tabBarLabelStyle: {
					fontFamily: "InterSemiBold",
					fontSize: 12,
					marginTop: 2,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ focused }) => (
						<AnimatedTabIcon name="home-outline" focusedName="home" focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="calendar"
				options={{
					title: "Calendar",
					tabBarIcon: ({ focused }) => (
						<AnimatedTabIcon name="calendar-outline" focusedName="calendar" focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ focused }) => (
						<AnimatedTabIcon name="settings-outline" focusedName="settings" focused={focused} />
					),
				}}
			/>
		</Tabs>
	);
};

export default TabLayout;
