import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../components/AppText";

const AboutScreen = () => {
	return (
		<View className="bg-background flex-1 p-4">
			<View className="border-border bg-surface flex-1 rounded-2xl border p-4">
				<View className="flex-row items-center gap-3">
					<Pressable onPress={() => router.back()} className="p-1">
						<MaterialIcons name="arrow-back-ios-new" size={24} color="#0F172A" />
					</Pressable>
					<AppText className="font-interSBold text-text text-3xl">About Taskt</AppText>
				</View>

				<View className="flex-1 items-center justify-center p-6">
					<AppText className="font-interBold text-text text-2xl">Taskt</AppText>
					<AppText className="text-secondary font-interMedium mt-1 text-sm">Version 0.0.1</AppText>
					<AppText className="text-secondary mt-4 text-center text-sm">
						A local-first task management application focused on privacy, user experience, and productivity.
					</AppText>
				</View>
			</View>
		</View>
	);
};

export default AboutScreen;
