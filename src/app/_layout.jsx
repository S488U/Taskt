import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { initDB } from "../db/migrations";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "../db";
import migrations from "../../drizzle/migrations";

// Styles
import "../../global.css";
import { useEffect } from "react";

// Root
const RootLayout = () => {
	const [fontsLoaded] = useFonts({
		InterRegular: require("../../assets/fonts/Inter-Regular.ttf"),
		InterMedium: require("../../assets/fonts/Inter-Medium.ttf"),
		InterSemiBold: require("../../assets/fonts/Inter-SemiBold.ttf"),
		InterBold: require("../../assets/fonts/Inter-Bold.ttf"),
	});

	// Initialise Database
	useEffect(() => {
		const initialiseDatabase = async () => {
			try {
				await migrate(db, migrations);
				console.log("Database migrations completed successfully");
			} catch (error) {
				console.error("Error connecting to database:", error);
			}
		};

		initialiseDatabase();
	}, []);

	if (!fontsLoaded) {
		return null;
	}
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
				<StatusBar style="dark" />
				<Stack screenOptions={{ headerShown: false }}></Stack>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
};

export default RootLayout;
