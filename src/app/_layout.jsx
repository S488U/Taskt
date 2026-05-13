import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initDB } from "../db/migrations";

// Styles
import "../../global.css";

// Root
const RootLayout = () => {
	const [fontsLoaded] = useFonts({
		InterRegular: require("../../assets/fonts/Inter-Regular.ttf"),
		InterMedium: require("../../assets/fonts/Inter-Medium.ttf"),
		InterSemiBold: require("../../assets/fonts/Inter-SemiBold.ttf"),
		InterBold: require("../../assets/fonts/Inter-Bold.ttf"),
	});

	// Initialise Database
	useEffect(() => initDB(), []);

	if (!fontsLoaded) {
		return null;
	}
	return (
		<GestureHandlerRootView>
			<SafeAreaView className="flex-1 bg-background">
				<StatusBar style="dark" />
				<Stack screenOptions={{ headerShown: false }}></Stack>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
};

export default RootLayout;
