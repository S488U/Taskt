import "../../global.css";
import { useEffect } from "react";

import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";

import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "../db";
import migrations from "../../drizzle/migrations";

import { SettingsProvider } from "../context/SettingsContext";
import { TaskDraftProvider } from "../context/TaskDraftContext";
import { setupNotificationChannel, requestNotificationPermissions } from "../utils/notificationService";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Root
const RootLayout = () => {
	const [fontsLoaded, fontError] = useFonts({
		InterRegular: require("../../assets/fonts/Inter-Regular.ttf"),
		InterMedium: require("../../assets/fonts/Inter-Medium.ttf"),
		InterSemiBold: require("../../assets/fonts/Inter-SemiBold.ttf"),
		InterBold: require("../../assets/fonts/Inter-Bold.ttf"),
	});

	const { success: isDbReady, error: dbError } = useMigrations(db, migrations);

	// Initialise Notifications
	useEffect(() => {
		const initialiseNotifications = async () => {
			try {
				await setupNotificationChannel();
				await requestNotificationPermissions();
			} catch (error) {
				console.error("Error setting up notifications:", error);
			}
		};

		initialiseNotifications();
	}, []);

	// Log errors if they occur
	useEffect(() => {
		if (fontError) {
			console.error("Font loading error:", fontError);
		}
		if (dbError) {
			console.error("Database migration error:", dbError);
		}
	}, [fontError, dbError]);

	// Hide splash screen once fonts and database are resolved
	useEffect(() => {
		if ((fontsLoaded || fontError) && (isDbReady || dbError)) {
			SplashScreen.hideAsync().catch((err) => {
				console.warn("Error hiding splash screen:", err);
			});
		}
	}, [fontsLoaded, fontError, isDbReady, dbError]);

	if ((!fontsLoaded && !fontError) || (!isDbReady && !dbError)) {
		return null;
	}
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SettingsProvider>
				<TaskDraftProvider>
					<SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
						<StatusBar style="dark" />
						<Stack screenOptions={{ headerShown: false }}></Stack>
					</SafeAreaView>
				</TaskDraftProvider>
			</SettingsProvider>
		</GestureHandlerRootView>
	);
};

export default RootLayout;
