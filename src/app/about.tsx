import React from "react";
import { View, Image, Pressable, Linking } from "react-native";
import { router } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";

import AppText from "../components/AppText";
import { triggerHaptic } from "../utils/haptics";
import { useSettings } from "../context/SettingsContext";

const GITHUB_REPO_URL = "https://github.com/S488U/Taskt";

const AboutScreen = () => {
	const insets = useSafeAreaInsets();
	const { hapticsEnabled } = useSettings();
	const appVersion = Constants.expoConfig?.version ?? "0.0.1";

	const handleBack = () => {
		triggerHaptic(hapticsEnabled);
		router.back();
	};

	const handleOpenGitHub = async () => {
		try {
			triggerHaptic(hapticsEnabled);
			const supported = await Linking.canOpenURL(GITHUB_REPO_URL);
			if (supported) {
				await Linking.openURL(GITHUB_REPO_URL);
			}
		} catch (error) {
			console.error("Error opening GitHub URL:", error);
		}
	};

	return (
		<View
			className="bg-background flex-1 p-4"
			style={{
				paddingTop: insets.top > 0 ? insets.top + 8 : 16,
				paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
			}}
		>
			<View className="border-border bg-surface flex-1 justify-between rounded-3xl border p-6 shadow-sm">
				{/* Top Bar */}
				<View className="flex-row items-center gap-2">
					<Pressable
						onPress={handleBack}
						hitSlop={12}
						className="active:bg-secondary/10 -ml-2 rounded-full p-2"
					>
						<MaterialIcons name="arrow-back-ios-new" size={22} color="#0F172A" />
					</Pressable>
					<AppText className="font-interSBold text-text text-xl">About Taskt</AppText>
				</View>

				{/* Center Content: Logo, App Title, Dynamic Version, Philosophy */}
				<View className="items-center px-4">
					<View className="border-border/60 mb-5 rounded-3xl border bg-white p-3 shadow-md">
						<Image
							source={require("../../assets/logo.png")}
							style={{ width: 100, height: 100 }}
							resizeMode="contain"
						/>
					</View>

					<AppText className="font-interBold text-text text-3xl">Taskt</AppText>

					<View className="bg-primary/10 mt-2 mb-4 rounded-full px-3.5 py-1">
						<AppText className="font-interSBold text-primary text-xs">
							Version {appVersion}
						</AppText>
					</View>

					<AppText className="text-secondary font-inter text-center text-sm leading-6">
						A local-first task management application focused on privacy, user experience, and
						locale-aware productivity.
					</AppText>
				</View>

				{/* Bottom: GitHub Repo Link & Offline Notice */}
				<View className="gap-3">
					<Pressable
						onPress={handleOpenGitHub}
						className="border-border active:bg-secondary/10 flex-row items-center justify-between rounded-2xl border bg-slate-50/70 px-4 py-3.5"
					>
						<View className="flex-row items-center gap-3">
							<Ionicons name="logo-github" size={22} color="#0F172A" />
							<View>
								<AppText className="font-interMedium text-text text-sm">
									GitHub Repository
								</AppText>
								<AppText className="text-secondary font-inter text-xs">
									S488U / Taskt
								</AppText>
							</View>
						</View>
						<MaterialIcons name="open-in-new" size={20} color="#64748B" />
					</Pressable>

					<AppText className="text-secondary/70 font-inter text-center text-xs">
						100% Offline • SQLite Storage • Temporal API
					</AppText>
				</View>
			</View>
		</View>
	);
};

export default AboutScreen;
