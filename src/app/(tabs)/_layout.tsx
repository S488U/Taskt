import { Tabs } from "expo-router";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabIconProps = {
	name: keyof typeof Ionicons.glyphMap;
	focusedName: keyof typeof Ionicons.glyphMap;
	focused: boolean;
};

const TabIcon = ({ name, focusedName, focused }: TabIconProps) => {
	return (
		<View
			style={{
				width: 58,
				height: 32,
				borderRadius: 16,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: focused ? "#EEF2FF" : "transparent",
			}}
		>
			<Ionicons name={focused ? focusedName : name} size={22} color={focused ? "#4F46E5" : "#64748B"} />
		</View>
	);
};

const TabLayout = () => {
	const insets = useSafeAreaInsets();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: "#0F172A",
				tabBarInactiveTintColor: "#64748B",
				tabBarStyle: {
					backgroundColor: "#FFFFFF",
					borderTopColor: "#E2E8F0",
					borderTopWidth: 1,
					height: 66 + (insets.bottom > 0 ? insets.bottom : 8),
					paddingTop: 6,
					paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
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
					tabBarIcon: ({ focused }) => <TabIcon name="home-outline" focusedName="home" focused={focused} />,
				}}
			/>
			<Tabs.Screen
				name="calendar"
				options={{
					title: "Calendar",
					tabBarIcon: ({ focused }) => (
						<TabIcon name="calendar-outline" focusedName="calendar" focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ focused }) => (
						<TabIcon name="settings-outline" focusedName="settings" focused={focused} />
					),
				}}
			/>
		</Tabs>
	);
};

export default TabLayout;
